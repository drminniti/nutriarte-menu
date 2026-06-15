/**
 * POST /api/create-subscription
 * Body: { uid, email }
 * Returns: { subscription_id, init_point }
 *
 * Crea una suscripción automática mensual en Mercado Pago (PreApproval).
 * El usuario aprueba el cobro automático una sola vez y MP se encarga de cobrar cada mes.
 *
 * Requiere en Vercel:
 *   MP_ACCESS_TOKEN = "APP_USR-..."
 *   MP_PLAN_ID      = el ID del plan creado con scripts/create-mp-plan.mjs
 *   APP_URL         = "https://nutriarte-menu.vercel.app"
 */
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

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado' })
  }

  try {
    let body

    if (PLAN_ID) {
      // ─── Con Plan (recomendado para producción) ───────────────────────
      // El plan define monto y frecuencia. La suscripción queda atada al plan.
      body = {
        preapproval_plan_id: PLAN_ID,
        payer_email:         email,
        external_reference:  uid,
        back_url:            `${APP_URL}/dashboard?suscripcion=ok`,
      }
    } else {
      // ─── Sin Plan (fallback — define los parámetros inline) ───────────
      const startDate = new Date().toISOString()
      body = {
        reason:             'Nutriarte – Menú Semanal Mensual',
        payer_email:        email,
        external_reference: uid,
        auto_recurring: {
          frequency:          1,
          frequency_type:     'months',
          transaction_amount: 4500,
          currency_id:        'ARS',
          start_date:         startDate,
        },
        back_url: `${APP_URL}/dashboard?suscripcion=ok`,
        status:   'pending',
      }
    }

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await mpRes.json()

    if (!mpRes.ok) {
      console.error('[create-subscription] MP error:', data)
      return res.status(500).json({ error: data.message || 'Error al crear suscripción en Mercado Pago' })
    }

    console.log(`[create-subscription] Created subscription ${data.id} for user ${uid}`)

    return res.status(200).json({
      subscription_id: data.id,
      init_point:      data.init_point,
    })
  } catch (err) {
    console.error('[create-subscription] Error:', err)
    return res.status(500).json({ error: 'Error interno al crear suscripción' })
  }
}
