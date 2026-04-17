/**
 * Deploys Firestore security rules using the Firebase Management REST API
 * with service account credentials from app/.env.local
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env vars ────────────────────────────────────────────────────────────
const envPath = resolve(__dirname, '../app/.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const eq = line.indexOf('=');
  if (eq === -1 || line.startsWith('#')) continue;
  const key = line.slice(0, eq).trim();
  let val = line.slice(eq + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
}

// ── Load rules file ─────────────────────────────────────────────────────────
const rulesContent = readFileSync(resolve(__dirname, '../app/firestore.rules'), 'utf-8');
console.log('Rules file loaded, length:', rulesContent.length);

// ── Get access token via service account ────────────────────────────────────
const googleAuthPath = pathToFileURL(resolve(__dirname, '../app/node_modules/google-auth-library/build/src/index.js')).href;
let GoogleAuth;
try {
  const mod = await import(googleAuthPath);
  GoogleAuth = mod.GoogleAuth;
} catch {
  // Try firebase-admin's bundled google-auth-library
  const adminPath = pathToFileURL(resolve(__dirname, '../app/node_modules/firebase-admin/node_modules/google-auth-library/build/src/index.js')).href;
  const mod = await import(adminPath).catch(() => null);
  if (mod) GoogleAuth = mod.GoogleAuth;
}

const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
const projectId = env.FIREBASE_PROJECT_ID;

async function getAccessToken() {
  if (GoogleAuth) {
    const auth = new GoogleAuth({
      credentials: {
        client_email: env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  }
  throw new Error('Could not load google-auth-library');
}

// ── Deploy rules via REST API ────────────────────────────────────────────────
const token = await getAccessToken();
console.log('Got access token');

// First, create a new ruleset
const createRulesetUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;
const rulesetBody = {
  source: {
    files: [
      {
        name: 'firestore.rules',
        content: rulesContent,
        fingerprint: null,
      }
    ]
  }
};

const createRes = await fetch(createRulesetUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(rulesetBody),
});

if (!createRes.ok) {
  const err = await createRes.text();
  throw new Error(`Failed to create ruleset: ${createRes.status} ${err}`);
}

const ruleset = await createRes.json();
console.log('Created ruleset:', ruleset.name);

// Then, update the release to point to the new ruleset
const releaseName = `projects/${projectId}/releases/cloud.firestore`;
const getReleaseUrl = `https://firebaserules.googleapis.com/v1/${releaseName}`;

// Check if release exists
const releaseCheckRes = await fetch(getReleaseUrl, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const updateReleaseUrl = releaseCheckRes.ok
  ? `https://firebaserules.googleapis.com/v1/${releaseName}`
  : `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`;

const releaseBody = {
  release: {
    name: releaseName,
    rulesetName: ruleset.name,
  }
};

const releaseMethod = releaseCheckRes.ok ? 'PATCH' : 'POST';
const releaseRes = await fetch(
  releaseCheckRes.ok ? updateReleaseUrl : `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
  {
    method: releaseMethod,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(releaseBody),
  }
);

if (!releaseRes.ok) {
  const err = await releaseRes.text();
  throw new Error(`Failed to update release: ${releaseRes.status} ${err}`);
}

const release = await releaseRes.json();
console.log('✅ Firestore rules deployed successfully!');
console.log('Release:', release.name, '→', release.rulesetName);
process.exit(0);
