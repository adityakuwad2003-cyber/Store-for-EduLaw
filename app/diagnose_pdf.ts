import { getNoteBySlug } from './src/lib/db';

async function diagnose() {
  const note = await getNoteBySlug('bns-complete-notes');
  console.log("DIAGNOSTIC NOTE DATA:", JSON.stringify(note, null, 2));
}

diagnose();
