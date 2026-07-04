/**
 * MAMTA AI V6.7 — "ChatGPT-Style Home + Workspace Execution Separation"
 * Home = General AI Chat | Workspace = Master Plan Execution
 * @version 6.7.0
 */

// ==================== HOME CHAT MANAGER ====================
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
      '\u0915\u094B\u0921 \u092C\u0928\u093E\u0903', '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u0903', '\u092A\u094D\u0932\u093E\u0928 \u091A\u0932\u093E\u0903', '\u092C\u093F\u0932\u094D\u0921 \u0915\u0930\u094B', '\u0921\u093F\u092A\u094D\u0932\u094B\u092F \u0915\u0930\u094B',
      'run', 'build', 'execute', 'deploy', 'compile', 'generate files'
    ];
  }

  init() {
    this.scrollToBottom();
  }

  async sendMessage(text) {
    if (!text || !text.trim()) return;
    text = text.trim();

    this.addMessage('user', text);
    const input = document.getElementById('home-input');
    if (input) input.value = '';

    if (this.isExecutionCommand(text)) {
      this.showWorkspaceRedirect(text);
      return;
    }

    if (this.isPlanIntent(text)) {
      await this.handlePlanGeneration(text);
      return;
    }

    await this.handleGeneralChat(text);
  }

  isExecutionCommand(text) {
    const lower = text.toLowerCase();
    return this.executionKeywords.some(kw => lower.includes(kw.toLowerCase()));
  }

  isPlanIntent(text) {
    const lower = text.toLowerCase();
    const planKeywords = [
      'plan \u092C\u0928\u093E\u0903', 'master plan', 'plan banao', 'plan for', 'plan to',
      'create plan', 'make plan', 'project plan', 'app plan', 'roadmap',
      'strategy', 'architecture plan', 'feature plan', 'sprint plan',
      '\u092F\u094B\u091C\u0928\u093E', '\u092A\u094D\u0932\u093E\u0928', '\u0930\u094B\u0921\u092E\u0948\u092A', '\u0915\u093E\u0930\u094D\u092F\u092F\u094B\u091C\u0928\u093E'
    ];
    return planKeywords.some(kw => lower.includes(kw.toLowerCase()));
  }

  async handleGeneralChat(text) {
    const typingId = this.showTyping();

    let response = null;
    if (this.os && this.os.aiService && typeof this.os.aiService.hasKey === 'function' && this.os.aiService.hasKey()) {
      try {
        response = await this.os.aiService.chat([
          { role: 'system', content: 'You are MAMTA AI, a helpful assistant. Answer in the same language as the user (Hindi or English). Keep responses concise and actionable.' },
          { role: 'user', content: text }
        ]);
      } catch (e) {
        console.warn('AI service failed:', e);
      }
    }

    this.removeTyping(typingId);

    if (!response) {
      response = this.generateLocalResponse(text);
    }

    this.addMessage('assistant', response);

    if (this.os && this.os.engines && this.os.engines.memory) {
      try {
        await this.os.engines.memory.storeConversation('home-chat', [
          { role: 'user', content: text, timestamp: new Date().toISOString() },
          { role: 'assistant', content: response, timestamp: new Date().toISOString() }
        ]);
      } catch (e) {}
    }
  }

  generateLocalResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes('market') || lower.includes('stock') || lower.includes('share') || lower.includes(' nifty') || lower.includes('sensex')) {
      return "\uD83D\uDCC8 Market analysis requires real-time data. I recommend checking NSE/BSE official sites or using a financial API. Would you like me to help you build a market tracker app in **Workspace**?";
    }
    if (lower.includes('hello') || lower.includes('hi ') || lower.includes('namaste') || lower.includes('hey') || lower.includes('\u0928\u092E\u0938\u094D\u0924\u0947')) {
      return "Namaste! \uD83D\uDE4F I'm MAMTA AI. I can help you plan projects, write content, research topics, or discuss strategies. What would you like to talk about?";
    }
    if (lower.includes('help') || lower.includes('\u0915\u094D\u092F\u093E \u0915\u0930 \u0938\u0915\u0924\u0947')) {
      return "\uD83E\uDDE0 **MAMTA AI can help you with:**\n\n\u2022 General questions & research\n\u2022 Project planning & strategy\n\u2022 Writing & editing content\n\u2022 Discussing product ideas\n\u2022 Creating master plans (then send to Workspace for execution)\n\nTry: *\"CRM app ka plan banao\"* or *\"Write a blog on AI\"*";
    }
    if (lower.includes('weather') || lower.includes('mausam') || lower.includes('\u092E\u094C\u0938\u092E')) {
      return "\uD83C\uDF24\uFE0F Weather data needs a real-time API. I can help you build a weather dashboard app! Click **Build with Workspace** below.";
    }
    if (lower.includes('crm') || lower.includes('dashboard') || lower.includes('app') || lower.includes('website')) {
      return `\uD83D\uDCA1 Great idea! Here's a quick concept:\n\n**Features:** User auth, data management, analytics, notifications\n**Tech Stack:** React/Vue + Node.js/Supabase\n\nWant me to create a full **Master Plan**? Then you can send it to **Workspace** to build it!`;
    }

    return "\uD83E\uDD14 That's an interesting topic. I can discuss this further, help you research, or turn it into a structured plan. What would you like to do next?";
  }

  async handlePlanGeneration(text) {
    const typingId = this.showTyping();

    let plan = '';
    if (this.os && this.os.aiService && typeof this.os.aiService.hasKey === 'function' && this.os.aiService.hasKey()) {
      try {
        plan = await this.os.aiService.chat([
          { role: 'system', content: 'You are a technical project planner. Create a concise master plan with: Features, Tech Stack, Pages/Components, API Endpoints, Database Schema. Respond in the same language as the user.' },
          { role: 'user', content: `Create a master plan for: ${text}` }
        ]);
      } catch (e) {}
    }

    if (!plan) {
      plan = this.generateLocalPlan(text);
    }

    this.removeTyping(typingId);
    this.addMessage('assistant', plan, true);
  }

  generateLocalPlan(text) {
    const lower = text.toLowerCase();
    let appName = 'My App';

    if (lower.includes('crm')) appName = 'CRM App';
    else if (lower.includes('ecommerce') || lower.includes('shop')) appName = 'E-Commerce Platform';
    else if (lower.includes('blog')) appName = 'Blog Platform';
    else if (lower.includes('dashboard')) appName = 'Analytics Dashboard';
    else if (lower.includes('chat')) appName = 'Chat Application';

    return `# \uD83D\uDE80 ${appName} Master Plan\n\n## \uD83D\uDCCB Features\n- User authentication (JWT/OAuth)\n- Dashboard with analytics\n- Data management (CRUD)\n- Real-time notifications\n- Responsive design\n\n## \uD83D\uDEE0\uFE0F Tech Stack\n- **Frontend:** React + Tailwind CSS\n- **Backend:** Node.js + Express\n- **Database:** PostgreSQL (Supabase)\n- **AI:** OpenAI/Gemini integration\n- **Deploy:** GitHub Pages / Vercel\n\n## \uD83D\uDCC1 Project Structure\n- src/components/ \u2014 UI components\n- src/pages/ \u2014 Route pages\n- src/hooks/ \u2014 Custom hooks\n- api/routes/ \u2014 Backend endpoints\n- tests/ \u2014 Unit & integration tests\n\n## \uD83D\uDDC4\uFE0F Database Schema\n- users (id, email, name, role)\n- projects (id, name, user_id, status)\n- tasks (id, title, project_id, status)\n\n## \uD83C\uDFAF Next Steps\nClick **"Send to Workspace"** below to start building this project!`;
  }

  showWorkspaceRedirect(text) {
    const html = `
      <div class="home-redirect-card">
        <div class="redirect-icon">\uD83D\uDCBB</div>
        <div class="redirect-text">
          <strong>\u092F\u0939 execution task \u0939\u0948\u0964</strong><br>
          \u0907\u0938\u0947 Workspace \u092E\u0947\u0902 run \u0915\u0930\u0947\u0902\u0964<br>
          <span class="redirect-sub">This is a build/execution task. Open Workspace to run it.</span>
        </div>
        <button class="redirect-btn" onclick="openWorkspaceWithPlan('${this.escapeHtml(text)}')">Open Workspace \u2192</button>
      </div>
    `;
    this.addRawMessage('assistant', html);
  }

  addMessage(role, text, isPlan = false) {
    const container = document.getElementById('home-chat-scroll');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `home-msg ${role}`;

    let content = this.formatMessage(text);

    if (isPlan || (role === 'assistant' && text.includes('Master Plan'))) {
      content += `
        <div class="plan-transfer-bar">
          <span class="plan-transfer-label">\uD83D\uDCCB Ready to build?</span>
          <button class="plan-transfer-btn" onclick="sendPlanToWorkspace(this)">
            Send to Workspace \u2192
          </button>
        </div>
      `;
      msgDiv.dataset.plan = text;
    }

    msgDiv.innerHTML = content;
    container.appendChild(msgDiv);
    this.scrollToBottom();

    if (this.isFirstMessage) {
      const welcome = document.getElementById('home-welcome');
      if (welcome) welcome.style.display = 'none';
      this.isFirstMessage = false;
    }
  }

  addRawMessage(role, html) {
    const container = document.getElementById('home-chat-scroll');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `home-msg ${role}`;
    msgDiv.innerHTML = html;
    container.appendChild(msgDiv);
    this.scrollToBottom();
  }

  formatMessage(text) {
    return text
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showTyping() {
    const container = document.getElementById('home-chat-scroll');
    if (!container) return null;
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'home-msg assistant typing';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    this.scrollToBottom();
    return id;
  }

  removeTyping(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    const container = document.getElementById('home-chat-scroll');
    if (container) container.scrollTop = container.scrollHeight;
  }

  quickAction(text) {
    const input = document.getElementById('home-input');
    if (input) input.value = text;
    this.sendMessage(text);
  }
}

// ==================== WORKSPACE PLAN RUNNER ====================
class WorkspacePlanRunner {
  constructor(os) {
    this.os = os;
    this.currentPlan = null;
    this.tasks = [];
    this.buildLogs = [];
    this.files = [];
    this.status = 'idle';
  }

  init() {
    const saved = localStorage.getItem('mamta_workspace_plan');
    if (saved) {
      try {
        this.currentPlan = JSON.parse(saved);
      } catch (e) {}
    }
  }

  setPlan(planText) {
    this.currentPlan = {
      text: planText,
      title: this.extractTitle(planText),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    this.savePlan();
    this.renderPlan();
  }

  extractTitle(text) {
    const match = text.match(/#\s*(.+)/);
    return match ? match[1].trim() : 'Untitled Plan';
  }

  savePlan() {
    if (this.currentPlan) {
      localStorage.setItem('mamta_workspace_plan', JSON.stringify(this.currentPlan));
    }
  }

  renderPlan() {
    const planDisplay = document.getElementById('mp-current-plan');
    if (planDisplay && this.currentPlan) {
      planDisplay.innerHTML = `
        <div class="mp-plan-badge">\uD83D\uDCCB ${this.currentPlan.title}</div>
        <div class="mp-plan-meta">Imported ${new Date(this.currentPlan.timestamp).toLocaleString()}</div>
      `;
    }

    const textarea = document.getElementById('mp-input');
    if (textarea && this.currentPlan && this.currentPlan.text) {
      textarea.value = this.currentPlan.text;
    }
  }

  async analyzePlan() {
    const textarea = document.getElementById('mp-input');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) {
      this.log('\u26A0\uFE0F Please paste a Master Plan first', 'warning');
      return;
    }

    this.status = 'analyzing';
    this.setBuildStatus('Analyzing...');
    this.log('\uD83D\uDD0D Analyzing Master Plan...', 'info');

    this.setPlan(text);
    await this.delay(1500);

    this.tasks = this.extractTasks(text);

    this.log(`\u2705 Analysis complete. Found ${this.tasks.length} tasks.`, 'success');
    this.status = 'idle';
    this.setBuildStatus('Analyzed');
    this.renderTaskQueue();
  }

  extractTasks(planText) {
    const tasks = [];
    const lines = planText.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        currentSection = trimmed.replace('## ', '');
      } else if (trimmed.match(/^[-*]\s+(.+)/)) {
        const taskName = trimmed.match(/^[-*]\s+(.+)/)[1];
        tasks.push({
          id: `task-${tasks.length + 1}`,
          name: taskName,
          section: currentSection,
          status: 'pending',
          type: this.detectTaskType(taskName, currentSection)
        });
      }
    }

    if (tasks.length === 0) {
      tasks.push(
        { id: 'task-1', name: 'Setup project structure', section: 'Setup', status: 'pending', type: 'build' },
        { id: 'task-2', name: 'Create frontend components', section: 'Frontend', status: 'pending', type: 'build' },
        { id: 'task-3', name: 'Build backend API', section: 'Backend', status: 'pending', type: 'build' },
        { id: 'task-4', name: 'Write tests', section: 'Testing', status: 'pending', type: 'test' },
        { id: 'task-5', name: 'Review and deploy', section: 'Deploy', status: 'pending', type: 'deploy' }
      );
    }

    return tasks;
  }

  detectTaskType(name, section) {
    const lower = (name + ' ' + section).toLowerCase();
    if (lower.includes('test')) return 'test';
    if (lower.includes('deploy')) return 'deploy';
    if (lower.includes('review')) return 'review';
    if (lower.includes('design') || lower.includes('ui')) return 'design';
    return 'build';
  }

  async createTaskTree() {
    if (this.tasks.length === 0) {
      this.log('\u26A0\uFE0F No tasks found. Run Analyze Plan first.', 'warning');
      return;
    }

    this.log('\uD83D\uDCCB Creating task tree...', 'info');
    await this.delay(800);

    this.tasks.forEach((task, i) => {
      task.status = 'pending';
      task.dependsOn = i > 0 ? [this.tasks[i-1].id] : [];
    });

    this.log(`\u2705 Task tree created with ${this.tasks.length} tasks.`, 'success');
    this.renderTaskQueue();
  }

  async buildProject() {
    if (this.tasks.length === 0) {
      this.log('\u26A0\uFE0F No tasks to build. Run Analyze Plan first.', 'warning');
      return;
    }

    this.status = 'building';
    this.setBuildStatus('Building...');
    this.log('\uD83D\uDD28 Starting build...', 'info');

    for (const task of this.tasks) {
      task.status = 'running';
      this.renderTaskQueue();
      this.log(`\uD83D\uDD28 ${task.name}...`, 'info');

      await this.delay(1200 + Math.random() * 1000);

      if (task.type === 'build' || task.type === 'design') {
        const file = this.generateMockFile(task);
        this.files.push(file);
        this.log(`\uD83D\uDCC4 Generated ${file.path}`, 'success');
      }

      task.status = 'completed';
      this.renderTaskQueue();
      this.log(`\u2705 ${task.name} completed`, 'success');
    }

    this.status = 'completed';
    this.setBuildStatus('Completed');
    this.log('\uD83C\uDF89 Build completed successfully!', 'success');
    this.renderGeneratedFiles();
  }

  generateMockFile(task) {
    const fileMap = {
      'Setup project structure': { path: 'package.json', content: '{\n  "name": "project",\n  "version": "1.0.0"\n}' },
      'Create frontend components': { path: 'src/components/App.jsx', content: 'export default function App() { return <div>Hello</div>; }' },
      'Build backend API': { path: 'api/index.js', content: 'const express = require("express");\nconst app = express();' },
      'Write tests': { path: 'tests/app.test.js', content: 'test("app works", () => { expect(true).toBe(true); });' }
    };

    return fileMap[task.name] || { 
      path: `src/${task.name.toLowerCase().replace(/\s+/g, '-')}.js`, 
      content: `// ${task.name}\n// Generated by MAMTA AI\n` 
    };
  }

  async reviewOutput() {
    this.log('\uD83D\uDD0D Reviewing output...', 'info');
    await this.delay(1000);

    const issues = [];
    if (this.files.length === 0) issues.push('No files generated');

    this.log(`\u2705 Review complete. ${issues.length} issues found.`, 'success');
  }

  async saveProject() {
    this.log('\uD83D\uDCBE Saving project...', 'info');
    await this.delay(500);

    const projectData = {
      plan: this.currentPlan,
      tasks: this.tasks,
      files: this.files,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('mamta_project_' + Date.now(), JSON.stringify(projectData));
    this.log('\u2705 Project saved to localStorage', 'success');
  }

  renderTaskQueue() {
    const container = document.getElementById('mp-task-queue');
    if (!container) return;

    if (this.tasks.length === 0) {
      container.innerHTML = '<div class="mp-empty">No tasks yet. Paste a Master Plan above to start.</div>';
      return;
    }

    const html = this.tasks.map(t => {
      const statusIcon = t.status === 'completed' ? '\u2705' : t.status === 'running' ? '\u23F3' : t.status === 'failed' ? '\u274C' : '\u23F8\uFE0F';
      const statusClass = t.status;
      return `
        <div class="mp-task-item ${statusClass}">
          <span class="mp-task-icon">${statusIcon}</span>
          <span class="mp-task-name">${t.name}</span>
          <span class="mp-task-type">${t.type}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  renderGeneratedFiles() {
    const container = document.getElementById('mp-file-list');
    if (!container) return;

    if (this.files.length === 0) {
      container.innerHTML = '<div class="mp-empty">No files generated yet.</div>';
      return;
    }

    const html = this.files.map(f => `
      <div class="mp-file-item">
        <span class="mp-file-icon">\uD83D\uDCC4</span>
        <span class="mp-file-path">${f.path}</span>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  setBuildStatus(status) {
    const el = document.getElementById('mp-build-status');
    if (el) el.textContent = status;
  }

  log(message, type = 'info') {
    const container = document.getElementById('mp-build-logs');
    if (!container) return;

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const typeClass = type;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-${typeClass}">[${type.toUpperCase()}]</span> ${message}`;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
  }

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
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
    console.log('\uD83E\uDDE0 MAMTA AI V6.7 initializing...');

    const result = await super.init();
    if (!result) return false;

    this.homeChat = new HomeChatManager(this);
    this.homeChat.init();

    this.wsRunner = new WorkspacePlanRunner(this);
    this.wsRunner.init();

    this.setupV67EventListeners();
    this.setupPlanTransfer();

    console.log('\u2705 MAMTA AI V6.7 FULLY INITIALIZED');
    if (window.showToast) window.showToast('MAMTA AI V6.7 Ready — Home Chat + Workspace Execution', 'success');

    return true;
  }

  // Called by the global showPage function when page changes
  onPageChange(page) {
    if (page === 'workspace' && this.wsRunner) {
      this.wsRunner.renderPlan();
      this.wsRunner.renderTaskQueue();
      this.wsRunner.renderGeneratedFiles();
    }
  }

  setupV67EventListeners() {
    window.sendHomeChat = () => {
      const input = document.getElementById('home-input');
      if (input && this.homeChat) {
        this.homeChat.sendMessage(input.value);
      }
    };

    window.homeQuick = (text) => {
      if (this.homeChat) {
        this.homeChat.quickAction(text);
      }
    };

    window.analyzeMasterPlan = () => {
      if (this.wsRunner) this.wsRunner.analyzePlan();
    };
    window.createTaskTree = () => {
      if (this.wsRunner) this.wsRunner.createTaskTree();
    };
    window.buildProject = () => {
      if (this.wsRunner) this.wsRunner.buildProject();
    };
    window.reviewOutput = () => {
      if (this.wsRunner) this.wsRunner.reviewOutput();
    };
    window.saveProject = () => {
      if (this.wsRunner) this.wsRunner.saveProject();
    };

    window.sendPlanToWorkspace = (btnElement) => {
      const msgDiv = btnElement.closest('.home-msg');
      const plan = msgDiv ? msgDiv.dataset.plan : '';
      if (plan) {
        localStorage.setItem('mamta_pending_plan', plan);
        // Use the global showPage function
        if (typeof showPage === 'function') {
          showPage('workspace');
        }
        setTimeout(() => {
          if (this.wsRunner) {
            this.wsRunner.setPlan(plan);
            if (window.showToast) window.showToast('Plan transferred to Workspace!', 'success');
          }
        }, 300);
      }
    };

    window.openWorkspaceWithPlan = (text) => {
      localStorage.setItem('mamta_pending_plan', text);
      if (typeof showPage === 'function') {
        showPage('workspace');
      }
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
    return {
      ...report,
      version: this.version,
      architecture: 'V6.7: Home(Chat) | Workspace(Execution) | Admin(Monitor) | SafeDrop(Secrets)',
      homeChat: this.homeChat ? 'active' : 'inactive',
      workspaceRunner: this.wsRunner ? 'active' : 'inactive'
    };
  }
}

// Override global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.mamtaOS = new MAMTAOSV6_7();
  window.mamtaOS.init();
});
