# MAMTA AI — AI Handoff Protocol

## Version
1.0.0

## Date
2026-07-02

---

## Purpose

This document ensures **seamless continuity** between AI sessions.
No matter which AI model takes over, it can understand and continue the project.

---

## Handoff Workflow

### Step 1: Read Constitution
```
Read: docs/00_PROJECT_CONSTITUTION.md
Purpose: Understand project rules and principles
Time: 2 minutes
```

### Step 2: Read Master Plan
```
Read: docs/03_MASTER_PLAN.md
Purpose: Understand current status and priorities
Time: 3 minutes
```

### Step 3: Read Current Sprint
```
Read: docs/05_SPRINTS.md
Purpose: Understand what we're working on now
Time: 2 minutes
```

### Step 4: Read Progress Tracker
```
Read: docs/17_PROGRESS_TRACKER.md
Purpose: See what's done and what's pending
Time: 2 minutes
```

### Step 5: Read Backlog
```
Read: docs/18_BACKLOG.md
Purpose: See future tasks
Time: 1 minute
```

### Step 6: Start Coding
```
Only after understanding:
- Project structure
- Current status
- Immediate priorities
- Technical stack
```

---

## Critical Information

### Project Identity
- **Name:** MAMTA AI
- **Type:** Autonomous AI Platform
- **Language:** Hindi + English
- **Status:** Active Development

### Current Status (As of 2026-07-02)
- ✅ 3 pages created (Home, Workspace, SafeDrop)
- ✅ GitHub repository setup
- ✅ Supabase project configured
- ✅ Database schema created (5 tables)
- ✅ Documentation system (16/21 files)
- 🔴 Login system BROKEN
- 🔴 Chat system BROKEN
- 🔴 Supabase connection BROKEN

### Immediate Priority
**FIX BROKEN SYSTEMS:**
1. Fix login system
2. Fix chat system
3. Fix Supabase connection
4. Test end-to-end

### Technology Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Supabase (PostgreSQL + Auth + Storage)
- AI: OpenAI API / Gemini API
- Hosting: GitHub Pages
- Version Control: Git

### Supabase Config
- **URL:** https://djupszhqebpuohvzamcx.supabase.co
- **Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Tables:** users, chats, projects, files, audit_logs

### GitHub Repository
- **URL:** https://github.com/mrrajubhaii786-wq/MAMTA-AI
- **Live:** https://mrrajubhaii786-wq.github.io/MAMTA-AI/

---

## Communication Rules

### When Starting New Session
1. **Never ask:** "What were we doing?"
2. **Always read:** Documentation first
3. **Continue from:** Last verified task
4. **Update:** Progress tracker after every task

### When Ending Session
1. **Update:** PROGRESS_TRACKER.md
2. **Update:** SPRINTS.md
3. **Commit:** All changes to GitHub
4. **Document:** What was done, what's next

---

## Context Summary

### What Works
- Page layouts and design
- Navigation between pages
- Responsive design
- Basic UI components

### What Doesn't Work
- Login button (no response)
- Chat send (no response)
- Database connection (no data saved)

### What's Next
1. Fix auth.js - Supabase client initialization
2. Fix app.js - Chat event listeners
3. Fix firestore.js - Database operations
4. Test with real Supabase connection
5. Verify data persistence

---

## Emergency Contacts

| Issue | Contact |
|-------|---------|
| GitHub Access | Project Lead |
| Supabase Issues | Project Lead |
| AI API Issues | Project Lead |
| Urgent Decisions | Project Lead |

---

## Quick Reference

```
Project: MAMTA AI
Status: Foundation Phase (Sprint 1)
Priority: Fix Broken Systems
Stack: HTML + Supabase + OpenAI
Repo: mrrajubhaii786-wq/MAMTA-AI
Live: github.io/MAMTA-AI
```

---

## Motto

> **AI conversations are temporary.**
> **Documentation is memory.**
> **GitHub is truth.**
> **MAMTA AI never forgets.**
