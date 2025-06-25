// This utility will allow Node.js to use the Firebase Client SDK for email/password login
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseClientConfig from '../config/firebaseClientConfig.js';

const firebaseConfig = {
  apiKey: firebaseClientConfig.apiKey,
  authDomain: firebaseClientConfig.authDomain,
  projectId: firebaseClientConfig.projectId,
  // ...add other config as needed
};

const app = initializeApp(firebaseConfig, 'client');
const auth = getAuth(app);

export async function verifyUserWithEmailPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    return { user, idToken };
  } catch (error) {
    throw new Error(error.message);
  }
}
