#!/bin/bash
# 🚀 MAMTA AI — Quick Deploy Script

echo "🧠 MAMTA AI Deployment Options"
echo "==============================="
echo ""
echo "Choose deployment platform:"
echo "1. 🔥 Firebase Hosting (Recommended)"
echo "2. ▲ Vercel"
echo "3. 🌐 Netlify"
echo "4. 📦 GitHub Pages"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo "🔥 Deploying to Firebase..."
    npm install -g firebase-tools
    firebase login
    firebase init hosting
    firebase deploy
    echo "🎉 Live at: https://your-project.web.app"
    ;;
  2)
    echo "▲ Deploying to Vercel..."
    npm install -g vercel
    vercel
    echo "🎉 Live at: https://your-project.vercel.app"
    ;;
  3)
    echo "🌐 Deploying to Netlify..."
    npm install -g netlify-cli
    netlify login
    netlify deploy --prod
    echo "🎉 Live at: https://your-project.netlify.app"
    ;;
  4)
    echo "📦 Deploying to GitHub Pages..."
    echo "Make sure your repository is public"
    git add .
    git commit -m "Deploy MAMTA AI"
    git push origin main
    echo "🎉 Enable GitHub Pages in repository settings"
    ;;
  *)
    echo "❌ Invalid choice"
    ;;
esac
