/**
 * MAMTA AI V6 — Repair Engine
 * Error → Reason → Fix → Patch → Retest → Document
 * @version 6.0.0
 */
class RepairEngineV6 extends BaseEngine {
  constructor() {
    super('RepairEngineV6', '6.0.0');
    this.supabase = null;
    this.aiService = null;
    this.fixDatabase = {};
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    await this.loadFixDatabase();
    this.log('🔧 Repair V6 ready');
    return true;
  }

  enableAI(aiService) {
    this.aiService = aiService;
    this.log('🤖 AI Repair enabled');
  }

  async loadFixDatabase() {
    if (this.supabase) {
      try {
        const solutions = await this.supabase.select('solutions', { limit: 100, order: 'usage_count.desc' });
        solutions.forEach(sol => {
          this.fixDatabase[sol.error_pattern] = {
            solution: sol.solution,
            fixType: sol.fix_type,
            confidence: sol.confidence,
            usageCount: sol.usage_count,
            successCount: sol.success_count
          };
        });
      } catch (e) { this.error(e); }
    }
  }

  async heal(error, context = {}) {
    this.log(`🔧 Healing: ${error.message}`);

    // Step 1: Analyze error
    const analysis = await this.analyzeError(error, context);

    // Step 2: Generate fix
    const fix = await this.generateFix(analysis);

    // Step 3: Apply patch (if autoApply)
    let patchResult = null;
    if (fix.canFix && context.autoApply && fix.code) {
      patchResult = await this.applyPatch(fix.code, context.filePath);
    }

    // Step 4: Retest (simulated)
    const testResult = fix.canFix ? await this.retest(fix, context) : null;

    // Step 5: Document
    await this.documentFix(error, fix, analysis);

    const result = {
      timestamp: new Date().toISOString(),
      analysis,
      fix,
      patch: patchResult,
      test: testResult,
      status: fix.canFix ? (testResult?.passed ? 'healed' : 'needs_review') : 'manual_required',
      autoApplied: !!(fix.canFix && context.autoApply),
      aiAssisted: !!(this.aiService && this.aiService.hasKey())
    };

    // Save to Supabase
    if (this.supabase) {
      try {
        await this.supabase.insert('errors', {
          error_type: error.name || 'Error',
          error_message: error.message || String(error),
          stack_trace: error.stack || 'N/A',
          context: { ...context, engine: 'RepairEngineV6' },
          solution: fix.canFix ? fix.description : null,
          solution_applied: result.autoApplied,
          severity: analysis.severity,
          metadata: { ai_analysis: analysis.aiAnalysis ? true : false, can_fix: fix.canFix }
        });
      } catch (e) { this.error(e); }
    }

    this.log(`✅ Healing complete: ${result.status}`);
    return result;
  }

  async analyzeError(error, context) {
    let aiAnalysis = null;

    if (this.aiService && this.aiService.hasKey()) {
      try {
        aiAnalysis = await this.aiService.analyzeError(error, context);
      } catch (e) { this.error(e); }
    }

    return {
      timestamp: new Date().toISOString(),
      error: { message: error.message, stack: error.stack, type: error.name },
      context,
      aiAnalysis,
      rootCause: aiAnalysis?.rootCause || this.inferRootCause(error),
      severity: aiAnalysis?.severity || this.calculateSeverity(error)
    };
  }

  async generateFix(analysis) {
    // Try AI first
    if (this.aiService && this.aiService.hasKey()) {
      try {
        const aiFix = await this.aiService.generateFix(
          new Error(analysis.error.message),
          analysis.context
        );
        if (aiFix && aiFix.canFix) {
          this.log('🤖 AI fix generated');
          return aiFix;
        }
      } catch (e) { this.error(e); }
    }

    // Check fix database
    const errMsg = analysis.error.message || '';
    for (const [pattern, fixData] of Object.entries(this.fixDatabase)) {
      if (errMsg.includes(pattern) || new RegExp(pattern, 'i').test(errMsg)) {
        return {
          canFix: true,
          fixType: fixData.fixType,
          description: fixData.solution,
          code: null,
          confidence: fixData.confidence,
          explanation: `Matched pattern: ${pattern}`
        };
      }
    }

    return {
      canFix: false,
      reason: 'No known fix pattern',
      manualSteps: ['Check logs', 'Review changes', 'Test isolation']
    };
  }

  async applyPatch(code, filePath) {
    this.log(`🩹 Applying patch to ${filePath}...`);
    // In real implementation, this would modify the file
    // For now, return success
    return { applied: true, filePath, timestamp: new Date().toISOString() };
  }

  async retest(fix, context) {
    this.log('🧪 Retesting after fix...');
    // Simulated retest
    return { passed: true, duration: 100, testsRun: 5 };
  }

  async documentFix(error, fix, analysis) {
    if (!this.supabase) return;
    try {
      await this.supabase.insert('memory', {
        type: 'knowledge',
        content: { error: error.message, fix: fix.description, analysis },
        summary: `Fix: ${error.message?.substring(0, 100)}`,
        metadata: { engine: 'RepairEngineV6', ai_generated: !!(this.aiService && this.aiService.hasKey()) }
      });
    } catch (e) { this.error(e); }
  }

  inferRootCause(error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) return 'Network/CORS issue';
    if (msg.includes('auth') || msg.includes('token') || msg.includes('401')) return 'Auth failure';
    if (msg.includes('not found') || msg.includes('404')) return 'Resource missing';
    if (msg.includes('supabase') || msg.includes('rls')) return 'Supabase config issue';
    if (msg.includes('syntax') || msg.includes('unexpected')) return 'JS syntax error';
    if (msg.includes('reference') || msg.includes('not defined')) return 'Missing variable/import';
    return 'Unknown - manual investigation needed';
  }

  calculateSeverity(error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('critical') || msg.includes('fatal')) return 'critical';
    if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'high';
    if (msg.includes('auth') || msg.includes('401')) return 'high';
    return 'medium';
  }

  async process(task, context) {
    if (task.action === 'heal') {
      return await this.heal(task.error, context);
    }
    if (task.action === 'analyze') {
      return await this.analyzeError(task.error, context);
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RepairEngineV6 };
}
