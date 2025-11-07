# Worksite Manager - Quick Start Deployment Guide

## ✅ What's Already Done
- Backend API: 17 endpoints fully implemented
- Frontend: Complete HTML/CSS/JavaScript dashboard
- Git: Repository initialized and all code committed
- Environment: All dependencies installed

## 🚀 5-Step Deployment to Production

### STEP 1: Create GitHub Repository (5 minutes)
1. Go to https://github.com/new
2. Sign in to your GitHub account
3. Repository name: `worksite-manager`
4. Description: `Worksite Manager - Workforce Management System`
5. Select "Public" or "Private" as needed
6. Click "Create repository"
7. GitHub will show you commands - copy the repository URL (looks like: https://github.com/yourusername/worksite-manager.git)

### STEP 2: Push Code to GitHub
Run this command with your repository URL:

```bash
./app/deploy.sh https://github.com/yourusername/worksite-manager.git
```

This will:
- Add GitHub as remote
- Set main as default branch  
- Push all code to GitHub
- Print next steps

### STEP 3: Deploy Backend to Render (10 minutes)
1. Go to https://render.com
2. Sign up or log in
3. Click "New" → "Web Service"
4. Choose "Connect a repository"
5. Select your GitHub repo
6. Settings:
   - Name: `worksite-manager-api`
   - Environment: `Docker`
   - Region: Your closest region
7. Click "Advanced" and add Environment Variables:
   - `MONGO_URL`: Your MongoDB connection string (see Step 4)
   - `PORT`: `8000`
8. Click "Deploy"
9. Wait for deployment (usually 5-10 minutes)
10. Copy the URL (something like: https://worksite-manager-api.onrender.com)

### STEP 4: Setup MongoDB Database (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in (free tier)
3. Create a new project
4. Create a new cluster (free tier)
5. Create a database user with password
6. Get connection string: Security → Database Access → Copy connection string
7. Replace:
   - `<password>` with your password
   - `myFirstDatabase` with `worksite`
8. Example: `mongodb+srv://user:password@cluster.mongodb.net/worksite?retryWrites=true`
9. Add this to Render environment variables as `MONGO_URL`

### STEP 5: Deploy Frontend to Vercel (5 minutes)
1. Go to https://vercel.com
2. Sign up or log in
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Settings:
   - Framework: "Other" (static files)
   - Root Directory: `frontend`
6. Click "Deploy"
7. Wait for deployment (usually 2-3 minutes)
8. Copy the deployment URL

### STEP 6: Update Frontend API Configuration
1. Go back to GitHub and open `/frontend/index.html`
2. Find line ~206: `const API_BASE = 'http://localhost:8000'`
3. Replace with: `const API_BASE = 'https://your-render-url'` (your Render API URL from Step 3)
4. Commit and push changes
5. Vercel will auto-redeploy

### STEP 7: Test Live Application
1. Open your Vercel URL in a browser
2. The app should load with the dashboard
3. Click "Test Backend Connection" to verify everything works
4. You're live! 🎉

## 📋 Useful Links
- GitHub: https://github.com/new
- Render: https://render.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Vercel: https://vercel.com

## 🔗 API Endpoints (Available After Deployment)
- GET /docs - API Documentation (Swagger UI)
- POST /auth/login - User login
- POST /auth/logout - User logout
- GET /sites - List all sites
- POST /sites - Create site
- And 13 more endpoints for full CRUD operations

## 💡 Troubleshooting

**Problem: "Connection refused" when testing backend**
- Solution: Make sure MongoDB is configured and MONGO_URL is set on Render

**Problem: API URL not updating in frontend**
- Solution: Clear browser cache or use Ctrl+Shift+Delete

**Problem: Render deployment failed**
- Solution: Check Render logs - usually missing environment variables

