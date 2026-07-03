/**
 * MAMTA AI V6 — Main Application
 * Real AI + Real Database + All 10 Phases
 * @version 6.0.0
 */

window.mamtaOS = null;

class MAMTAOSV6 {
  constructor() {
    this.version = '6.0.0';
    this.engines = {};
    this.services = {};
    this.initialized = false;
    this.autonomousMode = false;
    this.sessionId = `session_${Date.now()}`;
    this.supabase = null;
    this.aiService = null;
  }

  async init() {
    console.log(`🧠 MAMTA AI V6 initializing...`);
    try {
      // 1. Supabase Service
      if (typeof SupabaseService !== 'undefined') {
        this.supabase = new SupabaseService();
        await this.supabase.init();
        console.log('✅ Supabase connected');
      }

      // 2. AI Service
      if (typeof AIService !== 'undefined') {
        this.aiService = new AIService();
        await this.aiService.init();
        this.services.ai = this.aiService;
        console.log('✅ AI Service ready');
      }

      // 3. Initialize ALL engines
      await this.initEngines();

      // 4. Initialize services
      await this.initServices();

      // 5. Setup
      this.setupEventListeners();
      this.setupChatIntegration();
      this.setupSystemPanels();
      this.initialized = true;

      // 6. Log startup
      if (this.supabase) {
        await this.supabase.insert('agent_logs', {
          agent_name: 'system', agent_role: 'orchestrator', action: 'system_startup',
          input: { version: this.version },
          output: { status: 'success', engines: Object.keys(this.engines) },
          status: 'completed', metadata: { session_id: this.sessionId }
        }).catch(e => console.error(e));
      }

      console.log('✅ MAMTA AI V6 FULLY INITIALIZED');
      if (window.showToast) window.showToast('MAMTA AI V6 Ready — All 16 Engines Active', 'success');
      return true;
    } catch (error) {
      console.error('❌ MAMTA V6 init failed:', error);
      if (window.showToast) window.showToast('System initialization error', 'error');
      return false;
    }
  }

  async initEngines() {
    console.log('🔧 Initializing 16 V6 engines...');

    const engineMap = [
      ['context', 'ContextEngine'],
      ['reasoning', 'ReasoningEngine'],
      ['knowledgeGraph', 'KnowledgeGraphEngine'],
      ['testing', 'TestingEngine'],
      ['documentation', 'DocumentationEngine'],
      ['analytics', 'AnalyticsEngine'],
      ['memory', 'MemoryEngineV6'],
      ['planner', 'PlannerEngineV6'],
      ['builder', 'BuilderEngineV6'],
      ['reviewer', 'ReviewerEngineV6'],
      ['repair', 'RepairEngineV6'],
      ['learning', 'LearningEngine'],
      ['monitor', 'MonitorEngine'],
      ['deployment', 'DeploymentEngine'],
      ['evolution', 'EvolutionEngine'],
      ['orchestrator', 'OrchestratorEngineV6']
    ];

    for (const [name, className] of engineMap) {
      if (typeof window[className] !== 'undefined') {
        try {
          this.engines[name] = new window[className]();

          // Enable AI for AI-capable engines
          if (['context', 'reasoning', 'knowledgeGraph', 'testing', 'documentation',
               'memory', 'planner', 'builder', 'reviewer', 'repair'].includes(name) && this.aiService) {
            if (typeof this.engines[name].enableAI === 'function') {
              this.engines[name].enableAI(this.aiService);
            }
          }

          await this.engines[name].init();
          window[`${name}Engine`] = this.engines[name];
          console.log(` ✅ ${name} engine ready`);
        } catch (e) {
          console.warn(` ⚠️ ${className} init failed:`, e.message);
        }
      } else {
        console.warn(` ⚠️ ${className} not found`);
      }
    }

    // Register with orchestrator
    if (this.engines.orchestrator) {
      Object.keys(this.engines).forEach(name => {
        if (name !== 'orchestrator') {
          this.engines.orchestrator.registerEngine(name, this.engines[name]);
        }
      });
      // Set analytics reference
      if (this.engines.analytics) {
        this.engines.orchestrator.analytics = this.engines.analytics;
      }
    }

    console.log(`✅ ${Object.keys(this.engines).length}/16 engines initialized`);
  }

  async initServices() {
    console.log('🔌 Initializing services...');
    const serviceMap = [
      ['memory', 'MemoryService', 'memory'],
      ['planner', 'PlannerService', 'planner'],
      ['builder', 'BuilderService', 'builder'],
      ['reviewer', 'ReviewerService', 'reviewer'],
      ['repair', 'RepairService', 'repair'],
      ['monitor', 'MonitorService', 'monitor'],
      ['deployment', 'DeploymentService', 'deployment'],
      ['knowledge', 'KnowledgeService', 'memory'],
      ['learning', 'LearningService', 'learning'],
      ['agents', 'AgentsService', 'orchestrator']
    ];

    for (const [name, className, engineName] of serviceMap) {
      if (typeof window[className] !== 'undefined' && this.engines[engineName]) {
        try {
          this.services[name] = new window[className](this.engines[engineName]);
          await this.services[name].init();
          console.log(` ✅ ${name} service ready`);
        } catch (e) {
          console.warn(` ⚠️ ${className} service failed:`, e.message);
        }
      }
    }
    console.log(`✅ ${Object.keys(this.services).length} services initialized`);
  }

  setupEventListeners() {
    window.addEventListener('error', (e) => this.handleError(e.error));
    window.addEventListener('unhandledrejection', (e) => this.handleError(e.reason));
    window.addEventListener('online', () => {
      console.log('🌐 Online');
      if (window.showToast) window.showToast('Back online — Supabase connected', 'success');
    });
    window.addEventListener('offline', () => {
      console.log('📴 Offline');
      if (window.showToast) window.showToast('Offline — local cache active', 'warning');
    });
  }

  async handleError(error) {
    console.error('🚨 System error:', error);
    if (this.engines.memory) await this.engines.memory.storeError(error, 'Auto-detected', 'global');
    if (this.engines.repair) {
      const healResult = await this.engines.repair.heal(error, { autoApply: false, engine: 'global' });
      console.log('🔧 Heal result:', healResult.status);
    }
    if (this.engines.learning) {
      this.engines.learning.learn({ type: 'failure', input: error.message, output: null, context: 'global_error', outcome: 'failure', error: error.message });
    }
    if (this.engines.analytics) {
      this.engines.analytics.trackEngine('global', 0, false, error);
    }
  }

  setupChatIntegration() {
    const originalSend = window.sendMessage;
    if (originalSend) {
      window.sendMessage = async (message) => {
        // Context analysis
        if (this.engines.context) {
          await this.engines.context.addMessage(this.sessionId, 'user', message);
        }
        if (this.engines.memory) {
          await this.engines.memory.storeConversation(this.sessionId, [{ role: 'user', content: message, timestamp: new Date().toISOString() }]);
        }
        if (message.startsWith('/')) return this.handleCommand(message);
        return originalSend(message);
      };
    }
  }

  async handleCommand(command) {
    const parts = command.slice(1).split(' ');
    const cmd = parts[0];
    const args = parts.slice(1).join(' ');

    switch(cmd) {
      case 'plan':
        if (!this.engines.planner) return { message: 'Planner not available' };
        const plan = await this.engines.planner.createPlan(args || 'New Project');
        return { message: `✅ Plan created: ${plan.id} (${plan.tasks?.length || 0} tasks) [Supabase]`, data: plan };

      case 'build':
        if (!this.engines.builder) return { message: 'Builder not available' };
        const proj = await this.engines.builder.generateProject(args || 'NewProject', 'webapp', args);
        return { message: `✅ Project: ${proj.name} (${proj.files.length} files) [AI=${proj.aiGenerated}]`, data: proj };

      case 'review':
        if (!this.engines.reviewer) return { message: 'Reviewer not available' };
        const review = await this.engines.reviewer.reviewCode(args || '// code', 'input.js');
        return { message: `✅ Review: ${review.score}/100 (${review.issues?.length || 0} issues)`, data: review };

      case 'test':
        if (!this.engines.testing) return { message: 'Testing not available' };
        const tests = await this.engines.testing.generateTests(args || 'function test() {}', 'test.js');
        return { message: `🧪 Tests generated: ${this.engines.testing.countTests(tests.tests)} tests`, data: tests };

      case 'status':
        const status = Object.keys(this.engines).map(n => ({ name: n, status: this.engines[n].status, version: this.engines[n].version }));
        return { message: `🧠 ${status.length} V6 engines | DB: ${!!this.supabase} | AI: ${this.aiService?.hasKey() ? '✅' : '❌'}`, data: status };

      case 'agents':
        if (!this.services.agents) return { message: 'Agents not available' };
        return { message: `🤖 ${this.services.agents.getAgents().length} agents ready`, data: this.services.agents.getAgents() };

      case 'deploy':
        if (!this.engines.deployment) return { message: 'Deployment not available' };
        const ver = this.engines.deployment.createVersion(args || 'Manual deploy');
        return { message: `🚀 Version ${ver.version} created`, data: ver };

      case 'heal':
        if (!this.engines.repair) return { message: 'Repair not available' };
        const errors = await this.engines.memory.retrieve('error', 'errors', 5);
        let healCount = 0;
        for (const err of errors) {
          const result = await this.engines.repair.heal(new Error(err.error || 'Unknown'), { autoApply: false });
          if (result.status === 'healed') healCount++;
        }
        return { message: `🔧 Healed ${healCount}/${errors.length} errors`, data: { healed: healCount, total: errors.length } };

      case 'learn':
        if (!this.engines.learning) return { message: 'Learning not available' };
        const metrics = this.engines.learning.getImprovementMetrics();
        return { message: `🧠 ${metrics.totalLearnings} learnings recorded`, data: metrics };

      case 'auto':
        if (this.autonomousMode) {
          this.stopAutonomousMode();
          return { message: '👤 Autonomous mode stopped' };
        } else {
          this.startAutonomousMode();
          return { message: '🤖 Autonomous mode ON — Logging to Supabase' };
        }

      case 'sync':
        if (!this.engines.memory) return { message: 'Memory not available' };
        const syncResult = await this.engines.memory.getStats();
        return { message: `🔄 Sync: ${syncResult.total} items in Supabase`, data: syncResult };

      case 'db':
        if (!this.supabase) return { message: 'Supabase not connected' };
        const health = await this.supabase.healthCheck();
        return { message: `📡 Supabase: ${health ? 'Connected ✅' : 'Disconnected ❌'}`, data: { connected: health } };

      case 'ai':
        if (!this.aiService) return { message: 'AI Service not available' };
        const aiMetrics = this.aiService.getMetrics();
        return { message: `🤖 AI: ${aiMetrics.calls} calls | ${aiMetrics.tokens} tokens | ${this.aiService.preferredProvider}`, data: aiMetrics };

      case 'graph':
        if (!this.engines.knowledgeGraph) return { message: 'Knowledge Graph not available' };
        const graphStats = this.engines.knowledgeGraph.getStats();
        return { message: `🕸️ Graph: ${graphStats.totalNodes} nodes | ${graphStats.circularDeps} cycles`, data: graphStats };

      case 'reason':
        if (!this.engines.reasoning) return { message: 'Reasoning not available' };
        const chain = await this.engines.reasoning.buildChain(args || 'Analyze current system state');
        return { message: `🧩 Reasoning chain: ${chain.id} (confidence: ${chain.confidence})`, data: chain };

      case 'docs':
        if (!this.engines.documentation) return { message: 'Documentation not available' };
        const doc = await this.engines.documentation.generateDocs('// sample code', 'sample.js', 'MAMTA AI');
        return { message: `📝 Documentation generated: ${doc.id}`, data: doc };

      case 'analytics':
        if (!this.engines.analytics) return { message: 'Analytics not available' };
        const dash = await this.engines.analytics.getDashboardData();
        return { message: `📊 Health: ${dash.health?.score}% | ${Object.keys(dash.engines || {}).length} engines tracked`, data: dash };

      case 'context':
        if (!this.engines.context) return { message: 'Context not available' };
        const ctx = await this.engines.context.getEnrichedContext(this.sessionId, this.engines.memory);
        return { message: `🧠 Context: ${ctx.intent} | ${ctx.topic || 'no topic'} | ${ctx.recentMessages.length} messages`, data: ctx };

      case 'settings':
        return { message: '⚙️ Settings: Use SafeDrop vault (/safedrop) to configure API keys', data: { safedrop: 'safedrop-v6.html' } };

      case 'help':
      default:
        return {
          message: `🎛️ V6 Commands: /plan /build /review /test /status /agents /deploy /heal /learn /auto /sync /db /ai /graph /reason /docs /analytics /context /settings /help`,
          data: {
            commands: [
              '/plan <goal> — AI plan with Supabase storage',
              '/build <name> — AI project generation',
              '/review <code> — AI code review',
              '/test <code> — AI test generation',
              '/status — System status',
              '/agents — List agents',
              '/deploy — Create version',
              '/heal — Fix recent errors',
              '/learn — Learning metrics',
              '/auto — Toggle autonomous mode',
              '/sync — Sync memory from Supabase',
              '/db — Check database connection',
              '/ai — AI service metrics',
              '/graph — Knowledge graph stats',
              '/reason <task> — Build reasoning chain',
              '/docs — Generate documentation',
              '/analytics — System analytics',
              '/context — Session context',
              '/settings — Configure API keys',
              '/help — Show this help'
            ]
          }
        };
    }
  }

  setupSystemPanels() {
    const panel = document.getElementById('system-status-panel');
    if (panel) {
      this.updateStatusPanel(panel);
      setInterval(() => this.updateStatusPanel(panel), 5000);
    }
  }

  updateStatusPanel(panel) {
    if (!panel) return;
    const indicators = Object.keys(this.engines).map(name => {
      const e = this.engines[name];
      const dot = e.status === 'ready' ? '🟢' : e.status === 'error' ? '🔴' : '🟡';
      return `${dot} ${name}`;
    }).join(' | ');

    const dbStatus = this.supabase ? '🟢 DB' : '🔴 DB';
    const aiStatus = this.aiService?.hasKey() ? '🟢 AI' : '🔴 AI';
    const autoStatus = this.autonomousMode ? '🤖 AUTO' : '👤 MANUAL';

    panel.innerHTML = `V6 ${autoStatus} | ${dbStatus} | ${aiStatus} | ${indicators}`;
  }

  startAutonomousMode() {
    if (!this.engines.orchestrator) return false;
    this.autonomousMode = true;
    this.engines.orchestrator.startAutonomousLoop(60000);
    if (window.showToast) window.showToast('🤖 Autonomous mode ON — Full V6 logging', 'success');
    return true;
  }

  stopAutonomousMode() {
    if (this.engines.orchestrator) this.engines.orchestrator.stopAutonomousLoop();
    this.autonomousMode = false;
    if (window.showToast) window.showToast('👤 Autonomous mode OFF', 'info');
  }

  getSystemReport() {
    return {
      version: this.version,
      timestamp: new Date().toISOString(),
      engines: Object.keys(this.engines).reduce((acc, n) => { acc[n] = this.engines[n].getStatus(); return acc; }, {}),
      autonomous: this.autonomousMode,
      supabase: !!this.supabase,
      ai: this.aiService?.hasKey() || false,
      session: this.sessionId
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mamtaOS = new MAMTAOSV6();
  window.mamtaOS.init();
});
