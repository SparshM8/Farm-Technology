# Vercel + Render Deployment Helper Script (Windows)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 Vercel + Render Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is clean
$gitStatus = git status -s
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes. Commit before deploying." -ForegroundColor Yellow
    git status
    exit 1
}

Write-Host "✅ Repository is clean" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host ""

# Verify backend is ready
Write-Host "🔍 Checking backend..." -ForegroundColor Cyan
if (Test-Path "backend/server.js") {
    Write-Host "✅ Backend server.js found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server.js not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Show deployment URLs template
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create accounts at vercel.com and render.com (GitHub login)" -ForegroundColor White
Write-Host "2. Deploy Backend on Render:" -ForegroundColor White
Write-Host "   - New → Web Service → Select this GitHub repo" -ForegroundColor Gray
Write-Host "   - Build: cd backend && npm install" -ForegroundColor Gray
Write-Host "   - Start: cd backend && node server.js" -ForegroundColor Gray
Write-Host "   - Add env vars from render.yaml" -ForegroundColor Gray
Write-Host "3. Deploy Frontend on Vercel:" -ForegroundColor White
Write-Host "   - New Project → Select this GitHub repo" -ForegroundColor Gray
Write-Host "   - Framework: Vite" -ForegroundColor Gray
Write-Host "   - Build: cd frontend && npm run build" -ForegroundColor Gray
Write-Host "   - Root Directory: ." -ForegroundColor Gray
Write-Host "   - Add env var: VITE_API_URL=YOUR_RENDER_URL" -ForegroundColor Gray
Write-Host "4. Update CORS_ORIGIN in Render with your Vercel URL" -ForegroundColor White
Write-Host ""
Write-Host "✨ Deployment ready! Push to GitHub for auto-deploy" -ForegroundColor Green
