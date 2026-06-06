import { MercadoPagoConfig, Preference } from 'mercadopago'

/**
 * POST /api/create-preference
 * Body: { uid, email }
 * Returns: { preference_id, init_point }
 *
 * Called from the frontend Suscribirse page.
 * Credentials stored as Vercel Environment Variables.
 */
export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid, email } = req.body

  if (!uid || !email) {
    return res.status(400).json({ error: 'uid y email son requeridos' })
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    })

    const preference = new Preference(client)

    const appUrl = process.env.APP_URL || 'https://nutriarte-menu.vercel.app'

    const response = await preference.create({
      body: {
        items: [{
          id:          'nutriarte-mensual',
          title:       'Nutriarte – Menú Semanal (Plan Mensual)',
          description: 'Acceso mensual a menús semanales, lista de compras y tips nutricionales.',
          quantity:    1,
          currency_id: 'ARS',
          unit_price:  4500,
        }],
        payer:              { email },
        external_reference: uid,           // Used to identify user in webhook
        back_urls: {
          success: `${appUrl}/dashboard?pago=ok`,
          failure: `${appUrl}/suscribirse?pago=error`,
          pending: `${appUrl}/suscribirse?pago=pendiente`,
        },
        auto_return:         'approved',
        notification_url:    `${appUrl}/api/mp-webhook`,
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 1,
        },
      },
    })

    return res.status(200).json({
      preference_id: response.id,
      init_point:    response.init_point,
    })
  } catch (error) {
    console.error('[create-preference] Error:', error)
    return res.status(500).json({ error: 'Error al crear preferencia de pago' })
  }
}
