/**
 * MAMTA AI V5 - Main Application
 * Self-Healing Autonomous AI Operating System
 * @version 5.0.0
 */

window.mamtaOS = null;

class MAMTAOS {
  constructor() {
    this.version = '5.0.0';
    this.engines = {};
    this.services = {};
    this.initialized = false;
    this.autonomousMode = false;
    this.sessionId = `session_${Date.now()}`;
  }

  async init() {
    console.log(`🧠 MAMTA AI OS v${this.version} initializing...`);
    try {
      await this.initEngines();
      await this.initServices();
      this.setupEventListeners();
      this.setupChatIntegration();
      this.setupSystemPanels();
      this.initialized = true;
      console.log('✅ MAMTA AI OS initialized');
      if (window.showToast) window.showToast('MAMTA AI V5 Autonomous OS Ready', 'success');
      return true;
    } catch (error) {
      console.error('❌ MAMTA OS init failed:', error);
      if (window.showToast) window.showToast('System initialization error', 'error');
      return false;
    }
  }

  async initEngines() {
    console.log('🔧 Initializing engines...');
    const engineMap = [
      ['memory', 'MemoryEngine'],
      ['planner', 'PlannerEngine'],
      ['builder', 'BuilderEngine'],
      ['reviewer', 'ReviewerEngine'],
      ['repair', 'RepairEngine'],
      ['learning', 'LearningEngine'],
      ['monitor', 'MonitorEngine'],
      ['deployment', 'DeploymentEngine'],
      ['evolution', 'EvolutionEngine'],
      ['orchestrator', 'OrchestratorEngine']
    ];

    for (const [name, className] of engineMap) {
      if (typeof window[className] !== 'undefined') {
        this.engines[name] = new window[className]();
        await this.engines[name].init();
        window[`${name}Engine`] = this.engines[name];
        console.log(`  ✅ ${name} engine ready`);
      } else {
        console.warn(`  ⚠️ ${className} not found`);
      }
    }

    if (this.engines.orchestrator) {
      Object.keys(this.engines).forEach(name => {
        if (name !== 'orchestrator') {
          this.engines.orchestrator.registerEngine(name, this.engines[name]);
        }
      });
    }
    console.log(`✅ ${Object.keys(this.engines).length} engines initialized`);
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
        this.services[name] = new window[className](this.engines[engineName]);
        await this.services[name].init();
        console.log(`  ✅ ${name} service ready`);
      }
    }
    console.log(`✅ ${Object.keys(this.services).length} services initialized`);
  }

  setupEventListeners() {
    window.addEventListener('error', (e) => this.handleError(e.error));
    window.addEventListener('unhandledrejection', (e) => this.handleError(e.reason));
    window.addEventListener('online', () => {
      console.log('🌐 Online');
      if (window.showToast) window.showToast('Back online', 'success');
    });
    window.addEventListener('offline', () => {
      console.log('📴 Offline');
      if (window.showToast) window.showToast('Offline mode', 'warning');
    });
  }

  async handleError(error) {
    console.error('🚨 System error:', error);
    if (this.engines.memory) this.engines.memory.storeError(error, 'Auto-detected', 'global');
    if (this.engines.repair) {
      const healResult = await this.engines.repair.heal(error, { autoApply: false });
      console.log('🔧 Heal result:', healResult.status);
    }
    if (this.engines.learning) {
      this.engines.learning.learn({
        type: 'failure', input: error.message, output: null,
        context: 'global_error', outcome: 'failure', error: error.message
      });
    }
  }

  setupChatIntegration() {
    const originalSend = window.sendMessage;
    if (originalSend) {
      window.sendMessage = async (message) => {
        if (this.engines.memory) {
          this.engines.memory.storeConversation(this.sessionId, [
            { role: 'user', content: message, timestamp: new Date().toISOString() }
          ]);
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
        const plan = this.engines.planner.createPlan(args || 'New Project');
        return { message: `✅ Plan created: ${plan.id} (${plan.tasks.length} tasks)`, data: plan };
      case 'build':
        if (!this.engines.builder) return { message: 'Builder not available' };
        const proj = this.engines.builder.generateProject(args || 'NewProject');
        return { message: `✅ Project generated: ${proj.name} (${proj.files.length} files)`, data: proj };
      case 'review':
        if (!this.engines.reviewer) return { message: 'Reviewer not available' };
        const review = this.engines.reviewer.reviewCode(args || '// code', 'input.js');
        return { message: `✅ Review: ${review.score}/100 (${review.summary.critical} critical)`, data: review };
      case 'status':
        const status = Object.keys(this.engines).map(n => ({ name: n, status: this.engines[n].status }));
        return { message: `🧠 ${status.length} engines active`, data: status };
      case 'agents':
        if (!this.services.agents) return { message: 'Agents not available' };
        return { message: `🤖 ${this.services.agents.getAgents().length} agents ready`, data: this.services.agents.getAgents() };
      case 'deploy':
        if (!this.engines.deployment) return { message: 'Deployment not available' };
        const ver = this.engines.deployment.createVersion(args || 'Manual deploy');
        return { message: `🚀 Version ${ver.version} created`, data: ver };
      case 'heal':
        if (!this.engines.evolution) return { message: 'Evolution not available' };
        const diag = await this.engines.evolution.selfDiagnose();
        return { message: `🔧 System health: ${diag.healthPercent}%`, data: diag };
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
          return { message: '🤖 Autonomous mode started' };
        }
      case 'help':
      default:
        return {
          message: '🎛️ Commands: /plan /build /review /status /agents /deploy /heal /learn /auto /help',
          data: { commands: ['/plan <goal>', '/build <name>', '/review <code>', '/status', '/agents', '/deploy', '/heal', '/learn', '/auto', '/help'] }
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
    panel.innerHTML = `<span class="v5-badge">V5</span> ${this.autonomousMode ? '🤖' : '👤'} | ${indicators}`;
  }

  startAutonomousMode() {
    if (!this.engines.orchestrator) return false;
    this.autonomousMode = true;
    this.engines.orchestrator.startAutonomousLoop(60000);
    if (window.showToast) window.showToast('🤖 Autonomous mode ON', 'success');
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
      session: this.sessionId
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mamtaOS = new MAMTAOS();
  window.mamtaOS.init();
});
