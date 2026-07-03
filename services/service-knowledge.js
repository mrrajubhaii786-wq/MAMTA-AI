/**
 * MAMTA AI V5 - Knowledge Service
 * Knowledge base management, topic organization, search
 * @version 5.0.0
 */
class KnowledgeService {
  constructor(memoryEngine) {
    this.memory = memoryEngine;
    this.name = 'KnowledgeService';
    this.topics = new Map();
  }

  async init() {
    if (!this.memory) throw new Error('MemoryEngine not provided');
    console.log('[KnowledgeService] Initialized');
    return true;
  }

  async addTopic(topic, content, source = 'ai') {
    return this.memory.storeKnowledge(topic, content, source);
  }

  async searchTopics(query, limit = 10) {
    return this.memory.retrieve(query, 'knowledge', limit);
  }

  async getRelatedTopics(topic) {
    const all = this.memory.memory.knowledge;
    const related = all.filter(k => 
      k.topic !== topic && 
      (k.topic.includes(topic) || k.content.includes(topic))
    );
    return related.slice(0, 5);
  }

  async buildKnowledgeGraph() {
    const knowledge = this.memory.memory.knowledge;
    const nodes = knowledge.map(k => ({
      id: k.id,
      label: k.topic,
      group: k.source
    }));

    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].group === nodes[j].group) {
          edges.push({ from: nodes[i].id, to: nodes[j].id });
        }
      }
    }

    return { nodes, edges };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KnowledgeService };
}
