/**
 * MAMTA AI V5 - Repair Service
 * API layer for Repair Engine
 * @version 5.0.0
 */
class RepairService {
  constructor(engine) {
    this.engine = engine;
    this.name = 'RepairService';
  }

  async init() {
    if (!this.engine) throw new Error('RepairEngine not provided');
    console.log('[RepairService] Initialized');
    return true;
  }

  async heal(error, context = {}, autoApply = false) {
    return await this.engine.execute({
      action: 'heal',
      error
    }, { ...context, autoApply });
  }

  async analyzeError(error, context = {}) {
    return await this.engine.execute({
      action: 'analyze',
      error
    }, context);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RepairService };
}
