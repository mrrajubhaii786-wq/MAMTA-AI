# 🔧 MAMTA AI Troubleshooting Guide

## Quick Fixes

### Page Not Loading

```
1. Check internet connection
2. Try hard refresh: Ctrl+Shift+R
3. Clear browser cache
4. Check GitHub Pages status
```

### Navigation Not Working

**Symptom:** Clicking tabs doesn't switch pages

**Causes:**
- `event.target` bug (V6.6 and earlier)
- JavaScript error
- Missing page div

**Fix:**
```javascript
// Check console for errors
// If event.target error, update to V6.7+
// Verify page divs exist:
document.getElementById('page-home')
document.getElementById('page-workspace')
document.getElementById('page-admin')
document.getElementById('page-safedrop')
```

---

## Home Chat Issues

### Messages Not Sending

**Symptom:** Press Enter or click Send, nothing happens

**Check:**
1. Input field ID: `home-chat-input`
2. Messages container ID: `home-chat-messages`
3. `sendHomeChat()` function exists

**Fix:**
```javascript
// Verify in console
document.getElementById('home-chat-input')
document.getElementById('home-chat-messages')
typeof sendHomeChat
```

### Quick Actions Not Working

**Symptom:** Clicking quick chips does nothing

**Fix:**
```javascript
// Check homeQuick function
homeQuick('Plan a project')
// Should populate input and trigger send
```

---

## Workspace Issues

### Plan Not Analyzing

**Symptom:** Click "Analyze Plan" but no tasks appear

**Causes:**
- Empty input
- Invalid markdown
- JavaScript error

**Fix:**
1. Paste plan in `#mp-input`
2. Check plan has bullet points (`-` or `*`)
3. Check console for errors

### Build Not Starting

**Symptom:** Click "Build Project" but no progress

**Fix:**
```javascript
// Check tasks exist
// Run analyze first
analyzeMasterPlan()
// Then build
buildProject()
```

### Files Not Generating

**Symptom:** Build completes but no files shown

**Fix:**
- Check `#mp-file-list` div exists
- Verify build actually ran
- Check build logs for errors

---

## Admin Issues

### Metrics Not Loading

**Symptom:** Dashboard shows "Checking..." or "—"

**Fix:**
```javascript
// Manual refresh
refreshMetrics()
// Or check if engines are running
checkEngineStatus()
```

### Health Score Low

**Symptom:** Health score below 90%

**Common Causes:**
- Missing API keys
- Database not connected
- Low test coverage

**Fix:**
1. Configure API keys in SafeDrop
2. Check Supabase connection
3. Run tests to improve coverage

---

## SafeDrop Issues

### Vault Not Unlocking

**Symptom:** Enter master key but vault stays locked

**Causes:**
- Wrong master key
- Corrupted localStorage
- First-time setup

**Fix:**
```javascript
// Reset vault (WARNING: deletes all data)
localStorage.removeItem('mamta_vault_key')
localStorage.removeItem('mamta_keys_openai')
localStorage.removeItem('mamta_keys_gemini')
// Reload page and set new master key
```

### API Keys Not Saving

**Symptom:** Enter key, click save, but status shows "Not Configured"

**Fix:**
1. Check vault is unlocked
2. Verify key format (starts with `sk-` for OpenAI)
3. Check localStorage quota
4. Try clearing old keys first

### Backup Export Failing

**Symptom:** Click "Export" but no file downloads

**Fix:**
- Check pop-up blocker
- Verify vault has data
- Try different browser

---

## Mobile Issues

### Layout Broken on Phone

**Symptom:** Elements overlap, text too small

**Fix:**
1. Check viewport meta tag
2. Verify CSS media queries
3. Test on actual device (not just emulator)

### Touch Buttons Not Working

**Symptom:** Tapping buttons has no effect

**Fix:**
- Ensure buttons are 44px+ tall
- Check for `touch-action: manipulation`
- Verify no overlapping elements

---

## Performance Issues

### Slow Loading

**Symptom:** Page takes > 5 seconds to load

**Causes:**
- Large HTML file (95KB+)
- Slow internet
- GitHub Pages CDN latency

**Fix:**
1. Enable browser cache
2. Use CDN for assets
3. Minify HTML for production

### Laggy Animations

**Symptom:** Animations stutter or freeze

**Fix:**
```css
/* Reduce animation complexity */
.animated-element {
  will-change: transform;
  transform: translateZ(0);
}
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| NAV001 | Invalid page | Check page name |
| NAV002 | Page missing | Verify HTML structure |
| CHAT001 | Empty message | Type something |
| CHAT002 | AI offline | Check API key |
| WS001 | No plan | Paste plan first |
| WS002 | Build running | Wait or cancel |
| WS003 | No tasks | Run analyze first |
| VAULT001 | No master key | Set master key |
| VAULT002 | Decrypt failed | Wrong key |
| VAULT003 | Storage full | Clear old data |

---

## Getting Help

1. **Check console** (F12) for errors
2. **Search issues** on GitHub
3. **Create issue** with:
   - Browser version
   - Screenshot
   - Console errors
   - Steps to reproduce

**GitHub Issues:** https://github.com/mrrajubhaii786-wq/MAMTA-AI/issues
