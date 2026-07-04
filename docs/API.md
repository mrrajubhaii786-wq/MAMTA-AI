# 📡 MAMTA AI API Documentation

## Internal APIs

### Navigation API

#### `showPage(pageName)`
Switches between main pages.

```javascript
showPage('home')      // Show Home page
showPage('workspace') // Show Workspace page
showPage('admin')     // Show Admin page
showPage('safedrop')  // Show SafeDrop page
```

**Parameters:**
- `pageName` (string): One of 'home', 'workspace', 'admin', 'safedrop'

**Returns:** void

---

### Home Chat API

#### `sendHomeChat()`
Sends message from home chat input.

```javascript
// Triggered by: Enter key or Send button click
sendHomeChat()
```

**Behavior:**
1. Reads value from `#home-chat-input`
2. Creates user message bubble
3. Checks for execution commands (`/build`, `/plan`)
4. Generates AI response
5. Appends to `#home-chat-messages`

---

#### `homeQuick(command)`
Executes a quick action command.

```javascript
homeQuick('Plan a project')
homeQuick('Write code for')
homeQuick('Research about')
homeQuick('Build with Workspace')
```

**Parameters:**
- `command` (string): Predefined command string

---

#### `sendPlanToWorkspace()`
Transfers generated plan to Workspace.

```javascript
// Called when "Send to Workspace" button clicked
sendPlanToWorkspace()
```

**Behavior:**
1. Extracts plan text from message dataset
2. Saves to `localStorage` as `mamta_pending_plan`
3. Switches to Workspace page
4. Loads plan into `#mp-input`

---

### Workspace API

#### `analyzeMasterPlan()`
Analyzes pasted master plan and extracts tasks.

```javascript
analyzeMasterPlan()
```

**Behavior:**
1. Reads value from `#mp-input`
2. Parses markdown structure
3. Extracts tasks from bullet points
4. Populates `#mp-task-queue`
5. Logs analysis to `#mp-build-logs`

---

#### `createTaskTree()`
Creates dependency tree from analyzed tasks.

```javascript
createTaskTree()
```

**Behavior:**
1. Takes tasks from analysis
2. Adds sequential dependencies
3. Renders tree in `#mp-task-queue`

---

#### `buildProject()`
Executes all tasks sequentially.

```javascript
buildProject()
```

**Behavior:**
1. Iterates through task queue
2. Simulates build for each task
3. Generates mock files for build tasks
4. Updates task status (pending → running → completed)
5. Logs progress to `#mp-build-logs`

---

#### `reviewOutput()`
Reviews generated output for issues.

```javascript
reviewOutput()
```

**Behavior:**
1. Checks generated files
2. Validates structure
3. Reports issues to logs

---

#### `saveProject()`
Saves project to localStorage.

```javascript
saveProject()
```

**Behavior:**
1. Collects plan, tasks, files
2. Serializes to JSON
3. Saves with timestamp key

---

### SafeDrop Vault API

#### `saveKey(provider)`
Saves API key for a provider.

```javascript
saveKey('openai')
saveKey('gemini')
```

**Parameters:**
- `provider` (string): 'openai', 'gemini', 'supabase'

**Security:**
- Encrypts with AES-256
- Uses master key from vault
- Stores in localStorage

---

#### `savePassword()`
Saves service password.

```javascript
savePassword()
```

**Behavior:**
1. Reads service, username, password
2. Encrypts credentials
3. Adds to password table

---

#### `exportBackup()`
Exports all vault data.

```javascript
exportBackup()
```

**Returns:**
- JSON file download with all encrypted data

---

## localStorage Schema

### Keys

| Key | Type | Description |
|-----|------|-------------|
| `mamta_vault_key` | string | Master key hash |
| `mamta_keys_*` | encrypted | API keys |
| `mamta_passwords_*` | encrypted | Passwords |
| `mamta_backup_*` | encrypted | Backups |
| `mamta_workspace_plan` | JSON | Current plan |
| `mamta_project_*` | JSON | Saved projects |
| `mamta_pending_plan` | string | Plan transfer buffer |

---

## Event System

### Custom Events

```javascript
// Page change
document.addEventListener('pagechange', (e) => {
  console.log('Switched to:', e.detail.page)
})

// Task complete
document.addEventListener('taskcomplete', (e) => {
  console.log('Task done:', e.detail.taskId)
})

// Vault unlock
document.addEventListener('vaultunlock', () => {
  console.log('Vault is now accessible')
})
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `event.target` undefined | Old browser | Use `data-*` attributes |
| `localStorage` full | Quota exceeded | Clear old backups |
| `plan` undefined | No plan loaded | Paste plan first |
| `vault locked` | Wrong master key | Re-enter correct key |

### Error Codes

```javascript
// Navigation errors
NAV001: "Invalid page name"
NAV002: "Page not found in DOM"

// Chat errors
CHAT001: "Empty message"
CHAT002: "AI service unavailable"

// Workspace errors
WS001: "No plan to analyze"
WS002: "Build already in progress"
WS003: "No tasks generated"

// Vault errors
VAULT001: "Master key required"
VAULT002: "Decryption failed"
VAULT003: "Storage quota exceeded"
```
