/**
 * MAMTA AI V5 - Monitor Engine
 * Production monitoring, health checks, performance tracking
 * @version 5.0.0
 */
class MonitorEngine extends BaseEngine {
  constructor() {
    super('MonitorEngine', '5.0.0');
    this.metrics = {
      requests: 0,
      errors: 0,
      latency: [],
      uptime: 0
    };
    this.healthChecks = [];
    this.alerts = [];
    this.startTime = Date.now();
    this.storageKey = 'mamta_v5_monitor';
  }

  async init() {
    await super.init();
    this.startHealthChecks();
    this.log(`📊 Monitor engine active`);
    return true;
  }

  startHealthChecks() {
    // System health check every 30 seconds
    setInterval(() => this.checkSystemHealth(), 30000);

    // Performance check every 10 seconds
    setInterval(() => this.checkPerformance(), 10000);
  }

  checkSystemHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      memory: this.getMemoryUsage(),
      online: navigator.onLine,
      engines: this.getEngineHealth(),
      storage: this.getStorageHealth()
    };

    this.healthChecks.push(health);
    if (this.healthChecks.length > 100) this.healthChecks.shift();

    // Alert if issues detected
    if (!health.online) {
      this.triggerAlert('network', 'System is offline', 'critical');
    }
    if (health.memory.used > health.memory.limit * 0.9) {
      this.triggerAlert('memory', 'Memory usage critical', 'high');
    }

    return health;
  }

  getMemoryUsage() {
    if (performance && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percent: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
      };
    }
    return { used: 0, total: 0, limit: 0, percent: 0 };
  }

  getEngineHealth() {
    // Check if global engines exist
    const engines = ['memoryEngine', 'plannerEngine', 'builderEngine', 'reviewerEngine', 
                     'repairEngine', 'learningEngine', 'deploymentEngine', 'evolutionEngine'];
    return engines.map(name => {
      const engine = window[name];
      return {
        name,
        status: engine ? engine.status : 'not_loaded',
        uptime: engine ? (Date.now() - engine.startTime) : 0
      };
    });
  }

  getStorageHealth() {
    try {
      const total = JSON.stringify(localStorage).length;
      const limit = 5 * 1024 * 1024; // 5MB approx
      return {
        used: total,
        limit,
        percent: Math.round((total / limit) * 100),
        items: Object.keys(localStorage).length
      };
    } catch (e) {
      return { used: 0, limit: 0, percent: 0, items: 0, error: e.message };
    }
  }

  checkPerformance() {
    const perf = {
      timestamp: new Date().toISOString(),
      loadTime: performance.timing ? (performance.timing.loadEventEnd - performance.timing.navigationStart) : 0,
      domReady: performance.timing ? (performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) : 0,
      fps: this.getFPS(),
      latency: this.getAverageLatency()
    };
    return perf;
  }

  getFPS() {
    // Simplified FPS estimation
    return 60; // Placeholder
  }

  recordLatency(duration) {
    this.metrics.latency.push(duration);
    if (this.metrics.latency.length > 100) this.metrics.latency.shift();
  }

  getAverageLatency() {
    if (this.metrics.latency.length === 0) return 0;
    return this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length;
  }

  triggerAlert(type, message, severity = 'medium') {
    const alert = {
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      severity,
      acknowledged: false
    };
    this.alerts.push(alert);
    if (this.alerts.length > 50) this.alerts.shift();

    this.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`);

    // Show toast if available
    if (window.showToast) {
      window.showToast(message, severity === 'critical' ? 'error' : 'warning');
    }

    return alert;
  }

  getAlerts(severity = 'all') {
    if (severity === 'all') return this.alerts;
    return this.alerts.filter(a => a.severity === severity);
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) alert.acknowledged = true;
    return alert;
  }

  getDashboard() {
    return {
      uptime: Date.now() - this.startTime,
      uptimeFormatted: this.formatUptime(Date.now() - this.startTime),
      health: this.healthChecks.slice(-1)[0] || {},
      performance: this.checkPerformance(),
      alerts: {
        total: this.alerts.length,
        critical: this.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
        high: this.alerts.filter(a => a.severity === 'high' && !a.acknowledged).length,
        pending: this.alerts.filter(a => !a.acknowledged).length
      },
      engines: this.getEngineHealth(),
      storage: this.getStorageHealth()
    };
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  }

  async process(task, context) {
    if (task.action === 'health') {
      return this.checkSystemHealth();
    }
    if (task.action === 'dashboard') {
      return this.getDashboard();
    }
    if (task.action === 'alerts') {
      return this.getAlerts(task.severity);
    }
    if (task.action === 'acknowledge') {
      return this.acknowledgeAlert(task.alertId);
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MonitorEngine };
}
