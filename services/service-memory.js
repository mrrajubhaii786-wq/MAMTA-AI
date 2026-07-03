/**
 * MAMTA AI V5 - Memory Service
 * API layer for Memory Engine
 * @version 5.0.0
 */
class MemoryService {
  constructor(engine) {
    this.engine = engine;
    this.name = 'MemoryService';
  }

  async init() {
    if (!this.engine) {
      throw new Error('MemoryEngine not provided');
    }
    console.log('[MemoryService] Initialized');
    return true;
  }

  // Store conversation
  async saveConversation(sessionId, messages) {
    return await this.engine.execute({
      action: 'store'
    }, { sessionId, messages });
  }

  // Retrieve memories
  async search(query, type = 'all', limit = 10) {
    return await this.engine.execute({
      action: 'retrieve',
      query,
      type,
      limit
    });
  }

  // Get stats
  async getStats() {
    return await this.engine.execute({ action: 'stats' });
  }

  // Store project
  async saveProject(name, description, files) {
    return this.engine.storeProject(name, description, files);
  }

  // Store knowledge
  async saveKnowledge(topic, content, source) {
    return this.engine.storeKnowledge(topic, content, source);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryService };
}
