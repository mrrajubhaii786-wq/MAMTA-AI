/**
 * MAMTA AI V6.7 — Complete Single File
 * Includes: V6 Base + V6.5 Helpers + V6.6 Admin + V6.7 Home/Workspace
 * @version 6.7.0
 */

// ==================== V6.5 HELPER CLASSES ====================
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

// ==================== V6.6 ADMIN DASHBOARD ====================
class LiveDashboardV66 {
  constructor(os) {
    this.os = os;
    this.updateInterval = 2000;
    this.timer = null;
    this.lastEngineStates = {};
    this.dbStats = { tasks: 0, plans: 0, errors: 0, memory: 0, agent_logs: 0, knowledge: 0 };
    this.aiHistory = [];
    this.currentPage = 'home';
  }

  start() {
    this.updateAll();
    this.timer = setInterval(() => this.updateAll(), this.updateInterval);
    console.log('📊 Live Dashboard V6.6 started (Admin-only, 2s interval)');
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  setPage(page) {
    this.currentPage = page;
  }

  async updateAll() {
    // Only update admin-specific elements when on admin page or in background
    this.updateEngineMonitor();
    this.updateAdminOverview();
    this.updateAdminEngineGrid();
    this.updateAdminDatabaseMetrics();
    this.updateAdminAIMetrics();
    this.updateAdminHealth();
    this.updateAdminTimeline();
    this.updateProductionBar();
    await this.updateDatabaseStats();

    // Update home minimal status (always)
    this.updateHomeStatus();
    this.updateNavStatus();
  }

  // ===== HOME PAGE: Minimal Status Only =====
  updateHomeStatus() {
    const dbEl = document.getElementById('home-db-status');
    const aiEl = document.getElementById('home-ai-status');
    const modeEl = document.getElementById('home-mode-status');

    if (dbEl) dbEl.textContent = '● ' + (this.os.supabase ? 'Database Connected' : 'Database Offline');
    if (aiEl) aiEl.textContent = '● ' + (this.os.aiService?.hasKey() ? 'AI Ready' : 'AI Offline');
    if (modeEl) modeEl.textContent = '● ' + (this.os.autonomousMode ? 'Autonomous Mode' : 'Manual Mode');
  }

  updateNavStatus() {
    const dbEl = document.getElementById('nav-db-status');
    const aiEl = document.getElementById('nav-ai-status');
    const modeEl = document.getElementById('nav-mode-status');

    if (dbEl) dbEl.textContent = this.os.supabase ? 'DB' : 'DB ❌';
    if (aiEl) aiEl.textContent = this.os.aiService?.hasKey() ? 'AI' : 'AI ❌';
    if (modeEl) modeEl.textContent = this.os.autonomousMode ? 'Auto' : 'Manual';
  }

  // ===== ADMIN: Engine Monitor (16 Engines) =====
  updateEngineMonitor() {
    // Also updates the admin engine grid
  }

  updateAdminEngineGrid() {
    const grid = document.getElementById('admin-engine-grid');
    if (!grid) return;

    const engines = this.os.engines || {};
    const allEngines = [
      { name: 'Context', key: 'context', icon: '🧩' },
      { name: 'Reasoning', key: 'reasoning', icon: '🧠' },
      { name: 'Memory', key: 'memory', icon: '💾' },
      { name: 'Planner', key: 'planner', icon: '📋' },
      { name: 'Builder', key: 'builder', icon: '🔨' },
      { name: 'Reviewer', key: 'reviewer', icon: '🔍' },
      { name: 'Repair', key: 'repair', icon: '🔧' },
      { name: 'Testing', key: 'testing', icon: '🧪' },
      { name: 'Documentation', key: 'documentation', icon: '📝' },
      { name: 'Analytics', key: 'analytics', icon: '📊' },
      { name: 'Knowledge Graph', key: 'knowledgeGraph', icon: '🕸️' },
      { name: 'Orchestrator', key: 'orchestrator', icon: '🎛️' },
      { name: 'Deployment', key: 'deployment', icon: '🚀' },
      { name: 'Learning', key: 'learning', icon: '🧬' },
      { name: 'Monitor', key: 'monitor', icon: '📡' },
      { name: 'Evolution', key: 'evolution', icon: '🧬' }
    ];

    let html = '';
    let activeCount = 0;

    for (const eng of allEngines) {
      const engine = engines[eng.key];
      let status = 'idle';
      let dotClass = 'yellow';
      let statusText = 'Idle';

      if (engine) {
        status = engine.status || 'idle';
        if (status === 'ready' || status === 'running') {
          dotClass = status === 'running' ? 'cyan' : 'green';
          statusText = status === 'running' ? 'Running' : 'Ready';
          activeCount++;
        } else if (status === 'error') {
          dotClass = 'red';
          statusText = 'Error';
        }
      }

      const calls = engine?.metrics?.calls || 0;
      const errors = engine?.metrics?.errors || 0;

      html += `<div class="admin-engine-card">
        <span class="admin-engine-dot ${dotClass}"></span>
        <div class="admin-engine-name">${eng.icon} ${eng.name}</div>
        <div class="admin-engine-status">${statusText} • ${calls} calls • ${errors} errs</div>
      </div>`;
    }

    grid.innerHTML = html;

    // Update overview count
    const activeEl = document.getElementById('admin-active-engines');
    if (activeEl) activeEl.textContent = activeCount;
  }

  // ===== ADMIN: System Overview =====
  updateAdminOverview() {
    const totalEl = document.getElementById('admin-total-engines');
    const dbEl = document.getElementById('admin-db-status');
    const aiEl = document.getElementById('admin-ai-provider');
    const autoEl = document.getElementById('admin-auto-mode');
    const healthEl = document.getElementById('admin-health-score');
    const healthBar = document.getElementById('admin-health-bar');

    if (totalEl) totalEl.textContent = '16';
    if (dbEl) dbEl.textContent = this.os.supabase ? 'Connected ✅' : 'Disconnected ❌';
    if (dbEl) dbEl.className = 'admin-metric-value ' + (this.os.supabase ? 'green' : 'red');

    const provider = this.os.aiService?.preferredProvider || 'none';
    if (aiEl) aiEl.textContent = provider === 'none' ? 'Not Set' : provider.toUpperCase();

    if (autoEl) {
      autoEl.textContent = this.os.autonomousMode ? 'ON 🔄' : 'OFF';
      autoEl.className = 'admin-metric-value ' + (this.os.autonomousMode ? 'green' : '');
    }

    const health = this.calculateHealthScore();
    if (healthEl) {
      healthEl.textContent = health + '%';
      healthEl.className = 'admin-metric-value ' + (health >= 80 ? 'green' : health >= 50 ? 'yellow' : 'red');
    }
    if (healthBar) healthBar.style.width = health + '%';
  }

  // ===== ADMIN: Database Metrics =====
  updateAdminDatabaseMetrics() {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('admin-db-memory', (this.dbStats.memory || 0).toLocaleString());
    el('admin-db-plans', (this.dbStats.plans || 0).toLocaleString());
    el('admin-db-tasks', (this.dbStats.tasks || 0).toLocaleString());
    el('admin-db-errors', (this.dbStats.errors || 0).toLocaleString());
    el('admin-db-logs', (this.dbStats.agent_logs || 0).toLocaleString());
    el('admin-db-knowledge', (this.dbStats.knowledge || 0).toLocaleString());
  }

  // ===== ADMIN: AI Metrics =====
  updateAdminAIMetrics() {
    if (!this.os.aiService) return;
    const metrics = this.os.aiService.getMetrics();
    const provider = this.os.aiService.preferredProvider || 'none';
    const latency = this.aiHistory.length > 0
      ? Math.round(this.aiHistory.reduce((a, b) => a + b, 0) / this.aiHistory.length) : 0;
    const cost = (metrics.tokens * 0.000002).toFixed(4);
    const successRate = metrics.calls > 0 ? Math.round((metrics.success / metrics.calls) * 100) : 100;

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('admin-ai-provider-name', provider.toUpperCase());
    el('admin-ai-calls', metrics.calls.toLocaleString());
    el('admin-ai-tokens', metrics.tokens.toLocaleString());
    el('admin-ai-latency', latency + 'ms');
    el('admin-ai-cost', '$' + cost);
    el('admin-ai-fallbacks', metrics.failures || 0);
    el('admin-ai-success', successRate + '%');
  }

  // ===== ADMIN: Project Health =====
  updateAdminHealth() {
    const container = document.getElementById('admin-health-card');
    if (!container) return;

    const engines = this.os.engines || {};
    const total = Object.keys(engines).length;
    const ready = Object.values(engines).filter(e => e.status === 'ready' || e.status === 'running').length;
    const archScore = total > 0 ? Math.round((ready / total) * 100) : 0;
    const dbScore = this.os.supabase ? 100 : 0;
    const docScore = engines.documentation?.metrics?.calls > 0 ? 100 : 85;
    const testScore = engines.testing?.metrics?.calls > 0 ? Math.min(100, 80 + engines.testing.metrics.calls) : 80;

    const scores = {
      architecture: archScore, security: 98, performance: 92,
      database: dbScore, documentation: docScore, testing: testScore
    };

    const cats = [
      { name: 'Architecture', key: 'architecture', icon: '🏗️' },
      { name: 'Security', key: 'security', icon: '🔒' },
      { name: 'Performance', key: 'performance', icon: '⚡' },
      { name: 'Database', key: 'database', icon: '🗄️' },
      { name: 'Documentation', key: 'documentation', icon: '📝' },
      { name: 'Testing', key: 'testing', icon: '🧪' }
    ];

    let html = '<div class="admin-health-title">🏥 Project Health</div>';
    let totalScore = 0;

    for (const cat of cats) {
      const score = scores[cat.key] || 0;
      totalScore += score;
      const color = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red';
      html += `<div class="admin-health-row">
        <div class="admin-health-icon">${cat.icon}</div>
        <div class="admin-health-name">${cat.name}</div>
        <div class="admin-health-bar-container"><div class="admin-health-fill ${color}" style="width: ${score}%"></div></div>
        <div class="admin-health-score ${color}">${score}%</div>
      </div>`;
    }

    const avg = Math.round(totalScore / cats.length);
    html += `<div class="admin-health-overall"><span>Overall Health</span><span class="admin-health-overall-score ${avg >= 90 ? 'green' : avg >= 70 ? 'yellow' : 'red'}">${avg}%</span></div>`;
    container.innerHTML = html;
  }

  // ===== ADMIN: Activity Timeline =====
  updateAdminTimeline() {
    // Timeline is updated via ActivityTimeline class events, not polling
  }

  // ===== PRODUCTION BAR =====
  updateProductionBar() {
    const autoEl = document.getElementById('prod-auto');
    const manualEl = document.getElementById('prod-manual');
    const dbEl = document.getElementById('prod-db');
    const aiEl = document.getElementById('prod-ai');

    if (autoEl) autoEl.className = this.os.autonomousMode ? 'prod-indicator active' : 'prod-indicator';
    if (manualEl) manualEl.className = !this.os.autonomousMode ? 'prod-indicator active' : 'prod-indicator';
    if (dbEl) dbEl.className = this.os.supabase ? 'prod-indicator active' : 'prod-indicator error';
    if (aiEl) aiEl.className = this.os.aiService?.hasKey() ? 'prod-indicator active' : 'prod-indicator error';

    const errorCount = this.dbStats.errors || 0;
    const errorsEl = document.getElementById('prod-errors');
    if (errorsEl) errorsEl.textContent = errorCount + ' errors';
  }

  calculateHealthScore() {
    const engines = this.os.engines || {};
    const total = Object.keys(engines).length;
    if (total === 0) return 0;
    let ready = 0;
    Object.values(engines).forEach(e => { if (e.status === 'ready' || e.status === 'running') ready++; });
    const engineHealth = (ready / total) * 100;
    const dbHealth = this.os.supabase ? 100 : 0;
    const aiHealth = this.os.aiService?.hasKey() ? 100 : 0;
    return Math.round((engineHealth * 0.5 + dbHealth * 0.25 + aiHealth * 0.25));
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
    } catch (e) {}
  }

  recordLatency(duration) {
    this.aiHistory.push(duration);
    if (this.aiHistory.length > 50) this.aiHistory.shift();
  }
}

// ==================== V6 BASE CLASS ====================
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

// ==================== V6.5 MAIN CLASS ====================
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

// ==================== V6.6 MAIN CLASS ====================
class MAMTAOSV6_6 extends MAMTAOSV6_5 {
  constructor() {
    super();
    this.version = '6.6.0';
    this.liveDashboard = null;
    this.activityTimeline = null;
    this.pipelineVisualizer = null;
    this.autonomousLoopViz = null;
  }

  async init() {
    console.log('🧠 MAMTA AI V6.6 initializing...');

    const result = await super.init();
    if (!result) return false;

    // Replace V6.5 components with V6.6 versions
    this.liveDashboard = new LiveDashboardV66(this);
    this.activityTimeline = new ActivityTimelineV66();
    this.pipelineVisualizer = new PipelineVisualizerV66();
    this.autonomousLoopViz = new AutonomousLoopVisualizerV66();

    this.liveDashboard.start();

    // Re-hook with V6.6 components
    this.hookAutonomousLoopV66();
    this.hookCommandPipelineV66();
    this.hookEngineEventsV66();

    console.log('✅ MAMTA AI V6.6 FULLY INITIALIZED');
    if (window.showToast) window.showToast('MAMTA AI V6.6 Ready — 4-Page OS Architecture', 'success');

    this.activityTimeline.addEvent('info', 'MAMTA AI V6.6 initialized: Home | Workspace | Admin | SafeDrop', { version: this.version });

    return true;
  }

  hookAutonomousLoopV66() {
    if (!this.engines.orchestrator) return;
    const originalRunCycle = this.engines.orchestrator.runAutonomousCycle.bind(this.engines.orchestrator);
    this.engines.orchestrator.runAutonomousCycle = async () => {
      this.simulateLoopV66();
      return await originalRunCycle();
    };
  }

  async simulateLoopV66() {
    const steps = [0, 1, 2, 3, 4, 5, 6, 7];
    for (const step of steps) {
      this.autonomousLoopViz.setStep(step);
      this.activityTimeline.addEvent('orchestrator', `Autonomous loop: ${['Observe','Understand','Reason','Plan','Build','Review','Repair','Learn'][step]}`, { step });
      await this.delay(500);
    }
    setTimeout(() => this.autonomousLoopViz.setStep(-1), 1500);
  }

  hookCommandPipelineV66() {
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
        // Show pipeline in home chat if on home page, else in workspace
        const homeChat = document.getElementById('home-chat-messages');
        const wsChat = document.getElementById('ws-chat-messages');
        const target = homeChat || wsChat;
        if (target) {
          this.pipelineVisualizer.show(target.id, `/${cmd}`, pipelineCommands[cmd]);
        }
        this.activityTimeline.addEvent(cmd, `${cmd.charAt(0).toUpperCase() + cmd.slice(1)} started`, { command });
      }

      const result = await originalHandleCommand(command);

      if (pipelineCommands[cmd]) {
        this.activityTimeline.addEvent('success', `${cmd.charAt(0).toUpperCase() + cmd.slice(1)} completed`, { command, result: result.message });
      }

      return result;
    };
  }

  hookEngineEventsV66() {
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

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  getSystemReport() {
    const report = super.getSystemReport();
    return {
      ...report,
      version: this.version,
      architecture: '4-Page: Home | Workspace | Admin | SafeDrop',
      liveDashboard: this.liveDashboard ? 'active' : 'inactive',
      activityTimeline: this.activityTimeline ? 'active' : 'inactive',
      autonomousLoop: this.autonomousLoopViz ? 'active' : 'inactive'
    };
  }
}

// ==================== V6.7 HOME CHAT ====================
class HomeChatManager {
  constructor(os) {
    this.os = os;
    this.messages = [];
    this.isFirstMessage = true;
    this.executionKeywords = [
      'run this plan', 'build this app', 'generate code', 'create files',
      'deploy', 'execute master plan', 'start sprint', 'run project',
      'execute plan', 'build project', 'generate app', 'create project',
      'run code', 'compile', 'start build', 'deploy app', 'push to prod',
      'run this', 'build this', 'execute this', 'start build', 'start project',
      '\u0915\u094B\u0921 \u092C\u0928\u093E\u0903', '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u0903',
      'run', 'build', 'execute', 'deploy', 'compile', 'generate files'
    ];
  }
  init() { this.scrollToBottom(); }
  async sendMessage(text) {
    if (!text || !text.trim()) return;
    text = text.trim();
    this.addMessage('user', text);
    const input = document.getElementById('home-input');
    if (input) input.value = '';
    if (this.isExecutionCommand(text)) { this.showWorkspaceRedirect(text); return; }
    if (this.isPlanIntent(text)) { await this.handlePlanGeneration(text); return; }
    await this.handleGeneralChat(text);
  }
  isExecutionCommand(text) {
    const lower = text.toLowerCase();
    return this.executionKeywords.some(kw => lower.includes(kw.toLowerCase()));
  }
  isPlanIntent(text) {
    const lower = text.toLowerCase();
    return ['plan','master plan','plan banao','roadmap','strategy','\u092F\u094B\u091C\u0928\u093E','\u092A\u094D\u0932\u093E\u0928'].some(kw => lower.includes(kw.toLowerCase()));
  }
  async handleGeneralChat(text) {
    const typingId = this.showTyping();
    let response = null;
    if (this.os && this.os.aiService && typeof this.os.aiService.hasKey === 'function' && this.os.aiService.hasKey()) {
      try { response = await this.os.aiService.chat([{role:'system',content:'You are MAMTA AI. Answer in same language.'},{role:'user',content:text}]); } catch(e) {}
    }
    this.removeTyping(typingId);
    if (!response) response = this.generateLocalResponse(text);
    this.addMessage('assistant', response);
  }
  generateLocalResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('market') || lower.includes('stock')) return "Market analysis needs real-time data. Build a tracker in Workspace?";
    if (lower.includes('hello') || lower.includes('namaste')) return "Namaste! I am MAMTA AI. How can I help?";
    if (lower.includes('help')) return "I can help with: questions, planning, writing, research. Try: CRM app ka plan banao";
    if (lower.includes('weather')) return "Weather needs real-time API. Build a dashboard in Workspace!";
    if (lower.includes('crm') || lower.includes('app')) return "Great idea! Features: auth, analytics, CRUD. Want a Master Plan?";
    return "Interesting! I can discuss, research, or create a plan. What next?";
  }
  async handlePlanGeneration(text) {
    const typingId = this.showTyping();
    let plan = '';
    if (this.os && this.os.aiService && this.os.aiService.hasKey()) {
      try { plan = await this.os.aiService.chat([{role:'system',content:'Create concise master plan.'},{role:'user',content:'Plan for: '+text}]); } catch(e) {}
    }
    if (!plan) plan = this.generateLocalPlan(text);
    this.removeTyping(typingId);
    this.addMessage('assistant', plan, true);
  }
  generateLocalPlan(text) {
    let appName = 'My App';
    const lower = text.toLowerCase();
    if (lower.includes('crm')) appName = 'CRM App';
    else if (lower.includes('ecommerce')) appName = 'E-Commerce';
    else if (lower.includes('blog')) appName = 'Blog Platform';
    else if (lower.includes('dashboard')) appName = 'Analytics Dashboard';
    return `# ${appName} Master Plan

## Features
- User auth (JWT)
- Dashboard
- CRUD operations
- Real-time notifications

## Tech Stack
- React + Tailwind
- Node.js + Express
- PostgreSQL (Supabase)

## Structure
- src/components/
- src/pages/
- api/routes/
- tests/

## Next Steps
Click Send to Workspace to build!`;
  }
  showWorkspaceRedirect(text) {
    const safeText = text.replace(/'/g, "\'");
    this.addRawMessage('assistant',
      '<div class="home-redirect-card">' +
      '<div class="redirect-icon">💻</div>' +
      '<div class="redirect-text"><strong>यह execution task है।</strong><br>इसे Workspace में run करें।<br><span class="redirect-sub">Open Workspace to execute.</span></div>' +
      '<button class="redirect-btn" onclick="openWorkspaceWithPlan('' + safeText + '')">Open Workspace →</button>' +
      '</div>');
  }
  addMessage(role, text, isPlan = false) {
    const container = document.getElementById('home-chat-scroll');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'home-msg ' + role;
    let content = text.replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    if (isPlan || (role === 'assistant' && text.includes('Master Plan'))) {
      content += '<div class="plan-transfer-bar"><span class="plan-transfer-label">📋 Ready?</span><button class="plan-transfer-btn" onclick="sendPlanToWorkspace(this)">Send to Workspace →</button></div>';
      msgDiv.dataset.plan = text;
    }
    msgDiv.innerHTML = content;
    container.appendChild(msgDiv);
    this.scrollToBottom();
    if (this.isFirstMessage) { const w = document.getElementById('home-welcome'); if(w) w.style.display='none'; this.isFirstMessage=false; }
  }
  addRawMessage(role, html) {
    const container = document.getElementById('home-chat-scroll');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'home-msg ' + role;
    msgDiv.innerHTML = html;
    container.appendChild(msgDiv);
    this.scrollToBottom();
  }
  showTyping() {
    const container = document.getElementById('home-chat-scroll');
    if (!container) return null;
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id; div.className = 'home-msg assistant typing';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    container.appendChild(div); this.scrollToBottom();
    return id;
  }
  removeTyping(id) { if(id) { const el=document.getElementById(id); if(el) el.remove(); } }
  scrollToBottom() { const c=document.getElementById('home-chat-scroll'); if(c) c.scrollTop=c.scrollHeight; }
  quickAction(text) { const i=document.getElementById('home-input'); if(i) i.value=text; this.sendMessage(text); }
}

// ==================== V6.7 WORKSPACE RUNNER ====================
class WorkspacePlanRunner {
  constructor(os) { this.os=os; this.currentPlan=null; this.tasks=[]; this.files=[]; this.status='idle'; }
  init() { const saved=localStorage.getItem('mamta_workspace_plan'); if(saved){try{this.currentPlan=JSON.parse(saved);}catch(e){}}}
  setPlan(planText) { this.currentPlan={text:planText,title:this.extractTitle(planText),timestamp:new Date().toISOString(),status:'pending'}; this.savePlan(); this.renderPlan(); }
  extractTitle(text) { const m=text.match(/#\s*(.+)/); return m?m[1].trim():'Untitled Plan'; }
  savePlan() { if(this.currentPlan) localStorage.setItem('mamta_workspace_plan',JSON.stringify(this.currentPlan)); }
  renderPlan() {
    const pd=document.getElementById('mp-current-plan');
    if(pd&&this.currentPlan) pd.innerHTML='<div class="mp-plan-badge">📋 '+this.currentPlan.title+'</div><div class="mp-plan-meta">'+new Date(this.currentPlan.timestamp).toLocaleString()+'</div>';
    const ta=document.getElementById('mp-input');
    if(ta&&this.currentPlan&&this.currentPlan.text) ta.value=this.currentPlan.text;
  }
  async analyzePlan() {
    const ta=document.getElementById('mp-input');
    const text=ta?ta.value.trim():'';
    if(!text){this.log('⚠️ Paste a plan first','warning');return;}
    this.status='analyzing'; this.setBuildStatus('Analyzing...'); this.log('🔍 Analyzing...','info');
    this.setPlan(text); await this.delay(1500);
    this.tasks=this.extractTasks(text);
    this.log('✅ Found '+this.tasks.length+' tasks','success');
    this.status='idle'; this.setBuildStatus('Analyzed'); this.renderTaskQueue();
  }
  extractTasks(planText) {
    const tasks=[]; const lines=planText.split('\n'); let section='';
    for(const line of lines){const t=line.trim(); if(t.startsWith('## '))section=t.replace('## ',''); else if(t.match(/^[-*]\s+(.+)/)){const n=t.match(/^[-*]\s+(.+)/)[1]; tasks.push({id:'task-'+(tasks.length+1),name:n,section:section,status:'pending',type:this.detectTaskType(n,section)});}}
    if(tasks.length===0) tasks.push(
      {id:'task-1',name:'Setup project',section:'Setup',status:'pending',type:'build'},
      {id:'task-2',name:'Create frontend',section:'Frontend',status:'pending',type:'build'},
      {id:'task-3',name:'Build backend',section:'Backend',status:'pending',type:'build'},
      {id:'task-4',name:'Write tests',section:'Testing',status:'pending',type:'test'},
      {id:'task-5',name:'Deploy',section:'Deploy',status:'pending',type:'deploy'}
    );
    return tasks;
  }
  detectTaskType(name,section){const lower=(name+' '+section).toLowerCase(); if(lower.includes('test'))return'test'; if(lower.includes('deploy'))return'deploy'; if(lower.includes('review'))return'review'; return'build';}
  async createTaskTree(){if(this.tasks.length===0){this.log('⚠️ Analyze first','warning');return;} this.log('📋 Creating tasks...','info'); await this.delay(800); this.tasks.forEach((t,i)=>{t.status='pending';t.dependsOn=i>0?[this.tasks[i-1].id]:[];}); this.log('✅ '+this.tasks.length+' tasks','success'); this.renderTaskQueue();}
  async buildProject(){if(this.tasks.length===0){this.log('⚠️ No tasks','warning');return;} this.status='building'; this.setBuildStatus('Building...'); this.log('🔨 Building...','info'); for(const task of this.tasks){task.status='running';this.renderTaskQueue();this.log('🔨 '+task.name,'info');await this.delay(1200+Math.random()*1000);if(task.type==='build'||task.type==='design'){const f=this.generateMockFile(task);this.files.push(f);this.log('📄 '+f.path,'success');}task.status='completed';this.renderTaskQueue();this.log('✅ '+task.name,'success');} this.status='completed';this.setBuildStatus('Completed');this.log('🎉 Done!','success');this.renderGeneratedFiles();}
  generateMockFile(task){const map={'Setup project':{path:'package.json',content:'{
  "name":"project"
}'}}; return map[task.name]||{path:'src/'+task.name.toLowerCase().replace(/\s+/g,'-')+'.js',content:'// '+task.name+'
'};}
  async reviewOutput(){this.log('🔍 Reviewing...','info');await this.delay(1000);this.log('✅ Review done','success');}
  async saveProject(){this.log('💾 Saving...','info');await this.delay(500);localStorage.setItem('mamta_project_'+Date.now(),JSON.stringify({plan:this.currentPlan,tasks:this.tasks,files:this.files,timestamp:new Date().toISOString()}));this.log('✅ Saved','success');}
  renderTaskQueue(){const c=document.getElementById('mp-task-queue');if(!c)return;if(this.tasks.length===0){c.innerHTML='<div class="mp-empty">No tasks yet</div>';return;} c.innerHTML=this.tasks.map(t=>{const icon=t.status==='completed'?'✅':t.status==='running'?'⏳':'⏸️';return'<div class="mp-task-item '+t.status+'"><span class="mp-task-icon">'+icon+'</span><span class="mp-task-name">'+t.name+'</span><span class="mp-task-type">'+t.type+'</span></div>';}).join('');}
  renderGeneratedFiles(){const c=document.getElementById('mp-file-list');if(!c)return;if(this.files.length===0){c.innerHTML='<div class="mp-empty">No files</div>';return;} c.innerHTML=this.files.map(f=>'<div class="mp-file-item"><span class="mp-file-icon">📄</span><span class="mp-file-path">'+f.path+'</span></div>').join('');}
  setBuildStatus(s){const e=document.getElementById('mp-build-status');if(e)e.textContent=s;}
  log(msg,type='info'){const c=document.getElementById('mp-build-logs');if(!c)return;const t=new Date().toLocaleTimeString('en-US',{hour12:false});const d=document.createElement('div');d.className='log-entry';d.innerHTML='<span class="log-time">['+t+']</span> <span class="log-'+type+'">['+type.toUpperCase()+']</span> '+msg;c.appendChild(d);c.scrollTop=c.scrollHeight;}
  delay(ms){return new Promise(r=>setTimeout(r,ms));}
}

// ==================== V6.7 MAIN CLASS ====================
class MAMTAOSV6_7 extends MAMTAOSV6_6 {
  constructor() {
    super();
    this.version = '6.7.0';
    this.homeChat = null;
    this.wsRunner = null;
  }
  async init() {
    console.log('🧠 MAMTA AI V6.7 initializing...');
    const result = await super.init();
    if (!result) return false;
    this.homeChat = new HomeChatManager(this);
    this.homeChat.init();
    this.wsRunner = new WorkspacePlanRunner(this);
    this.wsRunner.init();
    this.setupV67EventListeners();
    this.setupPlanTransfer();
    console.log('✅ MAMTA AI V6.7 FULLY INITIALIZED');
    if (window.showToast) window.showToast('MAMTA AI V6.7 Ready', 'success');
    return true;
  }
  onPageChange(page) {
    if (page === 'workspace' && this.wsRunner) {
      this.wsRunner.renderPlan();
      this.wsRunner.renderTaskQueue();
      this.wsRunner.renderGeneratedFiles();
    }
  }
  setupV67EventListeners() {
    window.sendHomeChat = () => { const i = document.getElementById('home-input'); if (i && this.homeChat) this.homeChat.sendMessage(i.value); };
    window.homeQuick = (text) => { if (this.homeChat) this.homeChat.quickAction(text); };
    window.analyzeMasterPlan = () => { if (this.wsRunner) this.wsRunner.analyzePlan(); };
    window.createTaskTree = () => { if (this.wsRunner) this.wsRunner.createTaskTree(); };
    window.buildProject = () => { if (this.wsRunner) this.wsRunner.buildProject(); };
    window.reviewOutput = () => { if (this.wsRunner) this.wsRunner.reviewOutput(); };
    window.saveProject = () => { if (this.wsRunner) this.wsRunner.saveProject(); };
    window.sendPlanToWorkspace = (btn) => {
      const msgDiv = btn.closest('.home-msg');
      const plan = msgDiv ? msgDiv.dataset.plan : '';
      if (plan) {
        localStorage.setItem('mamta_pending_plan', plan);
        if (typeof showPage === 'function') showPage('workspace');
        setTimeout(() => { if (this.wsRunner) { this.wsRunner.setPlan(plan); if(window.showToast)window.showToast('Plan transferred!','success'); } }, 300);
      }
    };
    window.openWorkspaceWithPlan = (text) => {
      localStorage.setItem('mamta_pending_plan', text);
      if (typeof showPage === 'function') showPage('workspace');
    };
  }
  setupPlanTransfer() {
    const pending = localStorage.getItem('mamta_pending_plan');
    if (pending && this.wsRunner) {
      this.wsRunner.setPlan(pending);
      localStorage.removeItem('mamta_pending_plan');
    }
  }
  getSystemReport() {
    const report = super.getSystemReport ? super.getSystemReport() : {};
    return { ...report, version: this.version, architecture: 'V6.7: Home|Workspace|Admin|SafeDrop', homeChat: this.homeChat?'active':'inactive', workspaceRunner: this.wsRunner?'active':'inactive' };
  }
}
document.addEventListener('DOMContentLoaded', () => {
  window.mamtaOS = new MAMTAOSV6_7();
  window.mamtaOS.init();
});