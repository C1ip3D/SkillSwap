import { firebaseAuth } from '../lib/firebaseAdmin.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader); // Debug log
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    console.log('Decoded token:', decodedToken); // Debug log
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error); // Debug log
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};
