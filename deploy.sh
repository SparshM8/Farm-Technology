#!/bin/bash
# Vercel + Render Deployment Helper Script

echo "================================"
echo "🚀 Vercel + Render Deployment"
echo "================================"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Commit before deploying."
    git status
    exit 1
fi

echo "✅ Repository is clean"
echo ""

# Build frontend
echo "📦 Building frontend..."
cd frontend || exit
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd .. || exit
echo ""

# Verify backend is ready
echo "🔍 Checking backend..."
if [ -f "backend/server.js" ]; then
    echo "✅ Backend server.js found"
else
    echo "❌ Backend server.js not found"
    exit 1
fi
echo ""

# Show deployment URLs template
echo "📝 Next Steps:"
echo "1. Create accounts at vercel.com and render.com (GitHub login)"
echo "2. Deploy Backend on Render:"
echo "   - New → Web Service → Select this GitHub repo"
echo "   - Build: cd backend && npm install"
echo "   - Start: cd backend && node server.js"
echo "   - Add env vars from render.yaml"
echo "3. Deploy Frontend on Vercel:"
echo "   - New Project → Select this GitHub repo"
echo "   - Framework: Vite"
echo "   - Build: cd frontend && npm run build"
echo "   - Root Directory: ."
echo "   - Add env var: VITE_API_URL=YOUR_RENDER_URL"
echo "4. Update CORS_ORIGIN in Render with your Vercel URL"
echo ""
echo "✨ Deployment ready! Push to GitHub for auto-deploy"
