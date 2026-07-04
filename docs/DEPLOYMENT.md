# 🚀 MAMTA AI Deployment Guide

## GitHub Pages Deployment

### Prerequisites
- GitHub account
- Git repository with MAMTA AI code
- GitHub Pages enabled

### Step 1: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Source: **Deploy from a branch**
4. Branch: **main** / **root**
5. Click **Save**

### Step 2: Verify Deployment

1. Wait 2-3 minutes for build
2. Visit: `https://mrrajubhaii786-wq.github.io/MAMTA-AI/`
3. Check if site loads correctly

### Step 3: Custom Domain (Optional)

1. In Pages settings, add custom domain
2. Create `CNAME` file in repository root
3. Configure DNS A records:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

---

## Manual Deployment

### Local Testing

```bash
# Clone repository
git clone https://github.com/mrrajubhaii786-wq/MAMTA-AI.git
cd MAMTA-AI

# Serve locally (Python)
python -m http.server 8000

# Or Node.js
npx serve .

# Open browser
open http://localhost:8000
```

### File Structure

```
MAMTA-AI/
├── index.html          # Main application
├── assets/
│   └── mamta_logo.svg  # Logo
├── docs/               # Documentation
├── CNAME               # Custom domain
└── README.md           # Project readme
```

---

## Environment Variables

Not applicable — MAMTA AI is client-side only.

Configuration is done through:
- **SafeDrop Vault** — API keys
- **localStorage** — User preferences
- **URL Parameters** — Debug mode

### Debug Mode

Add `?debug=true` to URL:
```
https://mrrajubhaii786-wq.github.io/MAMTA-AI/?debug=true
```

This enables:
- Console logging
- Error stack traces
- Performance metrics

---

## Backup & Restore

### Manual Backup

1. Open **🔐 SafeDrop**
2. Go to **Backup** tab
3. Click **Export Backup**
4. Save JSON file securely

### Restore

1. Open **🔐 SafeDrop**
2. Go to **Backup** tab
3. Click **Import Backup**
4. Select backup JSON file

---

## Troubleshooting

### Site Not Updating

| Symptom | Cause | Solution |
|---------|-------|----------|
| Old version showing | CDN cache | Wait 5 min, hard refresh |
| 404 error | Wrong branch | Check Pages settings |
| Broken CSS | File path | Verify `assets/` path |

### Common Issues

**Issue:** `event.target` error in console
**Fix:** Update to V6.7+ (fixed in latest)

**Issue:** Chat not sending
**Fix:** Check `home-chat-input` ID exists

**Issue:** Workspace not loading
**Fix:** Clear localStorage, refresh

**Issue:** Vault not unlocking
**Fix:** Re-enter master key, check caps lock

---

## Performance Optimization

### Current Metrics

| Metric | Value |
|--------|-------|
| Page Load | < 2s |
| First Paint | < 1s |
| Interactive | < 3s |
| Bundle Size | 95KB |

### Optimization Tips

1. **Enable gzip** on server
2. **Cache SVG** logo (1 year)
3. **Minify HTML** for production
4. **Lazy load** non-critical CSS

---

## Security Checklist

- [ ] No API keys in source code
- [ ] Vault master key is strong
- [ ] HTTPS enabled
- [ ] Content Security Policy set
- [ ] No eval() or innerHTML with user input

---

## Support

- **Issues:** https://github.com/mrrajubhaii786-wq/MAMTA-AI/issues
- **Discussions:** https://github.com/mrrajubhaii786-wq/MAMTA-AI/discussions
- **Email:** support@mamta-ai.dev
