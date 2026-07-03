/**
 * MAMTA AI V5 - Learning Service
 * API layer for Learning Engine
 * @version 5.0.0
 */
class LearningService {
  constructor(engine) {
    this.engine = engine;
    this.name = 'LearningService';
  }

  async init() {
    if (!this.engine) throw new Error('LearningEngine not provided');
    console.log('[LearningService] Initialized');
    return true;
  }

  async learn(interaction) {
    return await this.engine.execute({
      action: 'learn'
    }, interaction);
  }

  async getAdvice(context) {
    return await this.engine.execute({
      action: 'getAdvice',
      context
    });
  }

  async getPatterns(errorType) {
    return await this.engine.execute({
      action: 'getPatterns',
      errorType
    });
  }

  async getMetrics() {
    return await this.engine.execute({ action: 'metrics' });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LearningService };
}
