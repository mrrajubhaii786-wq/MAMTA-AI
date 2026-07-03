/**
 * MAMTA AI V6 — Context Engine
 * Manages conversation context, user intent, and session state
 * @version 6.0.0
 */
class ContextEngine extends BaseEngine {
  constructor() {
    super('ContextEngine', '6.0.0');
    this.sessions = new Map();
    this.supabase = null;
    this.aiService = null;
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    this.log('🧠 Context Engine ready');
    return true;
  }

  enableAI(aiService) {
    this.aiService = aiService;
    this.log('🤖 AI Context analysis enabled');
  }

  // Create or get session context
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date().toISOString(),
        messages: [],
        intent: null,
        entities: [],
        topic: null,
        sentiment: 'neutral',
        lastActivity: Date.now()
      });
    }
    return this.sessions.get(sessionId);
  }

  // Add message to session context
  async addMessage(sessionId, role, content, metadata = {}) {
    const session = this.getSession(sessionId);
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    session.messages.push(message);
    session.lastActivity = Date.now();

    // Trim to last 50 messages
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    // AI-powered context analysis
    if (this.aiService && this.aiService.hasKey()) {
      try {
        const analysis = await this.analyzeContext(session);
        session.intent = analysis.intent;
        session.entities = analysis.entities;
        session.topic = analysis.topic;
        session.sentiment = analysis.sentiment;
      } catch (e) {
        this.error(e);
      }
    }

    // Persist to Supabase
    if (this.supabase) {
      try {
        await this.supabase.insert('memory', {
          session_id: sessionId,
          type: 'conversation',
          content: { role, content, metadata },
          summary: content.substring(0, 200),
          metadata: { intent: session.intent, topic: session.topic, sentiment: session.sentiment }
        });
      } catch (e) {
        this.error(e);
      }
    }

    return message;
  }

  // AI-powered context analysis
  async analyzeContext(session) {
    if (!this.aiService || !this.aiService.hasKey()) {
      return this.fallbackAnalysis(session);
    }

    const recentMessages = session.messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

    const systemPrompt = `You are MAMTA AI Context Analyzer V6. Analyze conversation context.
Return JSON only:
{
  "intent": "primary user intent (plan|build|review|repair|learn|query|chat)",
  "entities": ["extracted key entities"],
  "topic": "main topic",
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high",
  "actionRequired": true|false,
  "suggestedCommand": "/command or null"
}`;

    const result = await this.aiService.callAI(systemPrompt, recentMessages, { json: true });
    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      return this.fallbackAnalysis(session);
    }
  }

  fallbackAnalysis(session) {
    const lastMsg = session.messages[session.messages.length - 1];
    const content = lastMsg?.content?.toLowerCase() || '';

    let intent = 'chat';
    if (content.includes('/plan') || content.includes('plan')) intent = 'plan';
    else if (content.includes('/build') || content.includes('build') || content.includes('create')) intent = 'build';
    else if (content.includes('/review') || content.includes('review')) intent = 'review';
    else if (content.includes('/repair') || content.includes('fix') || content.includes('bug')) intent = 'repair';
    else if (content.includes('/learn') || content.includes('learn')) intent = 'learn';
    else if (content.includes('/status') || content.includes('status')) intent = 'query';

    return {
      intent,
      entities: [],
      topic: null,
      sentiment: 'neutral',
      urgency: 'low',
      actionRequired: content.startsWith('/'),
      suggestedCommand: content.startsWith('/') ? content.split(' ')[0] : null
    };
  }

  // Get context window for AI
  getContextWindow(sessionId, maxMessages = 10) {
    const session = this.getSession(sessionId);
    return session.messages.slice(-maxMessages);
  }

  // Get enriched context with memory
  async getEnrichedContext(sessionId, memoryEngine = null) {
    const session = this.getSession(sessionId);
    const window = this.getContextWindow(sessionId, 10);

    let relatedMemory = [];
    if (memoryEngine) {
      try {
        const query = session.messages.slice(-3).map(m => m.content).join(' ');
        relatedMemory = await memoryEngine.retrieve(query, 'all', 5);
      } catch (e) {
        this.error(e);
      }
    }

    return {
      session: session.id,
      intent: session.intent,
      topic: session.topic,
      sentiment: session.sentiment,
      recentMessages: window,
      relatedMemory,
      timestamp: new Date().toISOString()
    };
  }

  // Clear old sessions
  cleanup(maxAgeMs = 3600000) { // 1 hour
    const now = Date.now();
    let cleared = 0;
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity > maxAgeMs) {
        this.sessions.delete(id);
        cleared++;
      }
    }
    if (cleared > 0) this.log(`🧹 Cleared ${cleared} inactive sessions`);
    return cleared;
  }

  getStats() {
    return {
      activeSessions: this.sessions.size,
      totalMessages: Array.from(this.sessions.values()).reduce((sum, s) => sum + s.messages.length, 0),
      supabaseConnected: !!this.supabase,
      aiEnabled: !!(this.aiService && this.aiService.hasKey())
    };
  }

  async process(task, context) {
    if (task.action === 'addMessage') {
      return await this.addMessage(task.sessionId, task.role, task.content, task.metadata);
    }
    if (task.action === 'getContext') {
      return this.getContextWindow(task.sessionId, task.limit);
    }
    if (task.action === 'getEnriched') {
      return await this.getEnrichedContext(task.sessionId, task.memoryEngine);
    }
    if (task.action === 'analyze') {
      return await this.analyzeContext(this.getSession(task.sessionId));
    }
    if (task.action === 'cleanup') {
      return this.cleanup(task.maxAgeMs);
    }
    if (task.action === 'stats') {
      return this.getStats();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContextEngine };
}
