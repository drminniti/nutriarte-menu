import crypto from 'crypto'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin (only once across hot-reloads)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Newlines in env vars need to be unescaped
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

/**
 * POST /api/mp-webhook
 * Receives payment notifications from Mercado Pago.
 * Verifies HMAC-SHA256 signature and updates user subscription in Firestore.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    // 1. Verify MP signature (HMAC-SHA256)
    const secret     = process.env.MP_WEBHOOK_SECRET
    const xSignature = req.headers['x-signature']  || ''
    const xRequestId = req.headers['x-request-id'] || ''
    const dataId     = req.query['data.id']         || ''

    const tsPart          = xSignature.split(',').find(s => s.startsWith('ts='))?.replace('ts=', '') || ''
    const signedTemplate  = `id:${dataId};request-id:${xRequestId};ts:${tsPart};`
    const v1part          = xSignature.split(',').find(s => s.startsWith('v1='))
    const receivedHash    = v1part?.replace('v1=', '') || ''

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(signedTemplate)
    const expectedHash = hmac.digest('hex')

    if (secret && receivedHash !== expectedHash) {
      console.warn('[mp-webhook] Invalid signature')
      return res.status(401).send('Unauthorized')
    }

    // 2. Parse event type
    const { type, data } = req.body

    if (type !== 'payment') {
      return res.status(200).send('Event type ignored')
    }

    // 3. Fetch payment details from MP API
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${data.id}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
    )
    const payment = await mpResponse.json()

    const uid    = payment.external_reference
    const status = payment.status  // 'approved' | 'rejected' | 'cancelled'

    if (!uid) {
      console.error('[mp-webhook] No external_reference in payment', data.id)
      return res.status(200).send('OK – no uid')
    }

    // 4. Update Firestore
    const userRef = db.collection('users').doc(uid)

    if (status === 'approved') {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)
      await userRef.update({
        subscription_status:   'active',
        subscription_end_date: Timestamp.fromDate(endDate),
        payment_provider:      'mercadopago',
        last_payment_id:       String(data.id),
        updated_at:            FieldValue.serverTimestamp(),
      })
      console.log(`✅ Subscription activated for user ${uid}`)
    } else if (status === 'rejected') {
      await userRef.update({
        subscription_status: 'past_due',
        updated_at:          FieldValue.serverTimestamp(),
      })
    } else if (status === 'cancelled') {
      await userRef.update({
        subscription_status: 'canceled',
        updated_at:          FieldValue.serverTimestamp(),
      })
    }

    return res.status(200).send('OK')
  } catch (err) {
    console.error('[mp-webhook] Error:', err)
    return res.status(200).send('OK – error logged')
  }
}
