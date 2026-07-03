/**
 * MAMTA AI V5 - Memory Engine
 * Long-term AI memory: conversations, projects, decisions, errors, solutions, patterns
 * @version 5.0.0
 */
class MemoryEngine extends BaseEngine {
  constructor() {
    super('MemoryEngine', '5.0.0');
    this.storageKey = 'mamta_v5_memory';
    this.memory = {
      conversations: [],
      projects: [],
      decisions: [],
      errors: [],
      solutions: [],
      patterns: [],
      knowledge: [],
      embeddings: []
    };
    this.maxItems = 10000;
  }

  async init() {
    await super.init();
    this.loadFromStorage();
    this.log(`💾 Memory loaded: ${this.getStats().total} items`);
    return true;
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memory = { ...this.memory, ...parsed };
      }
    } catch (e) {
      this.error(e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
    } catch (e) {
      this.error(e);
    }
  }

  // Store conversation
  storeConversation(sessionId, messages) {
    const entry = {
      id: `conv_${Date.now()}`,
      sessionId,
      messages,
      timestamp: new Date().toISOString(),
      summary: this.summarize(messages)
    };
    this.memory.conversations.push(entry);
    this.trimArray('conversations');
    this.saveToStorage();
    this.log(`💬 Conversation stored: ${entry.id}`);
    return entry;
  }

  // Store project
  storeProject(name, description, files = []) {
    const entry = {
      id: `proj_${Date.now()}`,
      name,
      description,
      files,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.memory.projects.push(entry);
    this.trimArray('projects');
    this.saveToStorage();
    this.log(`📁 Project stored: ${name}`);
    return entry;
  }

  // Store decision
  storeDecision(context, decision, reasoning) {
    const entry = {
      id: `dec_${Date.now()}`,
      context,
      decision,
      reasoning,
      timestamp: new Date().toISOString()
    };
    this.memory.decisions.push(entry);
    this.trimArray('decisions');
    this.saveToStorage();
    return entry;
  }

  // Store error + solution pair
  storeError(error, solution, context) {
    const errEntry = {
      id: `err_${Date.now()}`,
      error: error.message || String(error),
      solution,
      context,
      timestamp: new Date().toISOString()
    };
    this.memory.errors.push(errEntry);
    this.trimArray('errors');
    this.saveToStorage();
    this.log(`🐛 Error logged: ${errEntry.id}`);
    return errEntry;
  }

  // Store pattern
  storePattern(name, pattern, examples) {
    const entry = {
      id: `pat_${Date.now()}`,
      name,
      pattern,
      examples,
      timestamp: new Date().toISOString(),
      usageCount: 0
    };
    this.memory.patterns.push(entry);
    this.trimArray('patterns');
    this.saveToStorage();
    return entry;
  }

  // Store knowledge
  storeKnowledge(topic, content, source = 'ai') {
    const entry = {
      id: `know_${Date.now()}`,
      topic,
      content,
      source,
      timestamp: new Date().toISOString(),
      confidence: 0.9
    };
    this.memory.knowledge.push(entry);
    this.trimArray('knowledge');
    this.saveToStorage();
    return entry;
  }

  // Retrieve by query
  retrieve(query, type = 'all', limit = 10) {
    const results = [];
    const q = query.toLowerCase();

    const searchIn = (arr, typeName) => {
      return arr.filter(item => {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes(q);
      }).slice(0, limit).map(item => ({ ...item, _type: typeName }));
    };

    if (type === 'all' || type === 'conversations') {
      results.push(...searchIn(this.memory.conversations, 'conversation'));
    }
    if (type === 'all' || type === 'projects') {
      results.push(...searchIn(this.memory.projects, 'project'));
    }
    if (type === 'all' || type === 'knowledge') {
      results.push(...searchIn(this.memory.knowledge, 'knowledge'));
    }
    if (type === 'all' || type === 'errors') {
      results.push(...searchIn(this.memory.errors, 'error'));
    }
    if (type === 'all' || type === 'patterns') {
      results.push(...searchIn(this.memory.patterns, 'pattern'));
    }

    return results.slice(0, limit);
  }

  // Get recent context for AI
  getContext(sessionId, limit = 5) {
    const conv = this.memory.conversations
      .filter(c => c.sessionId === sessionId)
      .slice(-limit);
    return conv;
  }

  // Summarize messages
  summarize(messages) {
    if (!messages || messages.length === 0) return 'Empty conversation';
    const text = messages.map(m => m.content || m.text || '').join(' ');
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  }

  trimArray(key) {
    if (this.memory[key].length > this.maxItems) {
      this.memory[key] = this.memory[key].slice(-this.maxItems);
    }
  }

  getStats() {
    return {
      total: Object.values(this.memory).reduce((a, b) => a + b.length, 0),
      conversations: this.memory.conversations.length,
      projects: this.memory.projects.length,
      decisions: this.memory.decisions.length,
      errors: this.memory.errors.length,
      solutions: this.memory.solutions.length,
      patterns: this.memory.patterns.length,
      knowledge: this.memory.knowledge.length
    };
  }

  async process(task, context) {
    if (task.action === 'store') {
      return this.storeConversation(context.sessionId, context.messages);
    }
    if (task.action === 'retrieve') {
      return this.retrieve(task.query, task.type, task.limit);
    }
    if (task.action === 'stats') {
      return this.getStats();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryEngine };
}
