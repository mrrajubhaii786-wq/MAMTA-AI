# MAMTA AI — Naming Conventions

## Version
1.0.0

## Date
2026-07-02

---

## File Naming

### HTML Files
```
page-name.html          # kebab-case
index.html              # exception: main page
workspace.html          # feature name
safedrop.html           # feature name
```

### JavaScript Files
```
service-name.js         # kebab-case
supabase-config.js      # config files
auth.js                 # service name
ai-service.js           # compound names
```

### CSS (Inline for now)
```
Future: styles.css
Future: page-name.css
```

### Documentation Files
```
NN_FILE_NAME.md         # numbered, UPPER_SNAKE_CASE
00_PROJECT_CONSTITUTION.md
01_PROJECT_VISION.md
12_DATABASE_SCHEMA.md
```

---

## JavaScript Naming

### Variables
```javascript
// Constants
const SUPABASE_URL = 'https://...';
const MAX_RETRY_COUNT = 3;
const API_ENDPOINT = '/api/v1';

// Variables
let currentUser = null;
let chatHistory = [];
let isLoading = false;

// Private variables (convention)
let _internalState = {};
let _cache = new Map();
```

### Functions
```javascript
// Regular functions
function getUserProfile() {}
function sendMessage() {}
function encryptFile() {}

// Async functions
async function fetchChatHistory() {}
async function uploadFile() {}

// Event handlers
function handleLogin() {}
function handleSubmit() {}
function onMessageReceived() {}

// Private functions
function _validateInput() {}
function _formatResponse() {}
```

### Classes
```javascript
class AuthService {}
class ChatEngine {}
class SecurityManager {}
class StorageProvider {}
```

---

## Database Naming

### Tables
```sql
users                   # plural, lowercase
chats                   # plural, lowercase
projects                # plural, lowercase
audit_logs              # plural, snake_case
```

### Columns
```sql
id                      # primary key
user_id                 # foreign key
created_at              # timestamp
security_score          # snake_case
is_encrypted            # boolean prefix
```

### Indexes
```sql
idx_chats_user_id       # idx_table_column
idx_users_email         # idx_table_column
```

---

## API Naming

### Endpoints
```
GET    /api/v1/users           # plural nouns
POST   /api/v1/chats
GET    /api/v1/projects/{id}
DELETE /api/v1/files/{id}
```

### Query Parameters
```
?page=1&limit=10
?sort=created_at&order=desc
?filter=status:active
```

---

## Git Naming

### Branches
```
main                    # production
develop                 # development
feature/login-system    # feature/description
fix/chat-bug            # fix/description
hotfix/security-patch   # hotfix/description
```

### Commits
```
feat: add login system
docs: update API registry
fix: resolve chat send bug
refactor: optimize database queries
test: add auth unit tests
```

---

## Color Naming

### CSS Variables
```css
--color-primary: #00F0FF;
--color-secondary: #7B2DFF;
--color-background: #0A0A0F;
--color-text-primary: #FFFFFF;
--color-text-secondary: #8B8B9A;
--color-success: #00FF88;
--color-danger: #FF2D55;
```

---

## Icon Naming

```
icon-home
icon-chat
icon-security
icon-user
icon-settings
icon-logout
```
