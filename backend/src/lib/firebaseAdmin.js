import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account key JSON file
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, '../../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();
export default admin;
