# MAMTA AI — Database Schema

## Version
1.0.0

## Date
2026-07-02

---

## Schema Overview

Database: PostgreSQL (Supabase)
Tables: 5
Relationships: Foreign keys from chats, projects, files, audit_logs to users

---

## Table: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    security_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| email | TEXT | UNIQUE, NOT NULL | User email |
| name | TEXT | - | Display name |
| role | TEXT | DEFAULT 'user' | user/admin |
| security_score | INTEGER | DEFAULT 0 | Security rating |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation |

---

## Table: chats

```sql
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| user_id | UUID | FK -> users.id | Message owner |
| message | TEXT | NOT NULL | Chat content |
| type | TEXT | DEFAULT 'user' | user/ai |
| created_at | TIMESTAMP | DEFAULT NOW() | Message time |

---

## Table: projects

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    type TEXT,
    features JSONB,
    tech_stack JSONB,
    status TEXT DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| user_id | UUID | FK -> users.id | Project owner |
| name | TEXT | NOT NULL | Project name |
| type | TEXT | - | web/mobile/both |
| features | JSONB | - | Feature list |
| tech_stack | JSONB | - | Technologies |
| status | TEXT | DEFAULT 'planning' | planning/building/deployed |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

## Table: files

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    type TEXT,
    size INTEGER,
    storage_path TEXT,
    encrypted BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| user_id | UUID | FK -> users.id | File owner |
| name | TEXT | NOT NULL | File name |
| type | TEXT | - | pdf/doc/img/code |
| size | INTEGER | - | File size (bytes) |
| storage_path | TEXT | - | Supabase Storage path |
| encrypted | BOOLEAN | DEFAULT true | Encryption status |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload time |

---

## Table: audit_logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique identifier |
| user_id | UUID | FK -> users.id | Action owner |
| action | TEXT | NOT NULL | Action type |
| details | TEXT | - | Additional info |
| created_at | TIMESTAMP | DEFAULT NOW() | Action time |

---

## Relationships

```
users ||--o{ chats : has
users ||--o{ projects : creates
users ||--o{ files : uploads
users ||--o{ audit_logs : generates
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can only see own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own chats" ON chats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own files" ON files
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own logs" ON audit_logs
    FOR ALL USING (auth.uid() = user_id);
```

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```
