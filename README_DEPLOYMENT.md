# Worksite Manager - LIVE DEPLOYMENT STEPS

## Current Status
- ✅ Backend API: Running on localhost:8000
- ✅ Frontend: Created and ready
- ✅ Database: MongoDB configured
- ✅ All 17 API Endpoints: Implemented

## QUICK START TO LAUNCH (10 MINUTES)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial: Worksite Manager MVP"
git remote add origin https://github.com/YOUR_USERNAME/worksite-manager.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Render (FREE)
1. Visit https://render.com
2. Click New +  → Web Service
3. Connect your GitHub repo
4. Fill in:
   - Service Name: worksite-manager-api
   - Environment: Python 3.9
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000`
5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. Copy the URL (e.g., https://worksite-manager-api.onrender.com)

### Step 3: Setup MongoDB Atlas (FREE)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account
3. Create free cluster
4. Get connection string
5. Add to Render environment variables:
   - Key: `MONGO_URL`
   - Value: `mongodb+srv://user:password@cluster.mongodb.net/worksite?retryWrites=true&w=majority`

### Step 4: Deploy Frontend to Vercel (FREE)
1. Go to https://vercel.com
2. Login with GitHub
3. Click "New Project"
4. Select your worksite-manager repo
5. Environment Variables:
   - Add `REACT_APP_API_URL` = your Render URL
6. Click "Deploy"
7. Wait 2-3 minutes
8. You get a live URL like: https://worksite-manager.vercel.app

### Step 5: Update Frontend API URL
Edit `/app/frontend/index.html` line ~206:
```javascript
const API_BASE = 'https://your-render-url.onrender.com';
```
Commit and push. Vercel auto-redeploys.

### Step 6: Test Live App
1. Open https://your-app.vercel.app
2. Click "Test Backend Connection"
3. Should show: ✓ Connected
4. All features now working!

## Cost Breakdown
- Vercel: FREE
- Render: FREE first month, then $7/month
- MongoDB Atlas: FREE (500MB storage)
- Domain: $12/year (optional)
**Total: $7-19/month**

## API Documentation
Once deployed, visit:
https://your-render-url.onrender.com/docs

You'll see all endpoints with test interface.

## Features Now Live
✅ User Authentication
✅ Site Management (CRUD)
✅ Worker Management (CRUD)
✅ Attendance Tracking
✅ Payment Processing
✅ Reports & Analytics
✅ Dashboard Overview

## Troubleshooting

### Backend not responding
- Check Render logs: Settings → Logs
- Ensure MongoDB URL is correct
- Verify firewall allows traffic

### Frontend can't reach API
- Check browser console (F12)
- Update API_BASE URL
- Ensure CORS is enabled on backend

### Database connection failing
- Verify MongoDB Atlas username/password
- Check IP whitelist on MongoDB
- Ensure connection string is correct

## Next Steps (Phase 2)
- Add user authentication UI
- Implement real payment processing
- Add email notifications
- Mobile app version
- Advanced reporting

