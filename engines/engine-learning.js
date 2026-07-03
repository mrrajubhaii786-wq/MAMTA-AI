/**
 * MAMTA AI V5 - Learning Engine
 * Learn from mistakes, pattern recognition, continuous improvement
 * @version 5.0.0
 */
class LearningEngine extends BaseEngine {
  constructor() {
    super('LearningEngine', '5.0.0');
    this.patterns = [];
    this.learnings = [];
    this.storageKey = 'mamta_v5_learning';
  }

  async init() {
    await super.init();
    this.loadLearnings();
    this.log(`🧠 Learning engine ready: ${this.learnings.length} past learnings loaded`);
    return true;
  }

  loadLearnings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = data.patterns || [];
        this.learnings = data.learnings || [];
      }
    } catch (e) { this.error(e); }
  }

  saveLearnings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        patterns: this.patterns,
        learnings: this.learnings
      }));
    } catch (e) { this.error(e); }
  }

  // Learn from an interaction
  learn(interaction) {
    const learning = {
      id: `learn_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: interaction.type, // 'success', 'failure', 'pattern', 'feedback'
      input: interaction.input,
      output: interaction.output,
      context: interaction.context,
      outcome: interaction.outcome,
      lesson: this.extractLesson(interaction)
    };

    this.learnings.push(learning);
    if (this.learnings.length > 1000) this.learnings.shift();

    // Extract pattern if it's a failure
    if (interaction.outcome === 'failure') {
      this.extractPattern(interaction);
    }

    this.saveLearnings();
    this.log(`🧠 Learned: ${learning.lesson}`);
    return learning;
  }

  extractLesson(interaction) {
    if (interaction.outcome === 'success') {
      return `Successful approach: ${interaction.input.substring(0, 50)}...`;
    }
    if (interaction.outcome === 'failure') {
      return `Avoid: ${interaction.error || 'unknown error'} - Try alternative approach`;
    }
    return 'New pattern observed';
  }

  extractPattern(interaction) {
    const pattern = {
      id: `pat_${Date.now()}`,
      type: 'error_pattern',
      trigger: interaction.input.substring(0, 100),
      error: interaction.error,
      frequency: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    // Check if similar pattern exists
    const existing = this.patterns.find(p => 
      p.error === pattern.error && 
      p.trigger.substring(0, 30) === pattern.trigger.substring(0, 30)
    );

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date().toISOString();
    } else {
      this.patterns.push(pattern);
    }

    if (this.patterns.length > 500) this.patterns.shift();
  }

  // Get advice based on current context
  getAdvice(context) {
    const relevant = this.learnings.filter(l => 
      l.context && l.context.includes(context)
    );

    const failures = relevant.filter(l => l.outcome === 'failure');
    const successes = relevant.filter(l => l.outcome === 'success');

    return {
      context,
      totalExperiences: relevant.length,
      failureRate: failures.length / Math.max(relevant.length, 1),
      commonMistakes: failures.slice(0, 3).map(f => f.lesson),
      bestPractices: successes.slice(0, 3).map(s => s.lesson),
      recommendation: failures.length > successes.length 
        ? '⚠️ High failure rate detected. Proceed with caution.' 
        : '✅ Based on past success, this approach looks good.'
    };
  }

  // Get patterns for a specific error type
  getPatterns(errorType) {
    return this.patterns
      .filter(p => p.error && p.error.includes(errorType))
      .sort((a, b) => b.frequency - a.frequency);
  }

  // Calculate system improvement over time
  getImprovementMetrics() {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const recent = this.learnings.filter(l => new Date(l.timestamp).getTime() > weekAgo);
    const old = this.learnings.filter(l => new Date(l.timestamp).getTime() <= weekAgo);

    const recentSuccess = recent.filter(l => l.outcome === 'success').length;
    const recentTotal = recent.length;
    const oldSuccess = old.filter(l => l.outcome === 'success').length;
    const oldTotal = old.length;

    return {
      totalLearnings: this.learnings.length,
      totalPatterns: this.patterns.length,
      recentSuccessRate: recentTotal > 0 ? (recentSuccess / recentTotal) : 0,
      oldSuccessRate: oldTotal > 0 ? (oldSuccess / oldTotal) : 0,
      improvement: recentTotal > 0 && oldTotal > 0 
        ? ((recentSuccess / recentTotal) - (oldSuccess / oldTotal)) * 100 
        : 0
    };
  }

  async process(task, context) {
    if (task.action === 'learn') {
      return this.learn(context);
    }
    if (task.action === 'getAdvice') {
      return this.getAdvice(task.context);
    }
    if (task.action === 'getPatterns') {
      return this.getPatterns(task.errorType);
    }
    if (task.action === 'metrics') {
      return this.getImprovementMetrics();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LearningEngine };
}
