# MAMTA AI — Engine Registry

## Version
1.0.0

## Date
2026-07-02

---

## Registered Engines

### Engine 001: Chat Engine

| Property | Value |
|----------|-------|
| **Name** | Chat Engine |
| **ID** | ENG-001 |
| **Status** | Planned |
| **Purpose** | Handle AI chat conversations |
| **Location** | ai-service.js |
| **Dependencies** | OpenAI API, Supabase DB |
| **Input** | User message |
| **Output** | AI response |
| **Features** | Multi-language, context memory, auto-detect build requests |

---

### Engine 002: Auth Engine

| Property | Value |
|----------|-------|
| **Name** | Auth Engine |
| **ID** | ENG-002 |
| **Status** | Broken |
| **Purpose** | User authentication and session management |
| **Location** | auth.js |
| **Dependencies** | Supabase Auth |
| **Input** | Email/Password/Google/Phone |
| **Output** | JWT Token, User Profile |
| **Features** | Multi-provider, session persistence, role-based access |

---

### Engine 003: Planning Engine

| Property | Value |
|----------|-------|
| **Name** | Planning Engine |
| **ID** | ENG-003 |
| **Status** | Planned |
| **Purpose** | Auto-generate project plans from chat |
| **Location** | app.js (planning room) |
| **Dependencies** | AI Service, Supabase DB |
| **Input** | User project idea |
| **Output** | Feature list, tech stack, timeline |
| **Features** | Auto-detection, template generation, cost estimation |

---

### Engine 004: Build Engine

| Property | Value |
|----------|-------|
| **Name** | Build Engine |
| **ID** | ENG-004 |
| **Status** | Planned |
| **Purpose** | Auto-build projects from planning |
| **Location** | workspace.html |
| **Dependencies** | AI Service, Code Generation |
| **Input** | Project plan |
| **Output** | Working code, live preview |
| **Features** | Web app builder, mobile app builder, one-click deploy |

---

### Engine 005: Security Engine

| Property | Value |
|----------|-------|
| **Name** | Security Engine |
| **ID** | ENG-005 |
| **Status** | Planned |
| **Purpose** | Encrypt and secure user data |
| **Location** | security.js, safedrop.html |
| **Dependencies** | Crypto API, Supabase Storage |
| **Input** | User files/data |
| **Output** | Encrypted data, security score |
| **Features** | AES-256-GCM, zero-knowledge, threat detection |

---

### Engine 006: Storage Engine

| Property | Value |
|----------|-------|
| **Name** | Storage Engine |
| **ID** | ENG-006 |
| **Status** | Planned |
| **Purpose** | File upload, download, management |
| **Location** | storage.js |
| **Dependencies** | Supabase Storage, Security Engine |
| **Input** | User files |
| **Output** | Storage URL, metadata |
| **Features** | Drag-drop, progress tracking, encryption |

---

## Engine Status Legend

| Status | Meaning |
|--------|---------|
| Complete | Fully working |
| In Progress | Being developed |
| Planned | Scheduled for future |
| Broken | Not working, needs fix |
| Deprecated | No longer used |

---

## Engine Dependencies Graph

```
Chat Engine (ENG-001)
    |
    v
Planning Engine (ENG-003) -> Build Engine (ENG-004)
    |
    v
Auth Engine (ENG-002) -> Storage Engine (ENG-006)
    |
    v
Security Engine (ENG-005)
```
