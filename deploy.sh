#!/bin/bash

echo "================================="
echo "Worksite Manager - Deployment Script"
echo "================================="
echo ""

# Check if GitHub repo URL is provided
if [ -z "$1" ]; then
    echo "ERROR: GitHub repository URL required"
    echo "Usage: ./deploy.sh https://github.com/username/worksite-manager.git"
    exit 1
fi

echo "[1/5] Setting remote repository..."
git remote add origin "$1"

echo "[2/5] Pushing code to GitHub (main branch)..."
git branch -M main
git push -u origin main

echo "[3/5] Code pushed successfully!"
echo ""
echo "Next steps:"
echo "1. Visit https://render.com and create a new Web Service"
echo "2. Connect it to this GitHub repository"
echo "3. Set environment variables:"
echo "   - MONGO_URL: Your MongoDB Atlas connection string"
echo "   - PORT: 8000"
echo ""
echo "4. Visit https://vercel.com and deploy the frontend"
echo "5. Update frontend API_BASE in index.html with Render URL"
echo ""
echo "Deployment complete!"
echo "================================="

