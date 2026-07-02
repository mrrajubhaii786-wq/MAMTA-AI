# MAMTA AI — API Registry

## Version
1.0.0

## Date
2026-07-02

---

## Internal APIs (Supabase)

### Authentication APIs

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/v1/signup` | POST | Register new user | No |
| `/auth/v1/token` | POST | Login user | No |
| `/auth/v1/logout` | POST | Logout user | Yes |
| `/auth/v1/user` | GET | Get current user | Yes |
| `/auth/v1/refresh` | POST | Refresh JWT token | Yes |

### Database APIs

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/rest/v1/users` | GET/POST | User data | Yes |
| `/rest/v1/chats` | GET/POST | Chat history | Yes |
| `/rest/v1/projects` | GET/POST | Project data | Yes |
| `/rest/v1/files` | GET/POST | File metadata | Yes |
| `/rest/v1/audit_logs` | GET/POST | Audit logs | Yes |

### Storage APIs

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/storage/v1/object` | POST | Upload file | Yes |
| `/storage/v1/object` | GET | Download file | Yes |
| `/storage/v1/object` | DELETE | Delete file | Yes |
| `/storage/v1/bucket` | GET | List buckets | Yes |

---

## External APIs

### OpenAI API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://api.openai.com/v1/chat/completions` | POST | Chat completions |
| `https://api.openai.com/v1/models` | GET | List models |

**Headers:**
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7
}
```

### Gemini API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` | POST | Generate content |

**Headers:**
```
Content-Type: application/json
x-goog-api-key: {API_KEY}
```

---

## API Rate Limits

| API | Limit | Window |
|-----|-------|--------|
| Supabase Auth | 100 req/min | 1 minute |
| Supabase DB | 1000 req/min | 1 minute |
| Supabase Storage | 100 req/min | 1 minute |
| OpenAI | 60 req/min | 1 minute |
| Gemini | 60 req/min | 1 minute |

---

## API Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | - |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Check auth token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check endpoint URL |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

---

## API Versioning

Current version: **v1**

Version in URL: `/v1/`
Backward compatibility: **2 versions**
Deprecation notice: **30 days**
