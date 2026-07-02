# MAMTA AI — System Architecture

## Version
1.0.0

## Date
2026-07-02

---

## 1. Architecture Overview

```
USER LAYER
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Browser   │  │   Mobile    │  │   Tablet    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       └────────────────┴────────────────┘
                        │
FRONTEND LAYER
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  index.html │  │workspace.html│  │ safedrop.html│
│  (Home)     │  │ (Workspace)  │  │  (SafeDrop)  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       └────────────────┴────────────────┘
                        │
SERVICE LAYER
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   auth.js   │  │ firestore.js│  │  storage.js  │
│ (Supabase   │  │ (Supabase   │  │ (Supabase    │
│   Auth)     │  │   DB)       │  │   Storage)   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       └────────────────┴────────────────┘
                        │
BACKEND LAYER (Supabase)
┌─────────────────────────────────────────────┐
│  ┌─────────┐  ┌───────────┐  ┌─────────┐  │
│  │  Auth   │  │ PostgreSQL│  │ Storage │  │
│  │ (Users) │  │(Database) │  │ (Files) │  │
│  └─────────┘  └───────────┘  └─────────┘  │
└─────────────────────────────────────────────┘
                        │
AI LAYER
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   OpenAI    │  │   Gemini    │  │   Claude    │
│    API      │  │    API      │  │    API      │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 2. Component Details

### 2.1 Frontend Layer

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Home Page - AI Chat + Planning Room | ~92 KB |
| `workspace.html` | Developer Studio - Auto-build | ~64 KB |
| `safedrop.html` | Security Vault - Encryption | ~63 KB |
| `app.js` | Main controller, routing, state | ~11 KB |

### 2.2 Service Layer

| File | Purpose | Dependencies |
|------|---------|-------------|
| `auth.js` | Login, signup, logout, session | Supabase Auth |
| `firestore.js` | CRUD operations, queries | Supabase DB |
| `storage.js` | File upload, download, delete | Supabase Storage |
| `ai-service.js` | AI API calls, response handling | OpenAI/Gemini |
| `security.js` | Encryption, decryption, hashing | Crypto API |

### 2.3 Backend Layer (Supabase)

| Service | Purpose | Data |
|---------|---------|------|
| **Auth** | User management | Email, Google, Phone |
| **PostgreSQL** | Structured data | Users, Chats, Projects, Files |
| **Storage** | File management | Encrypted files |
| **Realtime** | Live updates | Chat messages, notifications |

---

## 3. Data Flow

### 3.1 User Login
```
User -> Click Sign In -> auth.js -> Supabase Auth -> JWT Token -> LocalStorage -> Logged In
```

### 3.2 Chat Message
```
User -> Type Message -> app.js -> ai-service.js -> OpenAI API -> Response -> firestore.js -> Supabase DB -> Display
```

### 3.3 File Upload (SafeDrop)
```
User -> Select File -> security.js (Encrypt) -> storage.js -> Supabase Storage -> firestore.js (Metadata) -> Supabase DB
```

---

## 4. Security Architecture

```
Layer 1: HTTPS (Transport)
Layer 2: JWT (Authentication)
Layer 3: AES-256-GCM (Encryption)
Layer 4: Row Level Security (DB)
Layer 5: Input Validation
```

---

## 5. API Architecture

### 5.1 Internal APIs (Supabase)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/v1/signup` | POST | User registration |
| `/auth/v1/token` | POST | User login |
| `/rest/v1/users` | GET/POST | User data |
| `/rest/v1/chats` | GET/POST | Chat history |
| `/rest/v1/projects` | GET/POST | Project data |
| `/rest/v1/files` | GET/POST | File metadata |

### 5.2 External APIs

| Service | Endpoint | Purpose |
|---------|----------|---------|
| OpenAI | `api.openai.com/v1/chat` | AI responses |
| Gemini | `generativelanguage.googleapis.com` | AI responses |

---

## 6. State Management

```
user: { id, email, name, jwt, expires_at }
currentPage: 'home' | 'workspace' | 'safedrop'
chatHistory: [...messages]
projects: [...projects]
files: [...files]
theme: 'dark'
```

---

## 7. Error Handling

1. Catch error at source
2. Log to console + Supabase
3. Display user-friendly message
4. Retry if transient
5. Fallback to offline mode

---

## 8. Performance

- **Target Load Time:** < 2 seconds
- **Target TTFB:** < 200ms
- **Target FCP:** < 1 second
- **Optimization:** Lazy loading, code splitting, CDN

---

## 9. Scalability

- **Horizontal:** Supabase auto-scales
- **Vertical:** GitHub Pages CDN
- **Caching:** Browser + Service Worker
- **Database:** Connection pooling

---

## 10. Monitoring

- **Analytics:** Supabase Analytics
- **Errors:** Console logging + Supabase logs
- **Performance:** Web Vitals
- **Uptime:** GitHub Pages status
