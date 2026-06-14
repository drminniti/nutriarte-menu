import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin (only once)
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
 * GET /api/publish-scheduled
 * Cron job: Publishes menus whose release_date has passed and status is 'scheduled'.
 * Archives any previously published menus before publishing the new one.
 * Protected by Vercel's CRON_SECRET.
 */
export default async function handler(req, res) {
  // Only allow GET (Vercel cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed')
  }

  // Authenticate: Vercel injects CRON_SECRET automatically
  const authHeader = req.headers.authorization
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const now = new Date()
    console.log('[publish-scheduled] Running at', now.toISOString())

    // 1. Get all scheduled menus
    const scheduledSnap = await db
      .collection('menus')
      .where('status', '==', 'scheduled')
      .get()

    if (scheduledSnap.empty) {
      console.log('[publish-scheduled] No scheduled menus found')
      return res.status(200).json({ published: 0, message: 'No scheduled menus' })
    }

    // 2. Filter those whose release_date <= now
    const toPublish = scheduledSnap.docs.filter(doc => {
      const rd = doc.data().release_date
      if (!rd) return false
      const releaseDate = rd.toDate ? rd.toDate() : new Date(rd.seconds * 1000)
      return releaseDate <= now
    })

    if (toPublish.length === 0) {
      console.log('[publish-scheduled] No menus ready to publish yet')
      return res.status(200).json({ published: 0, message: 'No menus ready yet' })
    }

    // 3. Archive all currently published menus
    const publishedSnap = await db
      .collection('menus')
      .where('status', '==', 'published')
      .get()

    const batch = db.batch()

    publishedSnap.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'archived', updated_at: now })
      console.log('[publish-scheduled] Archiving:', doc.id)
    })

    // 4. Publish the newest scheduled menu (by week_id)
    const sorted = toPublish.sort((a, b) =>
      b.data().week_id.localeCompare(a.data().week_id)
    )
    const menuToPublish = sorted[0]

    batch.update(menuToPublish.ref, { status: 'published', updated_at: now })
    console.log('[publish-scheduled] Publishing:', menuToPublish.id)

    // 5. Keep extra scheduled menus as-is (they'll be picked up in future runs)
    await batch.commit()

    return res.status(200).json({
      published: menuToPublish.id,
      archived:  publishedSnap.docs.map(d => d.id),
    })
  } catch (err) {
    console.error('[publish-scheduled] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
