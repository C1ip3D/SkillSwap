# SkillSwap Deployment Guide

## Overview
This guide covers deploying the SkillSwap application with a React frontend and Node.js backend.

## Prerequisites
- GitHub repository with your code
- Firebase project configured
- Environment variables ready

## Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
2. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub
3. **Import your repository**
4. **Configure build settings:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

6. **Deploy**

### Backend Deployment (Railway)

1. **Go to [railway.app](https://railway.app)** and sign up with GitHub
2. **Create new project** → Deploy from GitHub repo
3. **Select your repository**
4. **Configure deployment:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Add Environment Variables:**
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FRONTEND_URL=https://your-frontend-url.vercel.app
   PORT=5000
   ```

6. **Deploy**

## Option 2: Netlify (Frontend) + Render (Backend)

### Frontend Deployment (Netlify)

1. **Push code to GitHub**
2. **Go to [netlify.com](https://netlify.com)** and sign up
3. **Import from Git**
4. **Build settings:**
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

### Backend Deployment (Render)

1. **Go to [render.com](https://render.com)** and sign up
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Add Environment Variables:**
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FRONTEND_URL=https://your-frontend-url.netlify.app
   ```

## Option 3: Full-stack on Railway

1. **Go to Railway** and create new project
2. **Deploy from GitHub**
3. **Add two services:**
   - Frontend service (root: `frontend`)
   - Backend service (root: `backend`)
4. **Configure environment variables for both services**

## Environment Variables Setup

### Backend Variables:
```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

### Frontend Variables:
```bash
VITE_API_URL=https://your-backend-domain.com
```

## Firebase Setup

1. **Get Firebase Admin SDK credentials:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file
   - Extract the values for environment variables

2. **Update Firebase Security Rules** to allow your deployed domain

## Post-Deployment

1. **Test all functionality:**
   - User registration/login
   - Skill creation/management
   - Video calls
   - Real-time features

2. **Update CORS settings** if needed in backend

3. **Monitor logs** for any errors

## Troubleshooting

### Common Issues:
- **CORS errors**: Ensure FRONTEND_URL is set correctly
- **Firebase auth errors**: Check Firebase Admin SDK credentials
- **Build failures**: Verify Node.js version compatibility
- **Environment variables**: Ensure all required vars are set

### Debug Commands:
```bash
# Check backend logs
railway logs
# or
heroku logs --tail

# Check frontend build
npm run build
```

## Cost Estimation

- **Vercel**: Free tier (generous limits)
- **Railway**: $5/month for backend
- **Netlify**: Free tier
- **Render**: Free tier (with limitations)

Total: ~$5-10/month for production deployment 