# 🏗️ MAMTA AI Architecture

## System Overview

MAMTA AI is a single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. All functionality is self-contained in `index.html` with no external dependencies.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│              User Browser                      │
├─────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Home   │ │Workspace│ │  Admin  │       │
│  │  Chat   │ │  IDE    │ │Monitor  │       │
│  └────┬────┘ └────┬────┘ └────┬────┘       │
│       └─────────────┼─────────────┘          │
│                     │                        │
│              ┌──────┴──────┐               │
│              │  SafeDrop   │               │
│              │   Vault     │               │
│              └─────────────┘               │
├─────────────────────────────────────────────┤
│  localStorage (Encrypted)                   │
│  • API Keys  • Passwords  • Backups         │
└─────────────────────────────────────────────┘
```

## Page Structure

### 🏠 Home Page
- **Purpose:** General AI conversation and planning
- **Features:** Chat input, quick actions, plan generation
- **Key IDs:** `home-chat-input`, `home-chat-messages`, `home-welcome`
- **Functions:** `sendHomeChat()`, `homeQuick()`, `sendPlanToWorkspace()`

### 💻 Workspace Page
- **Purpose:** Master plan execution and project building
- **Features:** Plan analysis, task queue, build logs, file generation
- **Key IDs:** `mp-input`, `mp-task-queue`, `mp-build-logs`, `mp-file-list`
- **Functions:** `analyzeMasterPlan()`, `buildProject()`, `createTaskTree()`

### 📊 Admin Page
- **Purpose:** System monitoring and health tracking
- **Features:** Engine monitor, AI metrics, project health, activity timeline
- **Key IDs:** `engine-monitor`, `ai-metrics`, `project-health`
- **Functions:** `refreshMetrics()`, `checkHealth()`

### 🔐 SafeDrop Page
- **Purpose:** Secure vault for API keys and passwords
- **Features:** AES-256 encryption, password manager, backup/restore
- **Key IDs:** `vault-tab-keys`, `vault-tab-passwords`, `vault-tab-backup`
- **Functions:** `saveKey()`, `savePassword()`, `exportBackup()`

## Data Flow

```
User Input → Home Chat → Plan Generated
                              ↓
                    "Send to Workspace"
                              ↓
                    localStorage Bridge
                              ↓
                    Workspace Loads Plan
                              ↓
                    Analyze → Tasks → Build
                              ↓
                    Files Generated + Logs
```

## Security Model

- **Client-side only:** No server, no data transmission
- **localStorage:** All data stored in browser
- **AES-256:** Vault encryption using master key
- **No external calls:** Except AI provider APIs (user-configured)

## File Structure

```
index.html          # Main SPA (95KB+)
├── <style>         # All CSS (variables, layouts, animations)
├── <body>          # 4 page divs + nav + modals
└── <script>        # All JS (chat, workspace, admin, vault)
```

## CSS Architecture

### Variables
```css
--bg: #0B0F19          /* Deep space background */
--panel: #111827        /* Card backgrounds */
--text: #F3F4F6        /* Primary text */
--accent: #6366F1      /* Primary action color */
--border: #1F2937      /* Borders and dividers */
```

### Responsive Breakpoints
- **Desktop:** > 768px (full layout)
- **Tablet:** 768px (collapsed sidebar)
- **Mobile:** 480px (stacked layout, fixed bottom input)

## JavaScript Architecture

### Global Functions
- `showPage(page)` — Navigation handler
- `showWsTab(tab)` — Workspace sidebar
- `showVaultTab(tab)` — SafeDrop tabs

### Home Chat System
- `sendHomeChat()` — Main chat handler
- `homeQuick(cmd)` — Quick action buttons
- `sendPlanToWorkspace()` — Plan transfer

### Workspace Runner
- `analyzeMasterPlan()` — Parse and extract tasks
- `createTaskTree()` — Build dependency tree
- `buildProject()` — Execute tasks sequentially
- `reviewOutput()` — Quality check
- `saveProject()` — Persist to localStorage

## Performance Considerations

- **Single file:** No HTTP requests for assets (except logo SVG)
- **Inline everything:** CSS and JS in HTML
- **Minimal DOM:** Only 4 page containers
- **Efficient selectors:** ID-based lookups
- **No frameworks:** Vanilla JS for speed

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Full |

## Future Improvements

- [ ] Service Worker for offline support
- [ ] IndexedDB for larger storage
- [ ] WebRTC for peer-to-peer sync
- [ ] WebAssembly for crypto acceleration
