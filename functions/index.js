const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

// ─── Export all functions ─────────────────────────────────────────────────────
exports.createPaymentPreference = require('./createPaymentPreference')
exports.handlePaymentWebhook    = require('./handlePaymentWebhook')

// ─── Scheduled: Publish menus automatically every Friday at 10:00 AM ART ─────
exports.publishScheduledMenus = onSchedule(
  { schedule: '0 13 * * 5', timeZone: 'America/Argentina/Buenos_Aires' },
  async (event) => {
    const now   = admin.firestore.Timestamp.now()
    const snap  = await db.collection('menus')
      .where('status', '==', 'scheduled')
      .where('release_date', '<=', now)
      .get()

    const batch = db.batch()
    snap.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'published' })
    })
    await batch.commit()

    console.log(`Published ${snap.size} menu(s)`)
  }
)
