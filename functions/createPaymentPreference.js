const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const { MercadoPagoConfig, Preference } = require('mercadopago')

/**
 * createPaymentPreference
 * Called from the frontend to generate a Mercado Pago payment link.
 * The user never interacts with MP credentials directly.
 */
exports.createPaymentPreference = onCall(
  { secrets: ['MERCADOPAGO_ACCESS_TOKEN'] },
  async (request) => {
    // 1. Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debés iniciar sesión para suscribirte.')
    }

    const uid   = request.auth.uid
    const email = request.auth.token.email

    // 2. Initialize MP client
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    })

    // 3. Build preference
    const preference = new Preference(client)
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
        payer:            { email },
        external_reference: uid,  // Used to identify user in webhook
        back_urls: {
          success: `${process.env.APP_URL}/dashboard?pago=ok`,
          failure: `${process.env.APP_URL}/suscribirse?pago=error`,
          pending: `${process.env.APP_URL}/suscribirse?pago=pendiente`,
        },
        auto_return:         'approved',
        notification_url:    `${process.env.FUNCTIONS_URL}/handlePaymentWebhook`,
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 1,
        },
      },
    })

    return {
      preference_id: response.id,
      init_point:    response.init_point,  // Redirect URL
    }
  }
)
