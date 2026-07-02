# MAMTA AI — Folder Structure

## Version
1.0.0

## Date
2026-07-02

---

## Root Structure

```
MAMTA-AI/
│
├── 📄 index.html              # Home Page (Chat + Planning)
├── 📄 workspace.html          # Developer Studio
├── 📄 safedrop.html           # Security Vault
│
├── 📄 supabase-config.js      # Supabase Configuration
├── 📄 auth.js                 # Authentication Service
├── 📄 firestore.js            # Database Operations
├── 📄 storage.js              # File Storage
├── 📄 security.js             # Encryption Utilities
├── 📄 ai-service.js           # AI Integration
├── 📄 app.js                  # Main Application
│
├── 📄 README.md               # Project Documentation
├── 📄 supabase-setup.sql      # Database Schema
│
├── 📁 docs/                   # Project Documentation
│   ├── 00_PROJECT_CONSTITUTION.md
│   ├── 01_PROJECT_VISION.md
│   ├── 02_SYSTEM_ARCHITECTURE.md
│   ├── 03_MASTER_PLAN.md
│   ├── 04_ROADMAP.md
│   ├── 05_SPRINTS.md
│   ├── 06_CHANGELOG.md
│   ├── 07_TECH_DEBT.md
│   ├── 08_DECISION_LOG.md
│   ├── 09_ENGINE_REGISTRY.md
│   ├── 10_PLUGIN_REGISTRY.md
│   ├── 11_API_REGISTRY.md
│   ├── 12_DATABASE_SCHEMA.md
│   ├── 13_FOLDER_STRUCTURE.md
│   ├── 14_NAMING_CONVENTIONS.md
│   ├── 15_DEVELOPMENT_WORKFLOW.md
│   ├── 16_AI_HANDOFF.md
│   ├── 17_PROGRESS_TRACKER.md
│   ├── 18_BACKLOG.md
│   ├── 19_RELEASE_PLAN.md
│   └── 20_GLOSSARY.md
│
├── 📁 .github/                # GitHub Configuration
│   └── workflows/
│       └── deploy.yml         # GitHub Actions
│
└── 📁 assets/                 # Static Assets (Future)
    ├── 📁 images/
    ├── 📁 fonts/
    └── 📁 icons/
```

---

## File Purposes

### Core Pages

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Landing page + AI Chat + Planning Room | ~400 |
| `workspace.html` | Developer studio + Auto-build | ~300 |
| `safedrop.html` | Security vault + File encryption | ~300 |

### Service Files

| File | Purpose | Lines |
|------|---------|-------|
| `supabase-config.js` | Supabase client initialization | ~20 |
| `auth.js` | Login, signup, logout, session | ~150 |
| `firestore.js` | Database CRUD operations | ~200 |
| `storage.js` | File upload, download, delete | ~100 |
| `security.js` | Encryption, hashing, password utils | ~120 |
| `ai-service.js` | AI API calls, response handling | ~150 |
| `app.js` | Main controller, routing, state | ~300 |

### Documentation

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Project overview | ~100 |
| `supabase-setup.sql` | Database creation script | ~80 |

---

## Naming Conventions

### Files
- **HTML:** `page-name.html` (kebab-case)
- **JS:** `service-name.js` (kebab-case)
- **CSS:** Inline in HTML (future: `styles.css`)
- **Docs:** `NN_FILE_NAME.md` (numbered, UPPER_SNAKE_CASE)

### Variables (JS)
- **Constants:** `UPPER_SNAKE_CASE`
- **Functions:** `camelCase`
- **Classes:** `PascalCase`
- **Private:** `_leadingUnderscore`

---

## Future Additions

```
MAMTA-AI/
├── 📁 src/                    # Source Code (Future)
│   ├── 📁 components/
│   ├── 📁 pages/
│   ├── 📁 hooks/
│   └── 📁 utils/
│
├── 📁 tests/                  # Test Files (Future)
│   ├── 📁 unit/
│   └── 📁 e2e/
│
├── 📁 plugins/                # Plugin Directory (Future)
│   └── 📁 installed/
│
└── 📁 config/                 # Configuration (Future)
    ├── 📄 webpack.config.js
    └── 📄 jest.config.js
```
