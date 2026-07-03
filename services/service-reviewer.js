/**
 * MAMTA AI V5 - Reviewer Service
 * API layer for Reviewer Engine
 * @version 5.0.0
 */
class ReviewerService {
  constructor(engine) {
    this.engine = engine;
    this.name = 'ReviewerService';
  }

  async init() {
    if (!this.engine) throw new Error('ReviewerEngine not provided');
    console.log('[ReviewerService] Initialized');
    return true;
  }

  async reviewCode(code, filename) {
    return await this.engine.execute({
      action: 'review',
      code,
      filename
    });
  }

  async securityAudit(code) {
    return await this.engine.execute({
      action: 'securityAudit',
      code
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReviewerService };
}
