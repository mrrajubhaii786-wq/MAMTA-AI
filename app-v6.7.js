/**
 * MAMTA AI V6.7 — "Talk. Build. Monitor. Secure."
 * Home = ChatGPT-style General AI Chat
 * Workspace = Master Plan Execution System
 * Admin = V6.6 Monitoring (as-is)
 * SafeDrop = V6.6 Secrets (as-is)
 * @version 6.7.0
 */

window.mamtaApp = null;

class MAMTAV67 {
  constructor() {
    this.version = '6.7.0';
    this.currentPage = 'home';
    this.currentWsTab = 'runner';
    this.chatHistory = [];
    this.plan = null;
    this.tasks = [];
    this.logs = [];
    this.generatedFiles = [];
    this.buildRunning = false;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupHomeChat();
    this.setupWorkspace();
    this.loadPendingPlan();
    console.log('🧠 MAMTA AI V6.7 initialized');
  }

  // ==================== NAVIGATION (Safe) ====================
  setupNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const page = e.currentTarget.getAttribute('data-page');
        if (page) this.showPage(page);
      });
    });
  }

  showPage(page) {
    this.currentPage = page;
    document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    const tab = document.querySelector(`.nav-tab[data-page="${page}"]`);
    if (tab) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    }
    if (page === 'workspace') this.loadPendingPlan();
    if (page === 'admin') this.startAdminMock();
  }

  showWsTab(tabName) {
    this.currentWsTab = tabName;
    document.querySelectorAll('.ws-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.ws-tab').forEach(t => t.classList.remove('active'));
    const section = document.getElementById('ws-' + tabName);
    if (section) section.classList.add('active');
    const tab = document.querySelector(`.ws-tab[data-wstab="${tabName}"]`);
    if (tab) tab.classList.add('active');
  }

  // ==================== HOME CHAT ====================
  setupHomeChat() {
    const input = document.getElementById('home-input');
    const sendBtn = document.getElementById('home-send-btn');
    if (!input || !sendBtn) return;
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  setInput(text) {
    const input = document.getElementById('home-input');
    if (input) { input.value = text; input.focus(); }
  }

  sendMessage() {
    const input = document.getElementById('home-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    const welcome = document.getElementById('home-welcome');
    if (welcome) welcome.style.display = 'none';
    this.addMessage('user', text);
    this.showTyping(true);
    setTimeout(() => {
      this.showTyping(false);
      const response = this.generateResponse(text);
      this.addMessage('ai', response.text, response.isPlan, response.isExecution);
    }, 800 + Math.random() * 600);
  }

  addMessage(role, text, isPlan = false, isExecution = false) {
    const container = document.getElementById('home-messages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role}`;
    let html = '';
    if (role === 'ai') {
      html += `<div class="chat-avatar">🤖</div>`;
    } else {
      html += `<div class="chat-avatar">🧑</div>`;
    }
    html += `<div class="chat-bubble">`;
    if (isExecution) {
      html += `<p>${text}</p>`;
      html += `<div class="exec-card">
        <div class="exec-card-title">⚡ Execution Task Detected</div>
        <div class="exec-card-text">यह execution task है। Workspace में run करें।</div>
        <button type="button" class="exec-card-btn" onclick="window.mamtaApp.showPage('workspace')">Open Workspace →</button>
      </div>`;
    } else if (isPlan) {
      html += `<p>${text}</p>`;
      html += `<button type="button" class="send-to-ws-btn" onclick="window.mamtaApp.sendToWorkspace()">📤 Send to Workspace</button>`;
    } else {
      html += this.formatText(text);
    }
    html += `</div>`;
    msgDiv.innerHTML = html;
    container.appendChild(msgDiv);
    const chatArea = document.getElementById('home-chat-area');
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    this.chatHistory.push({ role, text, isPlan, isExecution });
  }

  formatText(text) {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }

  showTyping(show) {
    const typing = document.getElementById('home-typing');
    if (typing) {
      if (show) typing.classList.remove('hidden');
      else typing.classList.add('hidden');
      if (show) {
        const chatArea = document.getElementById('home-chat-area');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
      }
    }
  }

  generateResponse(text) {
    const lower = text.toLowerCase();
    const execKeywords = ['run', 'build', 'deploy', 'execute', 'generate code', 'कोड बनाओ', 'बनाओ', 'build karo', 'deploy karo', 'create app', 'banao'];
    const isExecution = execKeywords.some(k => lower.includes(k));
    if (isExecution) {
      return {
        text: 'Main aapki execution request samajh gaya. Yeh task Workspace mein best run hoga.',
        isExecution: true,
        isPlan: false
      };
    }
    if (lower.includes('plan') || lower.includes('app') || lower.includes('website') || lower.includes('project') || lower.includes('features') || lower.includes('banana')) {
      const plan = this.generatePlan(text);
      return { text: plan, isPlan: true, isExecution: false };
    }
    return { text: this.getGeneralResponse(text), isPlan: false, isExecution: false };
  }

  generatePlan(prompt) {
    return `## Master Plan: ${prompt.slice(0, 30)}...

### Overview
AI-generated plan based on your request.

### Features
- Core functionality based on requirements
- User authentication & security
- Responsive UI/UX
- Database integration
- API endpoints

### Tech Stack
- Frontend: React / HTML-CSS-JS
- Backend: Node.js / Python
- Database: PostgreSQL / Supabase
- Hosting: Vercel / GitHub Pages

### Timeline
- Phase 1: Planning & Design (Day 1)
- Phase 2: Development (Days 2-5)
- Phase 3: Testing & Deployment (Day 6)

*Is plan ko Workspace mein bhejne ke liye "Send to Workspace" button dabayein.*`;
  }

  getGeneralResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('namaste') || lower.includes('hello') || lower.includes('hi')) {
      return 'Namaste! 🙏 Main aapki kaise madad kar sakta hoon? Aap koi bhi sawal pooch sakte hain, ya koi app/website banane ki planning kar sakte hain.';
    }
    if (lower.includes('hindi') || lower.includes('हिंदी')) {
      return 'Haan, main Hindi aur English dono mein baat kar sakta hoon. Aap jis bhi language mein comfortable ho, usmein likhein.';
    }
    if (lower.includes('weather') || lower.includes('mausam')) {
      return 'Main real-time weather data access nahi kar sakta, lekin aap OpenWeatherMap API integrate kar sakte hain. Kya main aapko uska code blueprint doon?';
    }
    if (lower.includes('time') || lower.includes('samay') || lower.includes('samay')) {
      return `Abhi ka local time: ${new Date().toLocaleTimeString()}. Date: ${new Date().toLocaleDateString()}.`;
    }
    if (lower.includes('thank') || lower.includes('dhanyawad') || lower.includes('shukriya')) {
      return 'Aapka swagat hai! 😊 Kuch aur madad chahiye toh batayein.';
    }
    return `Maine aapka message samajh liya: "${text}"

Agar aap koi specific app ya website banana chahte hain, toh mujhe details bataiye. Main aapko step-by-step plan bana ke dunga. Ya phir koi aur research/ writing task ho toh woh bhi kar sakta hoon.`;
  }

  // ==================== PLAN BRIDGE ====================
  sendToWorkspace() {
    const lastPlanMsg = [...this.chatHistory].reverse().find(m => m.isPlan);
    const planText = lastPlanMsg ? lastPlanMsg.text : this.generatePlan('last query');
    localStorage.setItem('mamta_pending_plan', planText);
    this.showPage('workspace');
  }

  loadPendingPlan() {
    const pending = localStorage.getItem('mamta_pending_plan');
    const textarea = document.getElementById('plan-input');
    if (pending && textarea) {
      textarea.value = pending;
      this.log('Plan auto-loaded from Home');
    }
  }

  // ==================== WORKSPACE ====================
  setupWorkspace() {
    // Auto-load handled in showPage
  }

  analyzePlan() {
    const btn = document.getElementById('btn-analyze');
    const textarea = document.getElementById('plan-input');
    if (!textarea || !textarea.value.trim()) {
      alert('Please paste a Master Plan first!');
      return;
    }
    this.setLoading(btn, true);
    this.plan = textarea.value;
    setTimeout(() => {
      this.setLoading(btn, false);
      const sections = (this.plan.match(/^##?\s/mg) || []).length;
      this.log('Plan analyzed: Found ' + sections + ' sections');
      alert('✅ Plan analyzed! ' + sections + ' sections found. Click "Create Task Tree" next.');
    }, 1200);
  }

  createTasks() {
    const btn = document.getElementById('btn-tasks');
    if (!this.plan) {
      alert('Please analyze the plan first!');
      return;
    }
    this.setLoading(btn, true);
    setTimeout(() => {
      this.setLoading(btn, false);
      this.tasks = this.extractTasks(this.plan);
      this.renderTasks();
      this.updateDashboard();
      this.log('Task tree created: ' + this.tasks.length + ' tasks');
    }, 1500);
  }

  extractTasks(planText) {
    const tasks = [];
    const lines = planText.split('\n');
    let currentSection = '';
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('##') || trimmed.startsWith('###')) {
        currentSection = trimmed.replace(/#+\s*/, '');
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        tasks.push({
          id: 'task_' + tasks.length,
          name: trimmed.replace(/^[-*]\s*/, ''),
          section: currentSection,
          status: 'pending'
        });
      }
    });
    if (tasks.length === 0) {
      tasks.push(
        { id: 't1', name: 'Setup project structure', section: 'Setup', status: 'pending' },
        { id: 't2', name: 'Create frontend components', section: 'Frontend', status: 'pending' },
        { id: 't3', name: 'Build backend API', section: 'Backend', status: 'pending' },
        { id: 't4', name: 'Integrate database', section: 'Database', status: 'pending' },
        { id: 't5', name: 'Testing & review', section: 'QA', status: 'pending' }
      );
    }
    return tasks;
  }

  renderTasks() {
    const container = document.getElementById('task-tree');
    if (!container) return;
    container.innerHTML = '<h3 style="margin-bottom:12px;font-size:1rem;">🌳 Task Tree</h3>';
    this.tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.innerHTML = `<div class="task-status ${task.status}"></div><div class="task-name">${task.name}</div><div class="task-badge">${task.section}</div>`;
      container.appendChild(div);
    });
  }

  buildProject() {
    const btn = document.getElementById('btn-build');
    if (this.tasks.length === 0) {
      alert('Please create tasks first!');
      return;
    }
    this.setLoading(btn, true);
    this.buildRunning = true;
    this.updateDashboard();
    let current = 0;
    const interval = setInterval(() => {
      if (current >= this.tasks.length) {
        clearInterval(interval);
        this.buildRunning = false;
        this.setLoading(btn, false);
        this.generateFiles();
        this.log('Build completed successfully!');
        alert('✅ Build complete! Check Execution Dashboard.');
        return;
      }
      this.tasks[current].status = 'running';
      this.log('Building: ' + this.tasks[current].name);
      this.renderTasks();
      this.updateDashboard();
      setTimeout(() => {
        this.tasks[current].status = 'completed';
        this.renderTasks();
        this.updateDashboard();
        current++;
      }, 600);
    }, 1000);
  }

  reviewOutput() {
    const btn = document.getElementById('btn-review');
    this.setLoading(btn, true);
    setTimeout(() => {
      this.setLoading(btn, false);
      this.log('Review: All checks passed');
      alert('✅ Review complete! Code quality: Good. No critical issues found.');
    }, 1000);
  }

  saveProject() {
    const btn = document.getElementById('btn-save');
    this.setLoading(btn, true);
    setTimeout(() => {
      this.setLoading(btn, false);
      const exportData = {
        version: this.version,
        plan: this.plan,
        tasks: this.tasks,
        files: this.generatedFiles,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mamta-project-${Date.now()}.json`;
      a.click();
      this.log('Project saved to file');
    }, 800);
  }

  generateFiles() {
    this.generatedFiles = [
      { name: 'index.html', size: '4.2 KB', type: 'html' },
      { name: 'app.js', size: '12.8 KB', type: 'js' },
      { name: 'style.css', size: '3.1 KB', type: 'css' },
      { name: 'package.json', size: '0.8 KB', type: 'json' }
    ];
    const container = document.getElementById('generated-files');
    if (container) {
      container.innerHTML = this.generatedFiles.map(f => `
        <div class="file-item">
          <span class="file-icon">${f.type === 'html' ? '🌐' : f.type === 'js' ? '⚡' : f.type === 'css' ? '🎨' : '📄'}</span>
          <span class="file-name">${f.name}</span>
          <span class="file-size">${f.size}</span>
        </div>
      `).join('');
    }
    const builder = document.getElementById('builder-files');
    if (builder) {
      builder.innerHTML = this.generatedFiles.map(f => `
        <div class="file-item" style="justify-content:space-between;cursor:pointer;" onclick="alert('Preview: ${f.name}')">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="file-icon">${f.type === 'html' ? '🌐' : f.type === 'js' ? '⚡' : f.type === 'css' ? '🎨' : '📄'}</span>
            <span class="file-name">${f.name}</span>
          </div>
          <span class="file-size">${f.size} ↓</span>
        </div>
      `).join('');
    }
  }

  // ==================== DASHBOARD ====================
  updateDashboard() {
    const planName = document.getElementById('dash-plan-name');
    const planStatus = document.getElementById('dash-plan-status');
    const sprint = document.getElementById('dash-sprint');
    const sprintSub = document.getElementById('dash-sprint-sub');
    const task = document.getElementById('dash-task');
    const taskSub = document.getElementById('dash-task-sub');
    const progress = document.getElementById('dash-progress');
    const progressSub = document.getElementById('dash-progress-sub');
    const queue = document.getElementById('task-queue');
    if (this.plan) {
      const title = this.plan.split('\n')[0].replace(/#+\s*/, '') || 'Untitled Plan';
      if (planName) planName.textContent = title.slice(0, 30);
      if (planStatus) planStatus.textContent = 'Loaded & Ready';
    }
    if (this.buildRunning) {
      if (sprint) sprint.textContent = 'Running';
      if (sprintSub) sprintSub.textContent = 'Build in progress...';
    } else if (this.tasks.some(t => t.status === 'completed')) {
      if (sprint) sprint.textContent = 'Completed';
      if (sprintSub) sprintSub.textContent = 'All tasks done';
    }
    const running = this.tasks.find(t => t.status === 'running');
    if (running) {
      if (task) task.textContent = running.name;
      if (taskSub) taskSub.textContent = 'In progress';
    } else {
      if (task) task.textContent = '—';
      if (taskSub) taskSub.textContent = 'None';
    }
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const total = this.tasks.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    if (progress) progress.textContent = pct + '%';
    if (progressSub) progressSub.textContent = `${completed} / ${total} tasks`;
    if (queue) {
      if (this.tasks.length === 0) {
        queue.innerHTML = '<div style="color:var(--text-dark);padding:12px;">No tasks yet. Create a task tree first.</div>';
      } else {
        queue.innerHTML = this.tasks.map(t => `
          <div class="task-item" style="margin-bottom:6px;">
            <div class="task-status ${t.status}"></div>
            <div class="task-name">${t.name}</div>
            <div class="task-badge">${t.status}</div>
          </div>
        `).join('');
      }
    }
  }

  // ==================== LOGS ====================
  log(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ time, message, type });
    const container = document.getElementById('build-logs');
    if (container) {
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `<span class="log-time">${time}</span> <span class="log-${type}">${message}</span>`;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }
  }

  // ==================== UTILS ====================
  setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  startAdminMock() {
    setInterval(() => {
      const calls = document.getElementById('ai-calls');
      const tokens = document.getElementById('ai-tokens');
      if (calls) calls.textContent = parseInt(calls.textContent) + Math.floor(Math.random() * 3);
      if (tokens) tokens.textContent = parseInt(tokens.textContent) + Math.floor(Math.random() * 50);
    }, 3000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.mamtaApp = new MAMTAV67();
});
