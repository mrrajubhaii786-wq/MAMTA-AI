/**
 * MAMTA AI V6 — Memory Engine
 * NO localStorage. ALL data lives in Supabase.
 * @version 6.0.0
 */
class MemoryEngineV6 extends BaseEngine {
  constructor() {
    super('MemoryEngineV6', '6.0.0');
    this.supabase = null;
    this.cache = new Map(); // In-memory cache only, no persistence
    this.cacheTTL = 300000; // 5 minutes
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    this.log('💾 Memory Engine V6 ready (Supabase ONLY)');
    return true;
  }

  // ── STORE OPERATIONS ──

  async storeConversation(sessionId, messages) {
    const summary = this.summarize(messages);
    const entry = {
      session_id: sessionId,
      type: 'conversation',
      content: { messages, sessionId },
      summary,
      metadata: { message_count: messages.length }
    };
    return await this._insert('memory', entry, '💬 Conversation');
  }

  async storeProject(name, description, files = []) {
    const entry = {
      type: 'project',
      content: { name, description, files, status: 'active' },
      summary: `Project: ${name}`,
      metadata: { file_count: files.length }
    };
    return await this._insert('memory', entry, '📁 Project');
  }

  async storeDecision(context, decision, reasoning) {
    const entry = {
      type: 'decision',
      content: { context, decision, reasoning },
      summary: `Decision: ${decision.substring(0, 100)}`,
      metadata: { confidence: 0.9 }
    };
    return await this._insert('memory', entry, '🎯 Decision');
  }

  async storeError(error, solution, context) {
    // Store in errors table (dedicated)
    if (this.supabase) {
      try {
        await this.supabase.insert('errors', {
          error_type: error.name || 'Error',
          error_message: error.message || String(error),
          stack_trace: error.stack || 'N/A',
          context: { context, solution },
          solution: solution,
          severity: 'medium',
          metadata: { engine: this.name }
        });
      } catch (e) { this.error(e); }
    }

    // Also store in memory table
    const entry = {
      type: 'error',
      content: { error: error.message, solution, context },
      summary: `Error: ${(error.message || '').substring(0, 100)}`,
      metadata: { has_solution: !!solution }
    };
    return await this._insert('memory', entry, '🐛 Error');
  }

  async storePattern(name, pattern, examples) {
    const entry = {
      type: 'pattern',
      content: { name, pattern, examples },
      summary: `Pattern: ${name}`,
      metadata: { usage_count: 0 }
    };
    return await this._insert('memory', entry, '🔁 Pattern');
  }

  async storeKnowledge(topic, content, source = 'ai') {
    // Store in knowledge table (dedicated)
    if (this.supabase) {
      try {
        await this.supabase.insert('knowledge', {
          topic,
          content,
          category: 'general',
          source,
          confidence: 0.9,
          tags: [topic.toLowerCase()],
          metadata: { engine: this.name }
        });
      } catch (e) { this.error(e); }
    }

    const entry = {
      type: 'knowledge',
      content: { topic, content, source },
      summary: `Knowledge: ${topic}`,
      metadata: { confidence: 0.9 }
    };
    return await this._insert('memory', entry, '🧠 Knowledge');
  }

  async _insert(table, data, logPrefix) {
    if (this.supabase) {
      try {
        const result = await this.supabase.insert(table, data);
        this.log(`${logPrefix} stored in Supabase`);
        return result;
      } catch (e) {
        this.error(e);
        return { error: e.message, fallback: true };
      }
    }
    return { error: 'Supabase not connected', fallback: true };
  }

  // ── RETRIEVE OPERATIONS ──

  async retrieve(query, type = 'all', limit = 10) {
    if (!this.supabase) return [];

    try {
      const types = type === 'all'
        ? ['conversation', 'project', 'knowledge', 'error', 'pattern']
        : [type.replace(/s$/, '')];

      const results = [];
      for (const t of types) {
        const data = await this.supabase.select('memory', {
          filters: { type: t },
          limit: limit * 2
        });

        const filtered = data.filter(item => {
          const text = JSON.stringify(item).toLowerCase();
          return text.includes(query.toLowerCase());
        }).slice(0, limit).map(item => ({
          ...item.content,
          _type: t,
          id: item.id,
          timestamp: item.created_at
        }));

        results.push(...filtered);
      }
      return results.slice(0, limit);
    } catch (e) {
      this.error(e);
      return [];
    }
  }

  async getContext(sessionId, limit = 5) {
    if (!this.supabase) return [];

    try {
      const data = await this.supabase.select('memory', {
        filters: { type: 'conversation', session_id: sessionId },
        limit,
        order: 'created_at.desc'
      });
      return data.map(item => ({
        ...item.content,
        id: item.id,
        timestamp: item.created_at
      }));
    } catch (e) {
      this.error(e);
      return [];
    }
  }

  async getStats() {
    if (!this.supabase) {
      return { total: 0, supabase_connected: false };
    }

    try {
      const types = ['conversation', 'project', 'decision', 'error', 'solution', 'pattern', 'knowledge'];
      const stats = { total: 0, supabase_connected: true };

      for (const type of types) {
        const count = await this.supabase.count('memory', { type });
        stats[type + 's'] = count;
        stats.total += count;
      }

      // Also count dedicated tables
      stats.knowledge_table = await this.supabase.count('knowledge');
      stats.errors_table = await this.supabase.count('errors');

      return stats;
    } catch (e) {
      this.error(e);
      return { total: 0, supabase_connected: true, error: e.message };
    }
  }

  summarize(messages) {
    if (!messages || messages.length === 0) return 'Empty conversation';
    const text = messages.map(m => m.content || m.text || '').join(' ');
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  }

  async process(task, context) {
    if (task.action === 'store') {
      return await this.storeConversation(context.sessionId, context.messages);
    }
    if (task.action === 'storeProject') {
      return await this.storeProject(task.name, task.description, task.files);
    }
    if (task.action === 'storeDecision') {
      return await this.storeDecision(task.context, task.decision, task.reasoning);
    }
    if (task.action === 'storeError') {
      return await this.storeError(task.error, task.solution, task.context);
    }
    if (task.action === 'storePattern') {
      return await this.storePattern(task.name, task.pattern, task.examples);
    }
    if (task.action === 'storeKnowledge') {
      return await this.storeKnowledge(task.topic, task.content, task.source);
    }
    if (task.action === 'retrieve') {
      return await this.retrieve(task.query, task.type, task.limit);
    }
    if (task.action === 'getContext') {
      return await this.getContext(task.sessionId, task.limit);
    }
    if (task.action === 'stats') {
      return await this.getStats();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryEngineV6 };
}
