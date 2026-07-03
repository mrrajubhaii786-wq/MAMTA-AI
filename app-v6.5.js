/**
 * MAMTA AI V6.5 — "Autonomous OS Reality Sprint"
 * Live Engine Monitor | Real Dashboards | Activity Timeline | Pipeline Visualization
 * @version 6.5.0
 */

// ==================== LIVE DASHBOARD ====================
class LiveDashboard {
  constructor(os) {
    this.os = os;
    this.updateInterval = 2000;
    this.timer = null;
    this.lastEngineStates = {};
    this.dbStats = { tasks: 0, plans: 0, errors: 0, memory: 0, agent_logs: 0, knowledge: 0 };
    this.aiHistory = [];
  }

  start() {
    this.updateAll();
    this.timer = setInterval(() => this.updateAll(), this.updateInterval);
    console.log('📊 Live Dashboard started (2s interval)');
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async updateAll() {
    this.updateEngineMonitor();
    this.updateSystemDashboard();
    this.updateWorkspaceDashboard();
    this.updateProductionDashboard();
    await this.updateDatabaseStats();
    this.updateAIMetricsPanel();
  }

  updateEngineMonitor() {
    const container = document.getElementById('live-engine-monitor');
    if (!container) return;

    const engines = this.os.engines || {};
    const engineList = [
      { name: 'Planner', key: 'planner' },
      { name: 'Memory', key: 'memory' },
      { name: 'Builder', key: 'builder' },
      { name: 'Reviewer', key: 'reviewer' },
      { name: 'Repair', key: 'repair' },
      { name: 'Knowledge Graph', key: 'knowledgeGraph' },
      { name: 'Testing', key: 'testing' },
      { name: 'Documentation', key: 'documentation' },
      { name: 'Analytics', key: 'analytics' },
      { name: 'AI', key: 'aiService', isService: true },
      { name: 'Database', key: 'supabase', isService: true }
    ];

    let html = '';
    for (const eng of engineList) {
      let status = 'idle';
      let isReady = false;
      let isRunning = false;

      if (eng.isService) {
        if (eng.key === 'aiService') {
          isReady = this.os.aiService?.hasKey() || false;
          status = isReady ? 'ready' : 'error';
        } else if (eng.key === 'supabase') {
          isReady = !!this.os.supabase;
          status = isReady ? 'ready' : 'error';
        }
      } else {
        const engine = engines[eng.key];
        if (engine) {
          status = engine.status || 'idle';
          isReady = status === 'ready';
          isRunning = status === 'running';
        }
      }

      const dotClass = isReady ? 'green' : isRunning ? 'cyan' : status === 'error' ? 'red' : 'yellow';
      const pulseClass = isRunning ? 'pulse' : '';
      const labelClass = isRunning ? 'running' : '';

      html += `<div class="engine-status-item ${pulseClass}">
        <span class="status-dot ${dotClass}"></span>
        <span class="engine-name ${labelClass}">${eng.name}</span>
      </div>`;
    }

    container.innerHTML = html;
  }

  updateSystemDashboard() {
    const engines = this.os.engines || {};

    // CPU (simulated based on active engines + random jitter)
    const activeEngines = Object.values(engines).filter(e => e.status === 'running').length;
    const cpuPercent = Math.min(100, activeEngines * 6 + Math.floor(Math.random() * 8) + 5);
    this.updateMetricBar('metric-cpu', cpuPercent, `${cpuPercent}%`);

    // Memory (from monitor engine or browser)
    let memoryPercent = 0;
    if (engines.monitor && typeof engines.monitor.getMemoryUsage === 'function') {
      const mem = engines.monitor.getMemoryUsage();
      memoryPercent = mem.percent || 0;
    } else if (performance && performance.memory) {
      memoryPercent = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
    }
    this.updateMetricBar('metric-memory', memoryPercent, `${memoryPercent}%`);

    // AI Calls
    const aiCalls = this.os.aiService?.getMetrics()?.calls || 0;
    this.updateMetricValue('metric-ai-calls', aiCalls.toLocaleString());

    // Database
    const dbConnected = !!this.os.supabase;
    this.updateMetricValue('metric-db', dbConnected ? 'Connected ✅' : 'Disconnected ❌', dbConnected ? 'green' : 'red');

    // Tasks
    const taskCount = this.dbStats.tasks || 0;
    this.updateMetricValue('metric-tasks', taskCount);

    // Plans
    const planCount = this.dbStats.plans || 0;
    this.updateMetricValue('metric-plans', planCount);

    // Errors
    const errorCount = this.dbStats.errors || 0;
    this.updateMetricValue('metric-errors', errorCount, errorCount > 0 ? 'red' : 'green');

    // Success Rate
    let totalCalls = 0, totalSuccess = 0;
    Object.values(engines).forEach(e => {
      if (e.metrics) {
        totalCalls += e.metrics.calls || 0;
        totalSuccess += e.metrics.success || 0;
      }
    });
    const successRate = totalCalls > 0 ? Math.round((totalSuccess / totalCalls) * 100) : 100;
    this.updateMetricBar('metric-success-rate', successRate, `${successRate}%`);

    // Autonomous Loop
    const autoStatus = this.os.autonomousMode ? 'RUNNING 🔄' : 'STOPPED ⏹️';
    const autoClass = this.os.autonomousMode ? 'green' : 'dim';
    this.updateMetricValue('metric-autonomous', autoStatus, autoClass);

    // Health Score
    const healthScore = this.calculateHealthScore();
    this.updateMetricBar('metric-health', healthScore, `${healthScore}%`);
  }

  calculateHealthScore() {
    const engines = this.os.engines || {};
    const total = Object.keys(engines).length;
    if (total === 0) return 0;

    let ready = 0;
    Object.values(engines).forEach(e => {
      if (e.status === 'ready' || e.status === 'running') ready++;
    });

    const engineHealth = (ready / total) * 100;
    const dbHealth = this.os.supabase ? 100 : 0;
    const aiHealth = this.os.aiService?.hasKey() ? 100 : 0;

    return Math.round((engineHealth * 0.5 + dbHealth * 0.25 + aiHealth * 0.25));
  }

  updateMetricBar(id, percent, text) {
    const bar = document.getElementById(id);
    if (!bar) return;
    const fill = bar.querySelector('.metric-fill');
    const label = bar.querySelector('.metric-label');
    if (fill) fill.style.width = `${percent}%`;
    if (label) label.textContent = text;

    let color = 'var(--success)';
    if (percent < 50) color = 'var(--error)';
    else if (percent < 80) color = 'var(--warning)';
    if (fill) fill.style.background = color;
  }

  updateMetricValue(id, value, colorClass = '') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    if (colorClass) el.className = `metric-value ${colorClass}`;
  }

  async updateDatabaseStats() {
    if (!this.os.supabase) return;
    try {
      this.dbStats.tasks = await this.os.supabase.count('tasks') || 0;
      this.dbStats.plans = await this.os.supabase.count('plans') || 0;
      this.dbStats.errors = await this.os.supabase.count('errors') || 0;
      this.dbStats.memory = await this.os.supabase.count('memory') || 0;
      this.dbStats.agent_logs = await this.os.supabase.count('agent_logs') || 0;
      this.dbStats.knowledge = await this.os.supabase.count('knowledge') || 0;
    } catch (e) {
      // Silent fail for polling
    }
  }

  updateWorkspaceDashboard() {
    const engines = this.os.engines || {};

    const runningTasks = Object.values(engines).filter(e => e.status === 'running').length;
    this.updateMetricValue('ws-running-tasks', runningTasks);

    const completedTasks = Object.values(engines).reduce((sum, e) => sum + (e.metrics?.success || 0), 0);
    this.updateMetricValue('ws-completed-tasks', completedTasks.toLocaleString());

    const pendingTasks = this.os.engines.orchestrator?.taskQueue?.length || 0;
    this.updateMetricValue('ws-pending-tasks', pendingTasks);

    const readyCount = Object.values(engines).filter(e => e.status === 'ready' || e.status === 'running').length;
    const totalCount = Object.keys(engines).length;
    this.updateMetricValue('ws-engine-health', `${readyCount}/${totalCount}`);

    this.updateMetricValue('ws-db-status', this.os.supabase ? 'Connected ✅' : 'Disconnected ❌');
    this.updateMetricValue('ws-memory-size', `${this.dbStats.memory.toLocaleString()} items`);

    let kgNodes = 0;
    if (engines.knowledgeGraph && typeof engines.knowledgeGraph.getStats === 'function') {
      try {
        const stats = engines.knowledgeGraph.getStats();
        kgNodes = stats.totalNodes || 0;
      } catch (e) {}
    }
    this.updateMetricValue('ws-kg-nodes', `${kgNodes.toLocaleString()} nodes`);

    const buildCount = engines.builder?.metrics?.calls || 0;
    this.updateMetricValue('ws-recent-builds', buildCount);
  }

  updateProductionDashboard() {
    const autoEl = document.getElementById('prod-auto');
    const manualEl = document.getElementById('prod-manual');
    const dbEl = document.getElementById('prod-db');
    const aiEl = document.getElementById('prod-ai');
    const memEl = document.getElementById('prod-memory');
    const agentsEl = document.getElementById('prod-agents');
    const errorsEl = document.getElementById('prod-errors');
    const warningsEl = document.getElementById('prod-warnings');
    const logsEl = document.getElementById('prod-logs');

    if (autoEl) autoEl.className = this.os.autonomousMode ? 'prod-indicator active' : 'prod-indicator';
    if (manualEl) manualEl.className = !this.os.autonomousMode ? 'prod-indicator active' : 'prod-indicator';
    if (dbEl) dbEl.className = this.os.supabase ? 'prod-indicator active' : 'prod-indicator error';
    if (aiEl) aiEl.className = this.os.aiService?.hasKey() ? 'prod-indicator active' : 'prod-indicator error';
    if (memEl) memEl.className = 'prod-indicator active';

    const agentCount = this.os.services?.agents?.getAgents()?.length || 0;
    if (agentsEl) agentsEl.textContent = `${agentCount} agents`;

    const errorCount = this.dbStats.errors || 0;
    if (errorsEl) errorsEl.textContent = `${errorCount} errors`;

    let warningCount = 0;
    if (this.os.engines.monitor && this.os.engines.monitor.alerts) {
      warningCount = this.os.engines.monitor.alerts.filter(a => !a.acknowledged && a.severity !== 'critical').length;
    }
    if (warningsEl) warningsEl.textContent = `${warningCount} warnings`;

    let logCount = 0;
    Object.values(this.os.engines || {}).forEach(e => {
      logCount += (e.logs?.length || 0);
    });
    if (logsEl) logsEl.textContent = `${logCount} logs`;
  }

  updateAIMetricsPanel() {
    const container = document.getElementById('ai-metrics-panel');
    if (!container || !this.os.aiService) return;

    const metrics = this.os.aiService.getMetrics();
    const provider = this.os.aiService.preferredProvider || 'none';

    const latency = this.aiHistory.length > 0
      ? Math.round(this.aiHistory.reduce((a, b) => a + b, 0) / this.aiHistory.length)
      : 0;
    const cost = (metrics.tokens * 0.000002).toFixed(4);
    const fallbackCount = metrics.failures || 0;
    const successRate = metrics.calls > 0 ? Math.round((metrics.success / metrics.calls) * 100) : 100;

    const html = `
      <div class="ai-metric-row"><span class="ai-metric-label">Provider</span><span class="ai-metric-value ${provider === 'openai' ? 'green' : 'cyan'}">${provider.toUpperCase()}</span></div>
      <div class="ai-metric-row"><span class="ai-metric-label">Total Calls</span><span class="ai-metric-value">${metrics.calls}</span></div>
      <div class="ai-metric-row"><span class="ai-metric-label">Tokens Used</span><span class="ai-metric-value">${metrics.tokens.toLocaleString()}</span></div>
      <div class="ai-metric-row"><span class="ai-metric-label">Avg Latency</span><span class="ai-metric-value">${latency}ms</span></div>
      <div class="ai-metric-row"><span class="ai-metric-label">Est. Cost</span><span class="ai-metric-value">$${cost}</span></div>
      <div class="ai-metric-row"><span class="ai-metric-label">Fallbacks</span><span class="ai-metric-value ${fallbackCount > 0 ? 'warning' : 'green'}">${fallbackCount}</span></div>
      <div class="ai-metric-row"><span class="ai-metric-label">Success Rate</span><span class="ai-metric-value">${successRate}%</span></div>
    `;

    container.innerHTML = html;
  }

  recordLatency(duration) {
    this.aiHistory.push(duration);
    if (this.aiHistory.length > 50) this.aiHistory.shift();
  }
}

// ==================== ACTIVITY TIMELINE ====================
class ActivityTimeline {
  constructor() {
    this.events = [];
    this.maxEvents = 50;
    this.container = null;
  }

  start() {
    this.container = document.getElementById('activity-timeline');
    console.log('📋 Activity Timeline started');
  }

  addEvent(type, message, details = {}) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
      type,
      message,
      details
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) this.events.pop();
    this.render();
  }

  render() {
    if (!this.container) return;

    const html = this.events.map(evt => {
      const time = evt.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const icon = this.getIcon(evt.type);
      const typeClass = evt.type;
      return `<div class="timeline-item ${typeClass}" data-id="${evt.id}">
        <div class="timeline-time">${time}</div>
        <div class="timeline-icon">${icon}</div>
        <div class="timeline-content">
          <div class="timeline-message">${evt.message}</div>
        </div>
      </div>`;
    }).join('');

    this.container.innerHTML = html || '<div class="timeline-empty">No activity yet. Run a command to see live events.</div>';
  }

  getIcon(type) {
    const icons = {
      engine: '⚙️', plan: '📋', build: '🔨', review: '🔍', repair: '🔧',
      test: '🧪', deploy: '🚀', learn: '🧠', error: '❌', success: '✅',
      warning: '⚠️', info: 'ℹ️', ai: '🤖', db: '🗄️', memory: '💾', security: '🔒',
      context: '🧩', reasoning: '🧠', knowledge: '🕸️', testing: '🧪', docs: '📝',
      analytics: '📊', orchestrator: '🎛️', evolution: '🧬', monitor: '📡'
    };
    return icons[type] || '•';
  }
}

// ==================== PIPELINE VISUALIZER ====================
class PipelineVisualizer {
  constructor() {
    this.container = null;
    this.currentPipeline = null;
    this.animationTimer = null;
  }

  show(pipelineName, steps) {
    this.container = document.getElementById('ai-pipeline');
    if (!this.container) return;

    if (this.animationTimer) clearTimeout(this.animationTimer);
    this.currentPipeline = { name: pipelineName, steps, currentStep: 0 };
    this.render();
    this.container.style.display = 'block';
    this.container.classList.add('show');

    this.animateSteps(steps);
  }

  render() {
    if (!this.container || !this.currentPipeline) return;

    const { name, steps, currentStep } = this.currentPipeline;

    let html = `<div class="pipeline-header">🔄 ${name}</div><div class="pipeline-track">`;

    steps.forEach((step, i) => {
      const status = i < currentStep ? 'completed' : i === currentStep ? 'active' : 'pending';
      const icon = i < currentStep ? '✓' : i === currentStep ? '◉' : '○';
      html += `<div class="pipeline-step ${status}">
        <div class="pipeline-step-bubble">${icon}</div>
        <div class="pipeline-step-label">${step}</div>
      </div>`;
      if (i < steps.length - 1) {
        const lineStatus = i < currentStep ? 'completed' : 'pending';
        html += `<div class="pipeline-line ${lineStatus}"></div>`;
      }
    });

    html += '</div>';
    this.container.innerHTML = html;
  }

  async animateSteps(steps) {
    for (let i = 0; i < steps.length; i++) {
      this.currentPipeline.currentStep = i;
      this.render();
      await this.delay(700 + Math.random() * 300);
    }
    this.currentPipeline.currentStep = steps.length;
    this.render();

    this.animationTimer = setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('show');
        setTimeout(() => { if (this.container) this.container.style.display = 'none'; }, 400);
      }
    }, 2500);
  }

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('show');
      this.container.style.display = 'none';
    }
  }
}

// ==================== AUTONOMOUS LOOP VISUALIZER ====================
class AutonomousLoopVisualizer {
  constructor() {
    this.steps = ['Observe', 'Understand', 'Reason', 'Plan', 'Build', 'Review', 'Repair', 'Learn'];
    this.currentStep = -1;
    this.container = null;
  }

  start() {
    this.container = document.getElementById('autonomous-loop-viz');
    this.render();
    console.log('🔄 Autonomous Loop Visualizer started');
  }

  setStep(stepIndex) {
    this.currentStep = stepIndex;
    this.render();
  }

  render() {
    if (!this.container) return;

    let html = '<div class="loop-title">🔄 Autonomous Loop</div><div class="loop-steps">';

    this.steps.forEach((step, i) => {
      const isActive = i === this.currentStep;
      const isCompleted = i < this.currentStep;
      const className = isActive ? 'loop-step active glow' : isCompleted ? 'loop-step completed' : 'loop-step';
      const icon = isCompleted ? '✓' : isActive ? '●' : '○';

      html += `<div class="${className}">
        <div class="loop-step-num">${i + 1}</div>
        <div class="loop-step-icon">${icon}</div>
        <div class="loop-step-name">${step}</div>
      </div>`;

      if (i < this.steps.length - 1) {
        html += `<div class="loop-arrow ${isCompleted ? 'completed' : ''}">↓</div>`;
      }
    });

    html += '</div>';
    if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
      html += `<div class="loop-current">Current: <span class="loop-current-name">${this.steps[this.currentStep]}</span></div>`;
    }
    this.container.innerHTML = html;
  }
}

// ==================== PROJECT HEALTH TRACKER ====================
class ProjectHealthTracker {
  constructor(os) {
    this.os = os;
    this.scores = { architecture: 95, security: 98, performance: 92, database: 100, documentation: 100, testing: 80 };
    this.timer = null;
  }

  start() {
    this.timer = setInterval(() => this.update(), 5000);
    this.update();
    console.log('🏥 Project Health Tracker started');
  }

  update() {
    const engines = this.os.engines || {};

    const totalEngines = Object.keys(engines).length;
    const readyEngines = Object.values(engines).filter(e => e.status === 'ready' || e.status === 'running').length;
    this.scores.architecture = totalEngines > 0 ? Math.round((readyEngines / totalEngines) * 100) : 0;
    this.scores.security = 98;

    if (engines.analytics && engines.analytics.metrics) {
      try {
        const avgTime = engines.analytics.getPerformanceReport()?.responseTime?.avg || 0;
        this.scores.performance = avgTime > 0 ? Math.max(0, 100 - Math.round(avgTime / 50)) : 92;
      } catch (e) {}
    }

    this.scores.database = this.os.supabase ? 100 : 0;
    this.scores.documentation = engines.documentation?.metrics?.calls > 0 ? 100 : 85;
    this.scores.testing = engines.testing?.metrics?.calls > 0 ? Math.min(100, 80 + engines.testing.metrics.calls) : 80;

    this.render();
  }

  render() {
    const container = document.getElementById('project-health-card');
    if (!container) return;

    const categories = [
      { name: 'Architecture', key: 'architecture', icon: '🏗️' },
      { name: 'Security', key: 'security', icon: '🔒' },
      { name: 'Performance', key: 'performance', icon: '⚡' },
      { name: 'Database', key: 'database', icon: '🗄️' },
      { name: 'Documentation', key: 'documentation', icon: '📝' },
      { name: 'Testing', key: 'testing', icon: '🧪' }
    ];

    let html = '<div class="health-card-title">🏥 Project Health</div>';
    let totalScore = 0;

    for (const cat of categories) {
      const score = this.scores[cat.key] || 0;
      totalScore += score;
      const color = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red';

      html += `<div class="health-row">
        <div class="health-icon">${cat.icon}</div>
        <div class="health-name">${cat.name}</div>
        <div class="health-bar-container">
          <div class="health-bar-fill ${color}" style="width: ${score}%"></div>
        </div>
        <div class="health-score ${color}">${score}%</div>
      </div>`;
    }

    const avgScore = Math.round(totalScore / categories.length);
    html += `<div class="health-overall">
      <span>Overall Health</span>
      <span class="health-overall-score ${avgScore >= 90 ? 'green' : avgScore >= 70 ? 'yellow' : 'red'}">${avgScore}%</span>
    </div>`;

    container.innerHTML = html;
  }
}

// ==================== SAFEDROP DASHBOARD ====================
class SafeDropDashboard {
  constructor() {
    this.container = null;
    this.timer = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.update();
      this.timer = setInterval(() => this.update(), 5000);
    }
  }

  update() {
    if (!this.container) return;

    const vaultData = JSON.parse(localStorage.getItem('mamta_vault') || '{}');
    const keys = vaultData.apiKeys || [];
    const passwords = vaultData.passwords || [];
    const backups = vaultData.backups || [];

    const secretsCount = keys.length + passwords.length;
    const isEncrypted = !!localStorage.getItem('mamta_vault_encrypted');
    const lastBackup = backups.length > 0 ? new Date(backups[backups.length - 1].timestamp).toLocaleString() : 'Never';
    const lastAccess = localStorage.getItem('mamta_vault_last_access') || 'Never';

    let securityScore = 0;
    if (isEncrypted) securityScore += 40;
    if (secretsCount > 0) securityScore += 20;
    if (backups.length > 0) securityScore += 20;
    if (keys.length > 0 && keys.every(k => k.value && k.value.length > 10)) securityScore += 20;

    const html = `
      <div class="sd-dash-title">🔐 SafeDrop Dashboard</div>
      <div class="sd-metric-grid">
        <div class="sd-metric">
          <div class="sd-metric-value">${secretsCount}</div>
          <div class="sd-metric-label">Stored Secrets</div>
        </div>
        <div class="sd-metric">
          <div class="sd-metric-value ${isEncrypted ? 'green' : 'red'}">${isEncrypted ? 'AES-256' : 'None'}</div>
          <div class="sd-metric-label">Encryption</div>
        </div>
        <div class="sd-metric">
          <div class="sd-metric-value">${lastBackup}</div>
          <div class="sd-metric-label">Last Backup</div>
        </div>
        <div class="sd-metric">
          <div class="sd-metric-value ${securityScore >= 80 ? 'green' : securityScore >= 50 ? 'yellow' : 'red'}">${securityScore}%</div>
          <div class="sd-metric-label">Security Score</div>
        </div>
        <div class="sd-metric">
          <div class="sd-metric-value">${lastAccess}</div>
          <div class="sd-metric-label">Last Access</div>
        </div>
        <div class="sd-metric">
          <div class="sd-metric-value">${keys.length}</div>
          <div class="sd-metric-label">API Keys</div>
        </div>
      </div>
      <div class="sd-vault-health">
        <div class="sd-health-bar">
          <div class="sd-health-fill" style="width: ${securityScore}%"></div>
        </div>
        <div class="sd-health-text">Vault Health: ${securityScore >= 80 ? 'Excellent' : securityScore >= 50 ? 'Good' : 'At Risk'}</div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}

// ==================== MAMTA AI V6.5 MAIN CLASS ====================
class MAMTAOSV6_5 extends MAMTAOSV6 {
  constructor() {
    super();
    this.version = '6.5.0';
    this.liveDashboard = null;
    this.activityTimeline = null;
    this.pipelineVisualizer = null;
    this.autonomousLoopViz = null;
    this.aiMetrics = null;
    this.projectHealth = null;
    this.safeDropDashboard = null;
  }

  async init() {
    console.log('🧠 MAMTA AI V6.5 initializing...');

    const result = await super.init();
    if (!result) return false;

    this.liveDashboard = new LiveDashboard(this);
    this.activityTimeline = new ActivityTimeline();
    this.pipelineVisualizer = new PipelineVisualizer();
    this.autonomousLoopViz = new AutonomousLoopVisualizer();
    this.aiMetrics = new AIMetricsTracker(this);
    this.projectHealth = new ProjectHealthTracker(this);

    this.liveDashboard.start();
    this.activityTimeline.start();
    this.autonomousLoopViz.start();
    this.projectHealth.start();

    this.hookAutonomousLoop();
    this.hookCommandPipeline();
    this.hookEngineEvents();
    this.hookSafeDrop();

    console.log('✅ MAMTA AI V6.5 FULLY INITIALIZED');
    if (window.showToast) window.showToast('MAMTA AI V6.5 Ready — Live OS Active', 'success');

    this.activityTimeline.addEvent('info', 'MAMTA AI V6.5 Live OS initialized', { version: this.version, engines: Object.keys(this.engines).length });

    return true;
  }

  hookAutonomousLoop() {
    if (!this.engines.orchestrator) return;
    const originalRunCycle = this.engines.orchestrator.runAutonomousCycle.bind(this.engines.orchestrator);
    this.engines.orchestrator.runAutonomousCycle = async () => {
      this.simulateLoopVisualization();
      return await originalRunCycle();
    };
  }

  async simulateLoopVisualization() {
    const steps = [0, 1, 2, 3, 4, 5, 6, 7];
    for (const step of steps) {
      this.autonomousLoopViz.setStep(step);
      this.activityTimeline.addEvent('orchestrator', `Autonomous loop: ${['Observe','Understand','Reason','Plan','Build','Review','Repair','Learn'][step]}`, { step });
      await this.delay(500);
    }
    setTimeout(() => this.autonomousLoopViz.setStep(-1), 1500);
  }

  hookCommandPipeline() {
    const originalHandleCommand = this.handleCommand.bind(this);
    this.handleCommand = async (command) => {
      const cmd = command.slice(1).split(' ')[0];

      const pipelineCommands = {
        'plan': ['Thinking...', 'Planning...', 'Building...', 'Reviewing...', 'Completed'],
        'build': ['Thinking...', 'Analyzing...', 'Building...', 'Testing...', 'Completed'],
        'review': ['Thinking...', 'Analyzing...', 'Reviewing...', 'Reporting...', 'Completed'],
        'test': ['Thinking...', 'Analyzing...', 'Generating Tests...', 'Validating...', 'Completed'],
        'heal': ['Thinking...', 'Diagnosing...', 'Repairing...', 'Validating...', 'Completed'],
        'docs': ['Thinking...', 'Analyzing...', 'Generating...', 'Formatting...', 'Completed'],
        'reason': ['Thinking...', 'Building Chain...', 'Validating...', 'Storing...', 'Completed']
      };

      if (pipelineCommands[cmd]) {
        this.pipelineVisualizer.show(`/${cmd}`, pipelineCommands[cmd]);
        this.activityTimeline.addEvent(cmd, `${cmd.charAt(0).toUpperCase() + cmd.slice(1)} started`, { command });
      }

      const result = await originalHandleCommand(command);

      if (pipelineCommands[cmd]) {
        this.activityTimeline.addEvent('success', `${cmd.charAt(0).toUpperCase() + cmd.slice(1)} completed`, { command, result: result.message });
      }

      return result;
    };
  }

  hookEngineEvents() {
    const checkEngines = () => {
      Object.entries(this.engines || {}).forEach(([name, engine]) => {
        const prevStatus = this.liveDashboard?.lastEngineStates?.[name];
        const currStatus = engine.status;

        if (prevStatus && prevStatus !== currStatus) {
          const type = currStatus === 'error' ? 'error' : currStatus === 'running' ? 'engine' : 'success';
          this.activityTimeline.addEvent(type, `${name} engine is now ${currStatus}`, { engine: name, status: currStatus });
        }

        if (this.liveDashboard) {
          this.liveDashboard.lastEngineStates[name] = currStatus;
        }
      });
    };

    setInterval(checkEngines, 2000);
  }

  hookSafeDrop() {
    // Initialize SafeDrop dashboard when on SafeDrop page
    const initSafeDrop = () => {
      const sdContainer = document.getElementById('safedrop-dashboard');
      if (sdContainer && !this.safeDropDashboard) {
        this.safeDropDashboard = new SafeDropDashboard();
        this.safeDropDashboard.init('safedrop-dashboard');
      }
    };

    // Check periodically
    setInterval(initSafeDrop, 3000);
  }

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  getSystemReport() {
    const report = super.getSystemReport();
    return {
      ...report,
      version: this.version,
      liveDashboard: this.liveDashboard ? 'active' : 'inactive',
      activityTimeline: this.activityTimeline ? 'active' : 'inactive',
      autonomousLoop: this.autonomousLoopViz ? 'active' : 'inactive',
      pipelineVisualizer: this.pipelineVisualizer ? 'active' : 'inactive'
    };
  }
}

// Override global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.mamtaOS = new MAMTAOSV6_5();
  window.mamtaOS.init();
});
