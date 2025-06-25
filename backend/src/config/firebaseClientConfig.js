// Add Firebase config values here for backend client SDK usage
// Replace the placeholders with your actual Firebase project config values
const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '<YOUR_API_KEY>',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '<YOUR_AUTH_DOMAIN>',
  projectId: process.env.FIREBASE_PROJECT_ID || '<YOUR_PROJECT_ID>',
  databaseURL: process.env.FIREBASE_DATABASE_URL || '<YOUR_DATABASE_URL>',
  appId: process.env.FIREBASE_APP_ID || '<YOUR_APP_ID>',
  senderId: process.env.FIREBASE_SENDER_ID || '<YOUR_SENDER_ID>',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '<YOUR_STORAGE_BUCKET>',
  // ...add other config as needed
};
export default firebaseClientConfig;
