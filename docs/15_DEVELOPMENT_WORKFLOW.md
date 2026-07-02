# MAMTA AI — Development Workflow

## Version
1.0.0

## Date
2026-07-02

---

## Workflow Overview

```
1. PLAN -> 2. CODE -> 3. TEST -> 4. REVIEW -> 5. DEPLOY
```

---

## Step 1: Plan

### Before Coding
- [ ] Read 03_MASTER_PLAN.md
- [ ] Check 17_PROGRESS_TRACKER.md
- [ ] Review 05_SPRINTS.md
- [ ] Update 18_BACKLOG.md

### Create Task
```
ID: T-XXX
Title: Clear description
Priority: Critical/High/Medium/Low
Status: Planned
Owner: AI/User
Dependencies: List any
```

---

## Step 2: Code

### Development Rules
1. **Document First:** Update relevant docs before coding
2. **Feature Branch:** Create branch `feature/description`
3. **Code Standards:** Follow NAMING_CONVENTIONS.md
4. **Comments:** Comment complex logic
5. **Error Handling:** Always handle errors gracefully

### Code Template
```javascript
/**
 * Function: description
 * @param {type} name - description
 * @returns {type} description
 */
function functionName(param) {
    try {
        // Implementation
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

---

## Step 3: Test

### Testing Checklist
- [ ] Local test (localhost)
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser check

### Test Types
1. **Unit Test:** Individual functions
2. **Integration Test:** Feature flow
3. **E2E Test:** Full user journey
4. **Performance Test:** Load time < 2s

---

## Step 4: Review

### Self-Review Checklist
- [ ] Code follows conventions
- [ ] No hardcoded secrets
- [ ] Error handling present
- [ ] Comments added
- [ ] Documentation updated

### Peer Review (Future)
- [ ] Create Pull Request
- [ ] Request review
- [ ] Address feedback
- [ ] Merge to develop

---

## Step 5: Deploy

### Deployment Steps
1. **Commit:** `git commit -m "feat: description"`
2. **Push:** `git push origin branch-name`
3. **Merge:** Create PR to main
4. **Build:** GitHub Actions builds
5. **Verify:** Check live URL

### Post-Deploy
- [ ] Test live site
- [ ] Check analytics
- [ ] Monitor errors
- [ ] Update CHANGELOG.md
- [ ] Update PROGRESS_TRACKER.md

---

## Emergency Hotfix

```
1. Create branch: hotfix/description
2. Fix issue
3. Test locally
4. Direct push to main (if critical)
5. Update docs
6. Notify team
```

---

## Communication

### Daily Standup (Future)
- What did I do yesterday?
- What will I do today?
- Any blockers?

### Documentation Updates
- Every feature -> Update docs
- Every bug fix -> Update CHANGELOG
- Every decision -> Update DECISION_LOG

---

## Tools

| Purpose | Tool |
|---------|------|
| Code Editor | VS Code |
| Version Control | Git + GitHub |
| Database | Supabase |
| Hosting | GitHub Pages |
| AI | OpenAI/Gemini |
| Communication | GitHub Issues |
| Documentation | Markdown |
