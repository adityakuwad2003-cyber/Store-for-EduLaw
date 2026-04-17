const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function getEnvConfig() {
  const envPath = path.resolve(__dirname, '../.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const config = {};
  content.split('\n').forEach(line => {
    const [key, ...valParts] = line.split('=');
    if (key && valParts.length > 0) {
      config[key.trim()] = valParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
  return config;
}

async function debug() {
  const config = getEnvConfig();
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
  const db = admin.firestore();
  console.log('--- NOTES COLLECTION ---');
  const notesSnap = await db.collection('notes').limit(5).get();
  notesSnap.forEach(doc => {
    console.log(`DocID: ${doc.id} | Data.id: ${doc.data().id} | Data.slug: ${doc.data().slug}`);
  });
  
  console.log('\n--- REVIEWS COLLECTION (SAMPLE) ---');
  const reviewsSnap = await db.collection('reviews').limit(5).get();
  reviewsSnap.forEach(doc => {
    console.log(`ReviewID: ${doc.id} | noteId: ${doc.data().noteId} | userName: ${doc.data().userName}`);
  });
  process.exit(0);
}

debug();
