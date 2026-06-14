import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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

/**
 * GET /api/expire-subscriptions
 * Cron diario: marca como 'inactive' las suscripciones cuya fecha venció.
 * Protegido por Vercel CRON_SECRET.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed')

  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const now = new Date()
    console.log('[expire-subscriptions] Running at', now.toISOString())

    // Obtener todos los usuarios con suscripción activa
    const snap = await db.collection('users')
      .where('subscription_status', '==', 'active')
      .get()

    if (snap.empty) {
      return res.status(200).json({ expired: 0, message: 'No active subscriptions' })
    }

    const batch   = db.batch()
    const expired = []

    snap.docs.forEach(docSnap => {
      const data    = docSnap.data()
      const endDate = data.subscription_end_date

      if (!endDate) return // Sin fecha → no expira (ej: admin manual)

      const endMs = endDate.toDate
        ? endDate.toDate().getTime()
        : endDate.seconds * 1000

      if (endMs < now.getTime()) {
        batch.update(docSnap.ref, {
          subscription_status: 'inactive',
          updated_at:          now,
        })
        expired.push({ uid: docSnap.id, email: data.email, endMs })
        console.log(`[expire-subscriptions] Expiring ${data.email} (ended ${new Date(endMs).toISOString()})`)
      }
    })

    if (expired.length > 0) {
      await batch.commit()
      console.log(`[expire-subscriptions] Expired ${expired.length} subscriptions`)
    }

    return res.status(200).json({
      checked: snap.size,
      expired: expired.length,
      users:   expired.map(u => u.email),
    })
  } catch (err) {
    console.error('[expire-subscriptions] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
