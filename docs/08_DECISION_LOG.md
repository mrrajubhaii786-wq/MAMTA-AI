# MAMTA AI — Decision Log

## Version
1.0.0

## Date
2026-07-02

---

## Decision 001: Technology Stack

**Date:** 2026-07-01
**Decision:** Use Supabase instead of Firebase
**Context:** User is familiar with Supabase, not Firebase
**Alternatives:** Firebase, MongoDB, AWS Amplify
**Consequences:** Easier for user to manage, SQL database, real-time features
**Status:** Implemented

---

## Decision 002: AI Name

**Date:** 2026-07-01
**Decision:** Name the AI "MAMTA AI"
**Context:** User requested this specific name
**Alternatives:** Autonomous AI, Smart AI, Build AI
**Consequences:** Unique brand identity, emotional connection
**Status:** Implemented

---

## Decision 003: Hosting Platform

**Date:** 2026-07-01
**Decision:** Use GitHub Pages for hosting
**Context:** Free, easy to deploy, integrated with Git
**Alternatives:** Firebase Hosting, Vercel, Netlify
**Consequences:** Limited to static sites, no server-side code
**Status:** Implemented

---

## Decision 004: Frontend Approach

**Date:** 2026-07-01
**Decision:** Use vanilla HTML/CSS/JS (no framework)
**Context:** Simple project, fast loading, easy to understand
**Alternatives:** React, Vue, Angular
**Consequences:** No component reusability, manual DOM manipulation
**Status:** Implemented

---

## Decision 005: Database Schema

**Date:** 2026-07-02
**Decision:** 5 tables: users, chats, projects, files, audit_logs
**Context:** Cover all current features
**Alternatives:** Single table, NoSQL documents
**Consequences:** Normalized data, complex queries possible
**Status:** Implemented

---

## Decision 006: Documentation System

**Date:** 2026-07-02
**Decision:** Create /docs folder with 21 markdown files
**Context:** Master Plan requirement for AI independence
**Alternatives:** Wiki, Notion, Confluence
**Consequences:** Version controlled, offline accessible, standardized
**Status:** In Progress

---

## Decision 007: Authentication Methods

**Date:** 2026-07-02
**Decision:** Support Email, Google, and Phone auth
**Context:** Maximum user flexibility
**Alternatives:** Email only, OAuth only
**Consequences:** More complex setup, better user experience
**Status:** Planned

---

## Decision 008: AI Integration

**Date:** 2026-07-02
**Decision:** Use OpenAI API as primary, Gemini as fallback
**Context:** OpenAI has best Hindi support
**Alternatives:** Gemini only, Claude only, self-hosted
**Consequences:** API costs, dependency on external service
**Status:** Planned

---

## Decision 009: Security Approach

**Date:** 2026-07-02
**Decision:** Client-side encryption before upload
**Context:** Zero-knowledge architecture
**Alternatives:** Server-side encryption, no encryption
**Consequences:** User controls keys, cannot recover lost keys
**Status:** Planned

---

## Decision 010: Mobile Strategy

**Date:** 2026-07-02
**Decision:** Responsive web first, native app later
**Context:** Faster to market, cross-platform
**Alternatives:** Native app first, PWA only
**Consequences:** Less native feel, easier maintenance
**Status:** Implemented
