# 🧠 MAMTA AI — Autonomous AI System

> **Think. Plan. Build. Autonomously.**

## 🚀 Overview

MAMTA AI ek 3-page autonomous AI system hai jo users ko:
- **AI Chat** se kuch bhi poochne ki suvidha deta hai
- **Planning Room** se apps/websites plan karne ki ability deta hai
- **Workspace** mein auto-build karke code generate karta hai
- **SafeDrop** se end-to-end encrypted data security deta hai

## 📁 Project Structure

```
MAMTA-AI/
├── index.html              # 🏠 Home Page (Chat + Planning Room)
├── workspace.html          # ⚡ Workspace (Developer Studio)
├── safedrop.html           # 🛡️ SafeDrop (Security Vault)
├── firebase-config.js      # 🔥 Firebase Configuration
├── auth.js                 # 🔐 Authentication Service
├── firestore.js            # 🗄️ Firestore Database Service
├── storage.js              # ☁️ Firebase Storage Service
├── ai-service.js           # 🤖 OpenAI/Gemini API Integration
├── security.js             # 🔐 Client-Side Encryption Utils
├── app.js                  # 🚀 Main App Integration
└── README.md               # 📋 This file
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
```bash
# Go to: https://console.firebase.google.com/
# Create new project: "MAMTA-AI"
```

### 2. Enable Services
- **Authentication**: Email/Password, Google, Phone
- **Firestore Database**: Start in test mode
- **Storage**: Create default bucket

### 3. Get Config
```javascript
// Copy from Firebase Console → Project Settings → General
// Paste in firebase-config.js
```

### 4. Update API Key
```javascript
// In ai-service.js, add your OpenAI or Gemini API key
const API_KEY = 'your-api-key-here';
```

## 🚀 Deployment

### Option 1: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 2: Vercel
```bash
npm i -g vercel
vercel
```

### Option 3: Netlify
```bash
# Drag and drop folder to netlify.com
```

## 🔐 Security Features

| Feature | Status |
|---------|--------|
| Client-Side Encryption (AES-GCM) | ✅ |
| Zero-Knowledge Architecture | ✅ |
| Multi-Factor Authentication | ✅ |
| Geo-Fencing | ✅ |
| Honeypot Files | ✅ |
| Emergency Lock | ✅ |
| Audit Logging | ✅ |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| UI Framework | Custom (Glassmorphism + Dark Theme) |
| Backend | Firebase (Auth, Firestore, Storage) |
| AI API | OpenAI GPT-4 / Google Gemini |
| Encryption | Web Crypto API (AES-256-GCM) |
| Hosting | Firebase Hosting / Vercel |

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Desktop | >1200px | Full 3-panel |
| Tablet | 768-1200px | 2-panel |
| Mobile | <768px | Single column |

## 🎯 Features

### Home Page
- 🤖 AI Chat with real-time responses
- 💡 Planning Room with auto-generated plans
- 🚀 Auto-redirect to Workspace
- 🌐 Multi-language support (Hindi + English)

### Workspace
- 💻 Code Editor with syntax highlighting
- 📱 Live Preview (Mobile/Tablet/Desktop)
- 🤖 AI Agents (Code, Design, Test, Deploy)
- 🖥️ Real-time Build Console

### SafeDrop
- 🔒 End-to-End Encryption
- 📤 Drag & Drop Upload
- 🛡️ Active Defense Panel
- 🚨 Emergency Lock Button
- 📋 Audit Logs

## 👨‍💻 Developer

**MAMTA AI** — Built with ❤️ for humans.

## 📄 License

MIT License — Free to use, modify, and distribute.

---

> **Note**: This is a prototype. For production, add:
> - Rate limiting
> - Input validation
> - Error boundaries
> - Loading states
> - Accessibility (ARIA)
> - Unit tests
