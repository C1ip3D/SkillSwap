import { firebaseAuth, firestore } from '../lib/firebaseAdmin.js';
import admin from 'firebase-admin';
import { verifyUserWithEmailPassword } from '../lib/firebaseClient.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await firebaseAuth.getUserByEmail(email);
      if (userRecord) {
        return res.status(400).json({ message: 'User already exists' });
      }
    } catch (err) {
      // If error is not 'user-not-found', throw
      if (err.code !== 'auth/user-not-found') {
        return res.status(400).json({ message: err.message });
      }
    }

    // Create user in Firebase Auth
    const newUser = await firebaseAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Add user profile to Firestore
    await firestore.collection('users').doc(newUser.uid).set({
      name,
      email,
      avatar: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create a custom token for the user
    const token = await firebaseAuth.createCustomToken(newUser.uid);

    res.status(201).json({
      user: {
        id: newUser.uid,
        name: newUser.displayName,
        email: newUser.email,
        avatar: '',
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Use Firebase Client SDK to verify email/password
    const { user, idToken } = await verifyUserWithEmailPassword(
      email,
      password
    );
    // Optionally, verify the ID token with Admin SDK for extra security
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    // Fetch user profile from Firestore
    const userDoc = await firestore.collection('users').doc(user.uid).get();
    const profile = userDoc.exists ? userDoc.data() : {};
    res.json({
      user: {
        id: user.uid,
        name: user.displayName || profile.name || '',
        email: user.email,
        avatar: profile.avatar || '',
      },
      token: idToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(userDoc.data());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
