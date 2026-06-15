/**
 * POST /api/create-subscription
 * Body: { uid, email }
 * Returns: { init_point }
 *
 * En producción, MP requiere que el usuario ingrese su tarjeta vía checkout.
 * Usamos el init_point del plan directamente (sin crear un preapproval previo).
 * El UID se guarda en Firestore antes de redirigir para que el webhook
 * pueda resolver el usuario por email.
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid, email } = req.body

  if (!uid || !email) {
    return res.status(400).json({ error: 'uid y email son requeridos' })
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
  const PLAN_ID      = process.env.MP_PLAN_ID
  const APP_URL      = process.env.APP_URL || 'https://nutriarte-menu.vercel.app'

  if (!ACCESS_TOKEN || !PLAN_ID) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN o MP_PLAN_ID no configurados' })
  }

  try {
    // 1. Obtener el init_point del plan
    const planRes = await fetch(
      `https://api.mercadopago.com/preapproval_plan/${PLAN_ID}`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    )
    const plan = await planRes.json()

    if (!planRes.ok || !plan.init_point) {
      console.error('[create-subscription] Plan error:', plan)
      return res.status(500).json({ error: 'No se pudo obtener el plan de suscripción' })
    }

    // 2. Asegurar que el usuario existe en Firestore con su email
    //    (el webhook lo resuelve por email si no hay external_reference)
    await db.collection('users').doc(uid).set({
      email,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true })

    // 3. El init_point redirige a MP checkout donde el usuario autoriza el débito automático
    //    back_url: MP redirige aquí después de autorizar
    const initPoint = `${plan.init_point}&back_url=${encodeURIComponent(`${APP_URL}/dashboard?suscripcion=ok`)}`

    console.log(`[create-subscription] Redirecting user ${uid} (${email}) to plan checkout`)

    return res.status(200).json({
      subscription_id: null,   // MP lo crea cuando el usuario autoriza
      init_point:      plan.init_point,
    })
  } catch (err) {
    console.error('[create-subscription] Error:', err)
    return res.status(500).json({ error: 'Error interno al crear suscripción' })
  }
}
