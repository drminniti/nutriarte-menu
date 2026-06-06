const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const crypto = require('crypto')

const db = admin.firestore()

/**
 * handlePaymentWebhook
 * Receives payment notifications from Mercado Pago via webhook.
 * Verifies cryptographic signature and updates user subscription status.
 *
 * MP Webhook docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
exports.handlePaymentWebhook = onRequest(
  { secrets: ['MERCADOPAGO_WEBHOOK_SECRET', 'MERCADOPAGO_ACCESS_TOKEN'] },
  async (req, res) => {
    // 1. Only accept POST
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed')
    }

    try {
      // 2. Verify MP signature (HMAC-SHA256)
      const secret    = process.env.MERCADOPAGO_WEBHOOK_SECRET
      const xSignature = req.headers['x-signature']       || ''
      const xRequestId = req.headers['x-request-id']      || ''
      const dataId     = req.query['data.id']              || ''

      const signedTemplate = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(',').find(s => s.startsWith('ts=')).replace('ts=', '')};`
      const [, v1part]     = xSignature.split(',')
      const receivedHash   = v1part?.replace('v1=', '') || ''

      const hmac          = crypto.createHmac('sha256', secret)
      hmac.update(signedTemplate)
      const expectedHash  = hmac.digest('hex')

      if (receivedHash !== expectedHash) {
        console.warn('Invalid webhook signature')
        return res.status(401).send('Unauthorized')
      }

      // 3. Parse event
      const { type, data } = req.body

      if (type !== 'payment') {
        return res.status(200).send('Event type ignored')
      }

      // 4. Fetch payment details from MP API
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        { headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` } }
      )
      const payment = await mpResponse.json()

      const uid    = payment.external_reference  // Set in createPaymentPreference
      const status = payment.status              // 'approved' | 'rejected' | 'cancelled'

      if (!uid) {
        console.error('No external_reference (uid) in payment', data.id)
        return res.status(200).send('OK – no uid')
      }

      // 5. Update Firestore based on payment status
      const userRef = db.collection('users').doc(uid)

      if (status === 'approved') {
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        await userRef.update({
          subscription_status:    'active',
          subscription_end_date:  admin.firestore.Timestamp.fromDate(endDate),
          payment_provider:       'mercadopago',
          last_payment_id:        String(data.id),
          updated_at:             admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log(`✅ Subscription activated for user ${uid}`)
      } else if (status === 'rejected') {
        await userRef.update({
          subscription_status: 'past_due',
          updated_at:          admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log(`⚠️ Payment rejected for user ${uid}`)
      } else if (status === 'cancelled') {
        await userRef.update({
          subscription_status: 'canceled',
          updated_at:          admin.firestore.FieldValue.serverTimestamp(),
        })
        console.log(`🚫 Payment cancelled for user ${uid}`)
      }

      // 6. Always return 200 so MP doesn't retry
      return res.status(200).send('OK')

    } catch (err) {
      console.error('Webhook error:', err)
      // Return 200 to avoid MP retrying a broken event
      return res.status(200).send('OK – error logged')
    }
  }
)
