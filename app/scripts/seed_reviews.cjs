const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Constants
const NOTES_COLLECTION = 'notes';
const REVIEWS_COLLECTION = 'reviews';

// Pool of Realistic Indian Names
const names = [
  "Abhishek Nair", "Aditi Rao", "Akash Gupta", "Ananya Sharma", "Arjun Malhotra",
  "Deepika Reddy", "Hiten Shah", "Ishaan Kapoor", "Kavya Iyer", "Manish Verma",
  "Megha Bansal", "Nikhil Joshi", "Pooja Hegde", "Pranav Deshmukh", "Riya Chatterjee",
  "Sandeep Kulkarni", "Sanya Mirza", "Siddharth Mehra", "Tanvi Agarwal", "Vikram Rathore",
  "Pankaj Bisht", "Ishita Saini", "Yuvraj Singh Chouhan", "Shruti Kulkarni", "Aditya Jha",
  "Meghna Reddy", "Sandeep Vashisht", "Abhay Gupta", "Kavya Murthy", "Manish Tiwari"
];

// Pool of Prestigious Indian Law Schools
const colleges = [
  "NLU Delhi", "GLC Mumbai", "ILS Pune", "NALSAR Hyderabad", "NLSIU Bangalore",
  "WBNUJS Kolkata", "GNLU Gandhinagar", "Faculty of Law, DU", "NLU Jodhpur",
  "Symbiosis Law School, Pune", "Jindal Global Law School", "Lloyd Law College",
  "Amity Law School", "BHU Law Faculty", "NLU Shimla", "RMLNLU Lucknow",
  "TNNLU Trichy", "RGSOIPL IIT Kharagpur", "Law Centre-1, DU"
];

// Pool of Review Texts (Realistic & Professional)
const generalReviews = [
  "Excellent notes, very helpful for my semester exams. The language is simple and concepts are well explained.",
  "Must buy for any law student preparing for judiciary exams. The case law summaries are top-notch.",
  "Very comprehensive and well-structured. It covers all the important topics in detail.",
  "I love the flowcharts and diagrams! They make complex legal concepts so much easier to grasp.",
  "High-quality material. The PDF quality is great and the content is very reliable.",
  "Highly recommended for CLAT PG aspirants. The landmark judgment section is particularly good.",
  "Great value for money. These notes are much better than the standard textbooks for quick revisions.",
  "Solid content. Helped me score 80+ in my University examinations.",
  "The indexing is perfect. It's so easy to find specific sections and case laws when you're in a hurry.",
  "Very impressed with the depth of research in these notes. Definitely worth the investment."
];

const bnssReviews = [
  "The best resource for new criminal laws. The comparison between old and new sections saved me tons of time.",
  "The BNSS notes are a lifesaver. The transition from CrPC was made so smooth by these materials.",
  "Finally found notes that actually explain the practical shifts in BNSS 2023. Very updated.",
  "Detailed analysis of the new procedural changes. Every law student should have this for the new curriculum.",
  "The volume-wise breakdown of BNSS is brilliant. Vol 1 & 2 are especially helpful for basics.",
  "Comprehensive coverage of the new BNSS sections. The tabular comparison with CrPC is the highlights.",
  "Really helped me understand the changes in FIR and investigation procedures under the new Sanhitas."
];

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number between min and max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Parse .env.local for Firebase keys
function getEnvConfig() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) throw new Error('.env.local not found');
  
  const content = fs.readFileSync(envPath, 'utf8');
  const config = {};
  content.split('\n').forEach(line => {
    const [key, ...valParts] = line.split('=');
    if (key && valParts.length > 0) {
      let value = valParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      config[key.trim()] = value;
    }
  });
  return config;
}

async function seed() {
  console.log('🚀 Initializing Review Seeding...');
  
  const config = getEnvConfig();
  
  // Format private key correctly (it has \n escaped characters)
  const privateKey = config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });

  const db = admin.firestore();
  
  // 1. Fetch all notes
  console.log('📦 Fetching all courses...');
  const notesSnap = await db.collection(NOTES_COLLECTION).get();
  const notes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`✅ Found ${notes.length} courses.`);

  const allGeneratedReviews = [];

  // 2. Generate reviews for each note
  notes.forEach(note => {
    const isBNSS = note.title?.toUpperCase().includes('BNSS') || note.id?.toUpperCase().includes('BNSS');
    const count = isBNSS ? 10 : randomInt(4, 5);
    
    console.log(`✍️ Generating ${count} reviews for: ${note.title || note.id}`);

    for (let i = 0; i < count; i++) {
      const name = random(names);
      const initial = (name || 'A').charAt(0).toUpperCase();
      const textPool = isBNSS ? [...bnssReviews, ...generalReviews] : generalReviews;
      
      const review = {
        noteId: note.id,
        userId: `demo-user-${Math.random().toString(36).substr(2, 9)}`,
        userName: name,
        userInitial: initial,
        rating: randomInt(4, 5), // Keep it professional
        text: random(textPool),
        userAffiliation: random(colleges),
        createdAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      allGeneratedReviews.push(review);
    }
  });

  // 3. Batch write to Firestore (Firestore limit is 500 per batch)
  console.log(`📤 Uploading ${allGeneratedReviews.length} reviews to Firestore...`);
  
  const CHUNK_SIZE = 450;
  for (let i = 0; i < allGeneratedReviews.length; i += CHUNK_SIZE) {
    const chunk = allGeneratedReviews.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    
    chunk.forEach(review => {
      const ref = db.collection(REVIEWS_COLLECTION).doc();
      batch.set(ref, {
        ...review,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(review.createdAt))
      });
    });
    
    await batch.commit();
    console.log(`✅ Comitted batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(allGeneratedReviews.length / CHUNK_SIZE)}`);
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
