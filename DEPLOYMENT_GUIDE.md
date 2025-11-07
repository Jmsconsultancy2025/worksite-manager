# Worksite Manager - Complete Deployment Guide

## STEP 1: Setup GitHub Repository

1. Create a new repository on GitHub (https://github.com/new)
2. Clone it locally
3. Copy all files from /app to your repository
4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Worksite Manager MVP"
git remote add origin https://github.com/YOUR_USERNAME/worksite-manager.git
git push -u origin main
```

## STEP 2: Deploy Backend to Render.com

### Create Backend Dockerfile

Create `Dockerfile` in /app/backend/:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deploy to Render

1. Go to https://render.com
2. Sign up/Login
3. Create New Service → Web Service
4. Connect GitHub repository
5. Fill in details:
   - Name: worksite-manager-backend
   - Start Command: `python -m uvicorn server:app --host 0.0.0.0 --port 8000`
   - Environment: Python 3.9
   - Free tier available
6. Deploy

You'll get a URL like: `https://worksite-manager-backend.onrender.com`

## STEP 3: Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Add to Render environment variables as `MONGO_URL`

## STEP 4: Deploy Frontend to Vercel

### Create vercel.json

Create `vercel.json` in root /app:
```json
{
  "buildCommand": "",
  "outputDirectory": "frontend",
  "public": true,
  "framework": "static",
  "env": {
    "REACT_APP_API_URL": "@api_url"
  }
}
```

### Deploy

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Import Git Repository
4. Select your worksite-manager repo
5. Click Deploy

You'll get a URL like: `https://worksite-manager.vercel.app`

## STEP 5: Update Environment Variables

In frontend/index.html, update:
```javascript
const API_BASE = 'https://worksite-manager-backend.onrender.com';
```

Redeploy frontend.

## STEP 6: Add Custom Domain (Optional)

### Domain from Namecheap/GoDaddy

1. Buy domain (e.g., worksite-manager.com)
2. In Vercel: Project Settings → Domains
3. Add domain and follow DNS setup

## STEP 7: Testing

1. Visit https://worksite-manager.vercel.app
2. Click "Test Backend Connection"
3. All features should work

## API Endpoints Available

- POST /auth/login
- POST /auth/register  
- GET /users/me
- POST /sites
- GET /sites
- POST /workers
- GET /workers
- POST /payments
- GET /payments
- GET /reports/attendance
- GET /reports/payroll

Full docs: https://worksite-manager-backend.onrender.com/docs

## Cost Estimate

- Vercel Frontend: FREE
- Render Backend: FREE (first month) then $7/month
- MongoDB Atlas: FREE (up to 500MB)
- Custom Domain: $10-15/year

Total: ~$15-20/year

