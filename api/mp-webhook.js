import crypto from 'crypto'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mpGet = (path) =>
  fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  }).then(r => r.json())

const activateSubscription = async (uid, extraFields = {}) => {
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)
  await db.collection('users').doc(uid).set({
    subscription_status:   'active',
    subscription_end_date: Timestamp.fromDate(endDate),
    payment_provider:      'mercadopago',
    updated_at:            FieldValue.serverTimestamp(),
    ...extraFields,
  }, { merge: true })
  console.log(`✅ Subscription activated for user ${uid} until ${endDate.toISOString()}`)
}

// ─── Handler ───────────────────────────────────────────────────────────────────

/**
 * POST /api/mp-webhook
 * Handles Mercado Pago payment and subscription events.
 * Verifies HMAC-SHA256 signature.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  try {
    // 1. Verify HMAC signature
    const secret     = process.env.MP_WEBHOOK_SECRET
    const xSignature = req.headers['x-signature']  || ''
    const xRequestId = req.headers['x-request-id'] || ''
    const dataId     = req.query['data.id']         || ''

    const tsPart         = xSignature.split(',').find(s => s.startsWith('ts='))?.replace('ts=', '') || ''
    const signedTemplate = `id:${dataId};request-id:${xRequestId};ts:${tsPart};`
    const v1part         = xSignature.split(',').find(s => s.startsWith('v1='))
    const receivedHash   = v1part?.replace('v1=', '') || ''

    const expectedHash = crypto.createHmac('sha256', secret || '').update(signedTemplate).digest('hex')

    if (secret && receivedHash !== expectedHash) {
      console.warn('[mp-webhook] Invalid signature')
      return res.status(401).send('Unauthorized')
    }

    const { type, data } = req.body
    console.log(`[mp-webhook] Event: ${type}`, data?.id)

    // ─── 2. Subscription status change ───────────────────────────────────
    if (type === 'subscription_preapproval') {
      const subscription = await mpGet(`/preapproval/${data.id}`)
      const uid          = subscription.external_reference
      const status       = subscription.status // authorized | paused | cancelled | pending

      if (!uid) {
        console.error('[mp-webhook] No external_reference in subscription', data.id)
        return res.status(200).send('OK – no uid')
      }

      if (status === 'authorized') {
        await activateSubscription(uid, {
          mp_subscription_id: data.id,
          mp_plan_id:         subscription.preapproval_plan_id,
        })
      } else if (status === 'cancelled') {
        await db.collection('users').doc(uid).set({
          subscription_status: 'inactive',
          mp_subscription_id:  null,
          updated_at:          FieldValue.serverTimestamp(),
        }, { merge: true })
        console.log(`🚫 Subscription cancelled for user ${uid}`)
      } else if (status === 'paused') {
        await db.collection('users').doc(uid).set({
          subscription_status: 'past_due',
          updated_at:          FieldValue.serverTimestamp(),
        }, { merge: true })
        console.log(`⏸️  Subscription paused for user ${uid}`)
      } else {
        console.log(`[mp-webhook] Subscription status ignored: ${status}`)
      }

      return res.status(200).send('OK')
    }

    // ─── 3. Payment event (one-time OR recurring subscription charge) ─────
    if (type === 'payment') {
      const payment = await mpGet(`/v1/payments/${data.id}`)
      const status  = payment.status // approved | rejected | cancelled

      // Try to resolve user UID from external_reference or via subscription
      let uid = payment.external_reference

      // For recurring subscription payments, external_reference may be on the preapproval
      if (!uid && payment.metadata?.preapproval_id) {
        const sub = await mpGet(`/preapproval/${payment.metadata.preapproval_id}`)
        uid = sub?.external_reference
      }

      if (!uid) {
        console.error('[mp-webhook] No uid resolved for payment', data.id)
        return res.status(200).send('OK – no uid')
      }

      if (status === 'approved') {
        await activateSubscription(uid, { last_payment_id: String(data.id) })
      } else if (status === 'rejected') {
        await db.collection('users').doc(uid).set({
          subscription_status: 'past_due',
          updated_at:          FieldValue.serverTimestamp(),
        }, { merge: true })
      } else if (status === 'cancelled') {
        await db.collection('users').doc(uid).set({
          subscription_status: 'inactive',
          updated_at:          FieldValue.serverTimestamp(),
        }, { merge: true })
      }

      return res.status(200).send('OK')
    }

    // Unknown event type — ack but ignore
    console.log(`[mp-webhook] Event type ignored: ${type}`)
    return res.status(200).send('OK – event ignored')

  } catch (err) {
    console.error('[mp-webhook] Error:', err)
    return res.status(200).send('OK – error logged')
  }
}
