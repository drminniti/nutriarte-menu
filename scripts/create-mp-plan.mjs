/**
 * Script de configuración ONE-TIME para Mercado Pago Subscriptions.
 * Crea el plan de suscripción mensual en MP y muestra el MP_PLAN_ID
 * que hay que agregar como variable de entorno en Vercel.
 *
 * Uso:
 *   1. Asegurate de tener MP_ACCESS_TOKEN en el entorno:
 *      export MP_ACCESS_TOKEN="APP_USR-..."
 *
 *   2. Ejecutá:
 *      node scripts/create-mp-plan.mjs
 *
 *   3. Copiá el PLAN_ID que aparece y agregalo en Vercel:
 *      MP_PLAN_ID = <el valor>
 */

import 'dotenv/config'

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ MP_ACCESS_TOKEN no está definida en el entorno.')
  console.error('   Ejecutá: export MP_ACCESS_TOKEN="APP_USR-..."')
  process.exit(1)
}

const APP_URL = process.env.APP_URL || 'https://nutriarte-menu.vercel.app'
const AMOUNT  = Number(process.env.PLAN_AMOUNT || 4500)

console.log('📡 Creando plan de suscripción en Mercado Pago...')
console.log(`   Token: ${ACCESS_TOKEN.slice(0, 20)}...`)
console.log(`   Monto: $${AMOUNT} ARS/mes`)
console.log('')

try {
  const res = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      reason:         'Nutriarte – Menú Semanal Mensual',
      auto_recurring: {
        frequency:          1,
        frequency_type:     'months',
        transaction_amount: AMOUNT,
        currency_id:        'ARS',
      },
      back_url: `${APP_URL}/dashboard`,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('❌ Error de Mercado Pago:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  console.log('✅ Plan creado exitosamente!')
  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log(`   PLAN_ID  : ${data.id}`)
  console.log(`   Estado   : ${data.status}`)
  console.log(`   Monto    : $${data.auto_recurring?.transaction_amount} ${data.auto_recurring?.currency_id}/mes`)
  console.log('═══════════════════════════════════════════════════')
  console.log('')
  console.log('📋 Paso siguiente: Agregá esta variable en Vercel:')
  console.log(`   MP_PLAN_ID = ${data.id}`)
  console.log('')
  console.log('   vercel env add MP_PLAN_ID production')

} catch (err) {
  console.error('❌ Error de red:', err.message)
  process.exit(1)
}
