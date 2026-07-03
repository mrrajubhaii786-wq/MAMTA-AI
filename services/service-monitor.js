/**
 * MAMTA AI V5 - Monitor Service
 * API layer for Monitor Engine
 * @version 5.0.0
 */
class MonitorService {
  constructor(engine) {
    this.engine = engine;
    this.name = 'MonitorService';
  }

  async init() {
    if (!this.engine) throw new Error('MonitorEngine not provided');
    console.log('[MonitorService] Initialized');
    return true;
  }

  async getHealth() {
    return await this.engine.execute({ action: 'health' });
  }

  async getDashboard() {
    return await this.engine.execute({ action: 'dashboard' });
  }

  async getAlerts(severity = 'all') {
    return await this.engine.execute({
      action: 'alerts',
      severity
    });
  }

  async acknowledgeAlert(alertId) {
    return await this.engine.execute({
      action: 'acknowledge',
      alertId
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MonitorService };
}
