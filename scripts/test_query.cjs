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

async function testQuery() {
  const config = getEnvConfig();
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
  const db = admin.firestore();
  
  const noteId = 'the-edulaw-bns-notes-along-with-landmark-judgements';
  
  console.log(`🔍 Testing query for noteId: ${noteId}`);
  
  try {
    console.log('1. Testing simple query (noteId only)...');
    const q1 = await db.collection('reviews').where('noteId', '==', noteId).get();
    console.log(`✅ Simple query successful. Found ${q1.size} reviews.`);
    
    console.log('2. Testing complex query (noteId + orderBy)...');
    const q2 = await db.collection('reviews').where('noteId', '==', noteId).orderBy('createdAt', 'desc').get();
    console.log(`✅ Complex query successful. Found ${q2.size} reviews.`);
  } catch (err) {
    console.error('❌ Query failed:', err.message);
    if (err.message.includes('FAILED_PRECONDITION')) {
      console.log('\n--- INDEX NEEDED ---');
      console.log('This query requires a composite index. Firestore usually provides a link in the error message to create it.');
    }
  }
  process.exit(0);
}

testQuery();
