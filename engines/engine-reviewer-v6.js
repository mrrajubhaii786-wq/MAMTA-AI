/**
 * MAMTA AI V6 — Reviewer Engine
 * AI-powered code review: Security, Performance, Architecture, Quality
 * @version 6.0.0
 */
class ReviewerEngineV6 extends BaseEngine {
  constructor() {
    super('ReviewerEngineV6', '6.0.0');
    this.supabase = null;
    this.aiService = null;
    this.reviewHistory = [];
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    this.log('🔍 Reviewer V6 ready');
    return true;
  }

  enableAI(aiService) {
    this.aiService = aiService;
    this.log('🤖 AI Review enabled');
  }

  async reviewCode(code, filename = 'code.js', context = {}) {
    this.log(`🔍 Reviewing ${filename}...`);

    let review = null;

    // AI-powered review
    if (this.aiService && this.aiService.hasKey()) {
      try {
        review = await this.aiService.reviewCode(code, filename, context);
        this.log('🤖 AI review complete');
      } catch (e) {
        this.error(e);
        this.log('⚠️ AI review failed, using static analysis');
      }
    }

    // Static analysis fallback
    if (!review) {
      review = this.staticAnalysis(code, filename);
    }

    const reviewEntry = {
      id: `review_${Date.now()}`,
      filename,
      score: review.score || 50,
      issues: review.issues || [],
      security: review.security || [],
      performance: review.performance || [],
      architecture: review.architecture || [],
      naming: review.naming || [],
      dependencies: review.dependencies || [],
      aiGenerated: !!(this.aiService && this.aiService.hasKey()),
      timestamp: new Date().toISOString()
    };

    this.reviewHistory.push(reviewEntry);

    // Save to Supabase
    if (this.supabase) {
      try {
        await this.supabase.insert('memory', {
          type: 'knowledge',
          content: { filename, review: reviewEntry },
          summary: `Review: ${filename} - Score ${reviewEntry.score}/100`,
          metadata: { ai_generated: reviewEntry.aiGenerated, issue_count: reviewEntry.issues.length }
        });
      } catch (e) {
        this.error(e);
      }
    }

    return reviewEntry;
  }

  staticAnalysis(code, filename) {
    const issues = [];
    const security = [];
    const performance = [];
    const architecture = [];
    const naming = [];
    const dependencies = [];

    // Security checks
    if (code.includes('eval(')) security.push('⚠️ eval() detected - security risk');
    if (code.includes('innerHTML') && !code.includes('sanitize')) security.push('⚠️ innerHTML without sanitization');
    if (code.includes('localStorage') && code.includes('password')) security.push('⚠️ Sensitive data in localStorage');
    if (code.match(/api[_-]?key|token|secret/i) && !code.includes('env')) security.push('⚠️ Hardcoded credentials detected');

    // Performance checks
    if (code.includes('for (') && code.includes('length') && !code.includes('cache')) {
      performance.push('⚠️ Potential unoptimized loop');
    }
    if ((code.match(/fetch\(/g) || []).length > 3) {
      performance.push('⚠️ Multiple fetch calls - consider batching');
    }

    // Architecture checks
    if (code.length > 500 && !code.includes('class ') && !code.includes('function')) {
      architecture.push('⚠️ Large file without modular structure');
    }
    if (code.includes('var ') && !code.includes('let ') && !code.includes('const ')) {
      architecture.push('⚠️ Using var instead of let/const');
    }

    // Naming checks
    const badNames = code.match(/(?:var|let|const|function)\s+([a-z])\w+/g);
    if (badNames) naming.push('⚠️ Some variables/functions start with lowercase');

    // Dependency checks
    if (code.includes('import') && !code.includes('package.json')) {
      dependencies.push('ℹ️ Check if all imports are in package.json');
    }

    const totalIssues = issues.length + security.length + performance.length + architecture.length + naming.length;
    const score = Math.max(0, 100 - (totalIssues * 5));

    return {
      score,
      summary: {
        critical: security.length,
        warnings: performance.length + architecture.length,
        suggestions: naming.length + dependencies.length
      },
      issues: [
        ...security.map(m => ({ severity: 'critical', line: 0, message: m, fix: 'Review security' })),
        ...performance.map(m => ({ severity: 'warning', line: 0, message: m, fix: 'Optimize' })),
        ...architecture.map(m => ({ severity: 'warning', line: 0, message: m, fix: 'Refactor' })),
        ...naming.map(m => ({ severity: 'info', line: 0, message: m, fix: 'Rename' })),
        ...dependencies.map(m => ({ severity: 'info', line: 0, message: m, fix: 'Check deps' }))
      ],
      security,
      performance,
      architecture,
      naming,
      dependencies,
      refactor: totalIssues > 0 ? `Address ${totalIssues} issues to improve score` : 'Code looks good!'
    };
  }

  async process(task, context) {
    if (task.action === 'reviewCode') {
      return await this.reviewCode(task.code, task.filename, task.context);
    }
    if (task.action === 'getHistory') {
      return this.reviewHistory;
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReviewerEngineV6 };
}
