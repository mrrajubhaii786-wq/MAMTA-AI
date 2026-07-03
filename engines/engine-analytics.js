/**
 * MAMTA AI V6 — Analytics Engine
 * System metrics, performance tracking, usage analytics
 * @version 6.0.0
 */
class AnalyticsEngine extends BaseEngine {
  constructor() {
    super('AnalyticsEngine', '6.0.0');
    this.metrics = {
      engineUsage: {},
      responseTimes: [],
      errorRates: {},
      aiUsage: { calls: 0, tokens: 0, cost: 0 },
      dbUsage: { reads: 0, writes: 0 }
    };
    this.supabase = null;
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    this.log('📊 Analytics Engine ready');
    return true;
  }

  // Track engine execution
  trackEngine(engineName, duration, success, error = null) {
    if (!this.metrics.engineUsage[engineName]) {
      this.metrics.engineUsage[engineName] = { calls: 0, success: 0, failures: 0, avgDuration: 0 };
    }

    const stats = this.metrics.engineUsage[engineName];
    stats.calls++;
    if (success) stats.success++;
    else stats.failures++;

    // Update rolling average
    stats.avgDuration = (stats.avgDuration * (stats.calls - 1) + duration) / stats.calls;

    this.metrics.responseTimes.push({ engine: engineName, duration, timestamp: Date.now() });

    // Keep only last 1000 response times
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
    }

    if (error) {
      if (!this.metrics.errorRates[engineName]) this.metrics.errorRates[engineName] = 0;
      this.metrics.errorRates[engineName]++;
    }
  }

  // Track AI usage
  trackAIUsage(tokens, cost = 0) {
    this.metrics.aiUsage.calls++;
    this.metrics.aiUsage.tokens += tokens || 0;
    this.metrics.aiUsage.cost += cost;
  }

  // Track DB usage
  trackDBUsage(reads = 0, writes = 0) {
    this.metrics.dbUsage.reads += reads;
    this.metrics.dbUsage.writes += writes;
  }

  // Get performance report
  getPerformanceReport() {
    const now = Date.now();
    const lastHour = this.metrics.responseTimes.filter(r => now - r.timestamp < 3600000);

    return {
      engines: this.metrics.engineUsage,
      responseTime: {
        avg: lastHour.length > 0 ? lastHour.reduce((s, r) => s + r.duration, 0) / lastHour.length : 0,
        min: lastHour.length > 0 ? Math.min(...lastHour.map(r => r.duration)) : 0,
        max: lastHour.length > 0 ? Math.max(...lastHour.map(r => r.duration)) : 0,
        p95: this.calculatePercentile(lastHour.map(r => r.duration), 95)
      },
      errors: this.metrics.errorRates,
      ai: this.metrics.aiUsage,
      database: this.metrics.dbUsage,
      uptime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  // Generate dashboard data
  async getDashboardData() {
    const report = this.getPerformanceReport();

    let dbStats = null;
    if (this.supabase) {
      try {
        const tables = ['memory', 'tasks', 'plans', 'errors', 'agent_logs', 'learning_history'];
        dbStats = {};
        for (const table of tables) {
          const count = await this.supabase.count(table);
          dbStats[table] = count;
        }
      } catch (e) {
        this.error(e);
      }
    }

    return {
      ...report,
      databaseStats: dbStats,
      timestamp: new Date().toISOString()
    };
  }

  // Predict system health
  predictHealth() {
    const report = this.getPerformanceReport();
    const errorRate = Object.values(report.errors).reduce((a, b) => a + b, 0);
    const totalCalls = Object.values(report.engines).reduce((a, e) => a + e.calls, 0);

    const healthScore = totalCalls > 0 
      ? Math.max(0, 100 - (errorRate / totalCalls * 100)) 
      : 100;

    return {
      score: Math.round(healthScore),
      status: healthScore > 90 ? 'healthy' : healthScore > 70 ? 'warning' : 'critical',
      predictions: [
        errorRate > 5 ? 'High error rate detected - investigate Repair Engine' : 'Error rate normal',
        report.responseTime.avg > 1000 ? 'Response times increasing - check AI provider latency' : 'Response times healthy'
      ]
    };
  }

  getStats() {
    return {
      ...this.getPerformanceReport(),
      health: this.predictHealth()
    };
  }

  async process(task, context) {
    if (task.action === 'trackEngine') {
      this.trackEngine(task.engineName, task.duration, task.success, task.error);
      return { tracked: true };
    }
    if (task.action === 'trackAI') {
      this.trackAIUsage(task.tokens, task.cost);
      return { tracked: true };
    }
    if (task.action === 'trackDB') {
      this.trackDBUsage(task.reads, task.writes);
      return { tracked: true };
    }
    if (task.action === 'report') {
      return this.getPerformanceReport();
    }
    if (task.action === 'dashboard') {
      return await this.getDashboardData();
    }
    if (task.action === 'health') {
      return this.predictHealth();
    }
    if (task.action === 'stats') {
      return this.getStats();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnalyticsEngine };
}
