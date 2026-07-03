/**
 * MAMTA AI V5 - Core Engine
 * Base class for all autonomous engines
 * @version 5.0.0
 */
class BaseEngine {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
    this.status = 'idle'; // idle, ready, running, error, paused
    this.logs = [];
    this.errors = [];
    this.startTime = null;
    this.metrics = { calls: 0, success: 0, failures: 0 };
  }

  async init() {
    this.startTime = Date.now();
    this.status = 'ready';
    this.log(`🚀 Engine ${this.name} v${this.version} initialized`);
    return true;
  }

  log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      engine: this.name,
      level,
      message
    };
    this.logs.push(entry);
    if (this.logs.length > 500) this.logs.shift();
    console.log(`[${this.name}] ${message}`);
    return entry;
  }

  error(err) {
    const entry = {
      timestamp: new Date().toISOString(),
      engine: this.name,
      error: err.message || String(err),
      stack: err.stack || 'N/A'
    };
    this.errors.push(entry);
    if (this.errors.length > 100) this.errors.shift();
    this.metrics.failures++;
    this.status = 'error';
    console.error(`[${this.name}] ❌ ERROR:`, err);
    return entry;
  }

  async execute(task, context = {}) {
    this.metrics.calls++;
    this.status = 'running';
    try {
      const result = await this.process(task, context);
      this.metrics.success++;
      this.status = 'ready';
      return { success: true, result, engine: this.name };
    } catch (err) {
      this.error(err);
      return { success: false, error: err.message, engine: this.name };
    }
  }

  async process(task, context) {
    throw new Error('process() must be implemented by subclass');
  }

  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: this.status,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      metrics: { ...this.metrics },
      recentLogs: this.logs.slice(-5),
      recentErrors: this.errors.slice(-3)
    };
  }

  reset() {
    this.status = 'idle';
    this.logs = [];
    this.errors = [];
    this.metrics = { calls: 0, success: 0, failures: 0 };
    this.log('Engine reset complete');
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BaseEngine };
}
