# 🚀 MAMTA AI — GitHub Deployment Guide

## ✅ Step-by-Step Instructions

### Method 1: Direct Upload (Easiest - 2 Minutes)

1. **Download ZIP**: Get `MAMTA-AI-Deploy.zip` from this folder

2. **Go to GitHub**: Open https://github.com/mrrajubhaii786-wq/MAMTA-AI

3. **Upload Files**:
   - Click "Add file" → "Upload files"
   - Extract ZIP and upload ALL files
   - OR drag & drop extracted files
   - Commit message: "Initial MAMTA AI deployment"
   - Click "Commit changes"

4. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main" → "/ (root)"
   - Click "Save"

5. **Wait 2-3 minutes**

6. **Your site is LIVE at**:
   ```
   https://mrrajubhaii786-wq.github.io/MAMTA-AI
   ```

---

### Method 2: Git Commands (Terminal)

If you have Git installed on your computer:

```bash
# 1. Clone your repository
git clone https://github.com/mrrajubhaii786-wq/MAMTA-AI.git
cd MAMTA-AI

# 2. Copy all MAMTA AI files here
# (Copy index.html, workspace.html, safedrop.html, and all .js files)

# 3. Add, commit, push
git add .
git commit -m "🚀 MAMTA AI Initial Deployment"
git push origin main
```

---

### Method 3: GitHub Desktop (GUI)

1. Download GitHub Desktop: https://desktop.github.com
2. Clone your repository
3. Copy MAMTA AI files to the folder
4. Commit and push

---

## 🔥 After Deployment — Connect Firebase

1. Go to https://console.firebase.google.com
2. Create project "MAMTA-AI"
3. Enable Authentication, Firestore, Storage
4. Copy config to `firebase-config.js`
5. Add your OpenAI/Gemini API key to `ai-service.js`
6. Commit and push again

---

## 📁 Files to Upload

```
MAMTA-AI/
├── index.html          ← Home Page (Chat + Planning)
├── workspace.html      ← Developer Studio
├── safedrop.html       ← Security Vault
├── firebase-config.js  ← Firebase config (update with your keys)
├── auth.js             ← Authentication
├── firestore.js        ← Database
├── storage.js          ← File storage
├── ai-service.js       ← AI API (update with your key)
├── security.js         ← Encryption
├── app.js              ← Main integration
├── README.md           ← Documentation
└── .github/
    └── workflows/
        └── deploy.yml  ← Auto-deployment
```

---

## 🎯 Live URL

After deployment, your site will be at:
```
https://mrrajubhaii786-wq.github.io/MAMTA-AI
```

---

## ⚠️ Important Notes

- GitHub Pages works with **public repositories** (free)
- For **private repos**, use Firebase Hosting or Vercel
- First deployment takes **2-3 minutes**
- Subsequent updates are **instant**

---

## 🆘 Need Help?

If you face any issue:
1. Check GitHub Pages status: https://www.githubstatus.com
2. Make sure all files are in root (not in subfolder)
3. Ensure `index.html` exists at root level

---

**MAMTA AI — Think. Plan. Build. Autonomously.** 🧠
