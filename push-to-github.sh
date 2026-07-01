#!/bin/bash
# 🚀 MAMTA AI — GitHub Push Script
# Run this script to push MAMTA AI to GitHub

echo "🧠 MAMTA AI GitHub Deployment"
echo "=============================="

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✅ Remote already configured"
else
    echo "⚠️  Please enter your GitHub repository URL:"
    echo "Example: https://github.com/username/mamta-ai.git"
    read -p "GitHub URL: " GITHUB_URL

    git remote add origin $GITHUB_URL
    echo "✅ Remote added: $GITHUB_URL"
fi

# Rename branch to main
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "🎉 Successfully pushed to GitHub!"
    echo "🔗 Your code is now live on GitHub"
else
    echo "❌ Push failed. Please check:"
    echo "   1. GitHub repository exists"
    echo "   2. You have push access"
    echo "   3. Try: git push -u origin main --force"
fi
