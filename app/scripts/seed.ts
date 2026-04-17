import { adminDb } from '../api/_lib/adminInit';
import { CASE_LAW_POOL } from '../src/data/playground/caseLaws';
import { QUIZ_POOL } from '../src/data/playground/quizData';
import { CONSTITUTION_POOL } from '../src/data/playground/constitutionData';
import { MAXIM_POOL } from '../src/data/playground/maximsData';
import { DIGEST_POOL } from '../src/data/playground/judgmentDigests';
import * as admin from 'firebase-admin';

async function seed() {
  console.log('Seeding Playground Content...');
  const batch = adminDb.batch();
  let count = 0;

  collectionProcessor(CASE_LAW_POOL, 'caselaw', batch);
  collectionProcessor(QUIZ_POOL, 'quiz', batch);
  collectionProcessor(CONSTITUTION_POOL, 'constitution', batch);
  collectionProcessor(MAXIM_POOL, 'maxim', batch);
  collectionProcessor(DIGEST_POOL, 'digest', batch);

  function collectionProcessor(pool: any[], type: string, currentBatch: FirebaseFirestore.WriteBatch) {
    for (const item of pool) {
      const docRef = adminDb.collection('playground_content').doc(item.id);
      const data = { ...item };
      delete data.id; // Don't upload the id twice
      data.type = type;
      data.createdAt = admin.firestore.FieldValue.serverTimestamp();
      currentBatch.set(docRef, data, { merge: true });
      count++;
    }
  }

  await batch.commit();
  console.log(`Seeded ${count} items successfully!`);
}

seed().catch(console.error);
