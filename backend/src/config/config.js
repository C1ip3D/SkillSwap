import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  webrtc: {
    stunServer: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302',
    turnServer: process.env.TURN_SERVER,
    turnUsername: process.env.TURN_USERNAME,
    turnCredential: process.env.TURN_CREDENTIAL,
  },
};
