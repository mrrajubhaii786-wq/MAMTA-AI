# 🤝 Contributing to MAMTA AI

Thank you for your interest in contributing to MAMTA AI! This document provides guidelines for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Credit original authors

## How to Contribute

### Reporting Bugs

1. **Check existing issues** first
2. **Create new issue** with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser/OS info

### Suggesting Features

1. **Open discussion** first
2. **Explain use case**
3. **Describe solution**
4. **Consider alternatives**

### Code Contributions

#### Setup

```bash
# Fork repository
git clone https://github.com/YOUR_USERNAME/MAMTA-AI.git
cd MAMTA-AI

# Create branch
git checkout -b feature/your-feature

# Make changes
# Test locally
python -m http.server 8000

# Commit
git add .
git commit -m "feat: add your feature"

# Push
git push origin feature/your-feature

# Create Pull Request
```

#### Code Style

- **HTML:** 2-space indentation
- **CSS:** BEM naming convention
- **JS:** camelCase, semicolons
- **Comments:** Explain why, not what

#### File Structure

```
MAMTA-AI/
├── index.html          # Main SPA
├── assets/             # Images, logos
├── docs/               # Documentation
└── README.md           # Project readme
```

### Testing Checklist

Before submitting PR:

- [ ] All 4 pages load correctly
- [ ] Navigation works (all tabs)
- [ ] Home chat sends messages
- [ ] Workspace analyzes plans
- [ ] Admin shows metrics
- [ ] SafeDrop encrypts data
- [ ] Mobile layout works
- [ ] No console errors
- [ ] No `event.target` bugs

### Commit Messages

Format: `type: description`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` CSS/styling
- `refactor:` Code restructuring
- `perf:` Performance
- `test:` Tests
- `chore:` Maintenance

Examples:
```
feat: add voice input to home chat
fix: resolve event.target in navigation
docs: update API documentation
style: improve mobile responsive layout
```

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** if applicable
3. **Ensure clean** commit history
4. **Request review** from maintainers
5. **Address feedback** promptly

---

## Development Guidelines

### Adding New Pages

1. Create page div: `<div class="page" id="page-name">`
2. Add nav button: `<button data-page="name">`
3. Add CSS styles
4. Add JavaScript handlers

### Adding New Features

1. **Plan first** — Open discussion
2. **Prototype** — Minimal viable version
3. **Test** — All scenarios
4. **Document** — Update docs/
5. **Polish** — UX improvements

### Security Considerations

- Never commit API keys
- Sanitize user input
- Use encryption for sensitive data
- Follow CSP guidelines

---

## Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Credited in commit history

---

## Questions?

- **Discussions:** https://github.com/mrrajubhaii786-wq/MAMTA-AI/discussions
- **Issues:** https://github.com/mrrajubhaii786-wq/MAMTA-AI/issues
- **Email:** contribute@mamta-ai.dev

Thank you for contributing! 🚀
