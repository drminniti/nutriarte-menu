/**
 * POST /api/create-subscription
 * Body: { uid, email }
 * Returns: { init_point }
 *
 * Devuelve el init_point del plan de Mercado Pago para que el usuario
 * autorice el débito automático mensual vía checkout.
 * Sin Firebase Admin — el webhook maneja la activación.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body || {}
  const uid   = body.uid
  const email = body.email

  if (!uid || !email) {
    return res.status(400).json({ error: 'uid y email son requeridos' })
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
  const PLAN_ID      = process.env.MP_PLAN_ID

  if (!ACCESS_TOKEN) {
    console.error('[create-subscription] MP_ACCESS_TOKEN no configurado')
    return res.status(500).json({ error: 'Configuración de pago incompleta' })
  }

  if (!PLAN_ID) {
    console.error('[create-subscription] MP_PLAN_ID no configurado')
    return res.status(500).json({ error: 'Plan de suscripción no configurado' })
  }

  try {
    console.log(`[create-subscription] Fetching plan ${PLAN_ID} for user ${uid} (${email})`)

    const planRes = await fetch(
      `https://api.mercadopago.com/preapproval_plan/${PLAN_ID}`,
      {
        method:  'GET',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }
    )

    const plan = await planRes.json()

    console.log('[create-subscription] Plan response status:', planRes.status)
    console.log('[create-subscription] Plan init_point:', plan.init_point)

    if (!planRes.ok) {
      console.error('[create-subscription] MP plan error:', plan)
      return res.status(502).json({
        error:   plan.message || 'Error al obtener el plan de suscripción',
        details: plan,
      })
    }

    if (!plan.init_point) {
      console.error('[create-subscription] No init_point in plan:', plan)
      return res.status(502).json({ error: 'El plan no tiene init_point' })
    }

    return res.status(200).json({
      init_point: plan.init_point,
    })

  } catch (err) {
    console.error('[create-subscription] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Error interno: ' + err.message })
  }
}
