/**
 * MAMTA AI V5 - Reviewer Engine
 * Code review, quality checks, security audit
 * @version 5.0.0
 */
class ReviewerEngine extends BaseEngine {
  constructor() {
    super('ReviewerEngine', '5.0.0');
    this.rules = this.loadRules();
  }

  async init() {
    await super.init();
    this.log(`🔍 Reviewer ready with ${this.rules.length} rules`);
    return true;
  }

  loadRules() {
    return [
      { id: 'SEC-001', category: 'security', severity: 'critical', pattern: /eval\s*\(/, message: 'Avoid using eval() - XSS risk' },
      { id: 'SEC-002', category: 'security', severity: 'high', pattern: /innerHTML\s*=/, message: 'Use textContent instead of innerHTML to prevent XSS' },
      { id: 'SEC-003', category: 'security', severity: 'high', pattern: /localStorage\.getItem\(['"]password/, message: 'Never store passwords in localStorage' },
      { id: 'PERF-001', category: 'performance', severity: 'medium', pattern: /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*[^;]+\.length/, message: 'Cache array length in loops' },
      { id: 'PERF-002', category: 'performance', severity: 'low', pattern: /console\.log/, message: 'Remove console.log in production' },
      { id: 'QUAL-001', category: 'quality', severity: 'medium', pattern: /var\s+/, message: 'Use let or const instead of var' },
      { id: 'QUAL-002', category: 'quality', severity: 'low', pattern: /==\s*[^=]/, message: 'Use === instead of ==' },
      { id: 'QUAL-003', category: 'quality', severity: 'low', pattern: /function\s*\(\s*\)\s*\{[^}]*\}/, message: 'Consider arrow functions for cleaner code' },
      { id: 'ARCH-001', category: 'architecture', severity: 'medium', pattern: /new\s+XMLHttpRequest/, message: 'Use fetch() API instead of XMLHttpRequest' }
    ];
  }

  reviewCode(code, filename = 'unknown.js') {
    this.log(`🔍 Reviewing: ${filename}`);
    const issues = [];
    const lines = code.split('\n');

    this.rules.forEach(rule => {
      lines.forEach((line, idx) => {
        if (rule.pattern.test(line)) {
          issues.push({
            ruleId: rule.id,
            category: rule.category,
            severity: rule.severity,
            line: idx + 1,
            message: rule.message,
            code: line.trim()
          });
        }
      });
    });

    // Additional checks
    const hasJSDoc = code.includes('/**') && code.includes('@');
    const hasErrorHandling = code.includes('try') && code.includes('catch');
    const hasAsyncAwait = code.includes('async') && code.includes('await');

    const report = {
      filename,
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
        hasJSDoc,
        hasErrorHandling,
        hasAsyncAwait
      },
      issues: issues.sort((a, b) => {
        const sev = { critical: 0, high: 1, medium: 2, low: 3 };
        return sev[a.severity] - sev[b.severity];
      }),
      score: this.calculateScore(issues, hasJSDoc, hasErrorHandling)
    };

    this.log(`✅ Review complete: ${report.summary.critical} critical, ${report.summary.high} high, Score: ${report.score}/100`);
    return report;
  }

  calculateScore(issues, hasJSDoc, hasErrorHandling) {
    let score = 100;
    issues.forEach(i => {
      if (i.severity === 'critical') score -= 20;
      else if (i.severity === 'high') score -= 10;
      else if (i.severity === 'medium') score -= 5;
      else score -= 2;
    });
    if (!hasJSDoc) score -= 5;
    if (!hasErrorHandling) score -= 5;
    return Math.max(0, Math.min(100, score));
  }

  securityAudit(code) {
    const audit = {
      timestamp: new Date().toISOString(),
      checks: [
        { name: 'No eval()', pass: !/eval\s*\(/.test(code) },
        { name: 'No innerHTML', pass: !/innerHTML\s*=/.test(code) },
        { name: 'HTTPS URLs', pass: !/http:\/\//.test(code) || /https:\/\//.test(code) },
        { name: 'Input validation', pass: code.includes('sanitize') || code.includes('validate') },
        { name: 'CSP headers', pass: code.includes('Content-Security-Policy') },
        { name: 'No hardcoded secrets', pass: !/(api[_-]?key|password|secret)\s*=\s*['"][^'"]+['"]/i.test(code) }
      ]
    };
    audit.passed = audit.checks.filter(c => c.pass).length;
    audit.total = audit.checks.length;
    audit.score = Math.round((audit.passed / audit.total) * 100);
    return audit;
  }

  async process(task, context) {
    if (task.action === 'review') {
      return this.reviewCode(task.code, task.filename);
    }
    if (task.action === 'securityAudit') {
      return this.securityAudit(task.code);
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReviewerEngine };
}
