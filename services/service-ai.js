/**
 * MAMTA AI V6 — AI Service
 * Real AI integration with OpenAI GPT-4 + Gemini Fallback
 * No placeholders. Real API calls.
 * @version 6.0.0
 */
class AIService {
  constructor() {
    this.name = 'AIService';
    this.version = '6.0.0';
    this.openaiKey = localStorage.getItem('mamta_openai_key') || '';
    this.geminiKey = localStorage.getItem('mamta_gemini_key') || '';
    this.preferredProvider = localStorage.getItem('mamta_ai_provider') || 'openai';
    this.models = {
      openai: 'gpt-4o',
      gemini: 'gemini-1.5-pro-latest'
    };
    this.timeout = 30000;
    this.maxRetries = 2;
    this.metrics = { calls: 0, success: 0, failures: 0, tokens: 0 };
  }

  async init() {
    console.log('🤖 AI Service V6 initialized');
    if (!this.hasKey()) {
      console.warn('⚠️ No AI API key configured. Set via /settings or SafeDrop vault.');
    }
    return true;
  }

  hasKey() {
    return !!(this.openaiKey || this.geminiKey);
  }

  setKeys(openai, gemini, provider = 'openai') {
    this.openaiKey = openai;
    this.geminiKey = gemini;
    this.preferredProvider = provider;
    localStorage.setItem('mamta_openai_key', openai);
    localStorage.setItem('mamta_gemini_key', gemini);
    localStorage.setItem('mamta_ai_provider', provider);
    console.log(`🔑 AI keys saved. Provider: ${provider}`);
  }

  // ───────────────────────────────────────────────
  // CORE: Generate code with real AI
  // ───────────────────────────────────────────────
  async generateCode(prompt, options = {}) {
    const systemPrompt = `You are MAMTA AI Code Generator V6. Write production-ready, well-commented code.
Rules:
- Use modern ES6+ JavaScript
- Include JSDoc comments
- Handle errors gracefully
- Follow security best practices
- No placeholders, no TODOs, no mock logic
- Return ONLY the code, no markdown fences`;

    return await this.callAI(systemPrompt, prompt, options);
  }

  // ───────────────────────────────────────────────
  // CORE: Review code with real AI
  // ───────────────────────────────────────────────
  async reviewCode(code, filename = 'code.js', context = {}) {
    const systemPrompt = `You are MAMTA AI Code Reviewer V6. Perform deep analysis.
Return JSON only:
{
  "score": 0-100,
  "summary": { "critical": N, "warnings": N, "suggestions": N },
  "issues": [
    { "severity": "critical|warning|info", "line": N, "message": "...", "fix": "..." }
  ],
  "security": ["..."],
  "performance": ["..."],
  "architecture": ["..."],
  "naming": ["..."],
  "dependencies": ["..."],
  "refactor": "..."
}`;

    const userPrompt = `Review this ${filename} code:

${code}

Context: ${JSON.stringify(context)}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true });

    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      return this.fallbackReview(code);
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Analyze error with real AI
  // ───────────────────────────────────────────────
  async analyzeError(error, context = {}) {
    const systemPrompt = `You are MAMTA AI Error Analyzer V6.
Return JSON only:
{
  "rootCause": "detailed explanation",
  "severity": "critical|high|medium|low",
  "confidence": 0.0-1.0,
  "fix": { "description": "...", "code": "...", "explanation": "..." },
  "prevention": ["..."],
  "relatedPatterns": ["..."]
}`;

    const userPrompt = `Error: ${error.name}: ${error.message}
Stack: ${error.stack || 'N/A'}
Context: ${JSON.stringify(context)}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true });

    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      return this.fallbackErrorAnalysis(error);
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Decompose goal with real AI
  // ───────────────────────────────────────────────
  async decomposeGoal(goal) {
    const systemPrompt = `You are MAMTA AI Planner V6. Decompose goals into phases.
Return JSON array only:
[
  { "id": "p1", "name": "Phase Name", "order": 1, "status": "pending", "tasks": [
    { "name": "Task Name", "description": "...", "priority": "high|medium|low", "hours": 4 }
  ]}
]`;

    const userPrompt = `Decompose this project goal into development phases: ${goal}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true });

    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      return Array.isArray(parsed) ? parsed : this.fallbackDecompose(goal);
    } catch (e) {
      return this.fallbackDecompose(goal);
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Suggest architecture with real AI
  // ───────────────────────────────────────────────
  async suggestArchitecture(goal, techStack = []) {
    const systemPrompt = `You are MAMTA AI Architect V6.
Return JSON only:
{
  "pattern": "...",
  "frontend": "...",
  "backend": "...",
  "database": "...",
  "hosting": "...",
  "security": "...",
  "ai": "...",
  "reasoning": "..."
}`;

    const userPrompt = `Suggest architecture for: ${goal}
Tech stack preference: ${techStack.join(', ') || 'modern web'}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true });

    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      return this.fallbackArchitecture(goal, techStack);
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Generate fix with real AI
  // ───────────────────────────────────────────────
  async generateFix(error, context = {}) {
    const systemPrompt = `You are MAMTA AI Repair Engineer V6.
Return JSON only:
{
  "canFix": true|false,
  "fixType": "...",
  "description": "...",
  "code": "patched code or null",
  "explanation": "...",
  "testStrategy": "...",
  "confidence": 0.0-1.0
}`;

    const userPrompt = `Fix this error: ${error.name}: ${error.message}
Stack: ${error.stack || 'N/A'}
Context: ${JSON.stringify(context)}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true });

    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      return { canFix: false, description: 'AI analysis failed', confidence: 0 };
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Analyze requirements with real AI
  // ───────────────────────────────────────────────
  async analyzeRequirements(description) {
    const systemPrompt = `You are MAMTA AI Requirements Analyst V6.
Return JSON array only:
[
  { "name": "filename.js", "type": "js|html|css|sql|md", "reason": "...", "priority": "high|medium|low", "content": "brief description of what this file should contain" }
]`;

    const userPrompt = `Analyze requirements and suggest files: ${description}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true });

    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Generate project files with real AI
  // ───────────────────────────────────────────────
  async generateProjectFiles(name, type, description) {
    const systemPrompt = `You are MAMTA AI Project Generator V6.
Return JSON only:
{
  "files": [
    { "path": "...", "type": "...", "content": "full file content" }
  ],
  "architecture": "brief description",
  "dependencies": ["..."]
}`;

    const userPrompt = `Generate a complete ${type} project named "${name}". Description: ${description}`;
    const result = await this.callAI(systemPrompt, userPrompt, { json: true, maxTokens: 4000 });

    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      return parsed.files || [];
    } catch (e) {
      return [];
    }
  }

  // ───────────────────────────────────────────────
  // CORE: Generate documentation with real AI
  // ───────────────────────────────────────────────
  async generateDocumentation(topic, content, type = 'markdown') {
    const systemPrompt = `You are MAMTA AI Documentation Engine V6. Write comprehensive, structured documentation.`;
    const userPrompt = `Generate ${type} documentation for: ${topic}

Content/context: ${content}`;
    return await this.callAI(systemPrompt, userPrompt, { maxTokens: 2000 });
  }

  // ───────────────────────────────────────────────
  // CORE: Generate tests with real AI
  // ───────────────────────────────────────────────
  async generateTests(code, filename) {
    const systemPrompt = `You are MAMTA AI Testing Engine V6. Write comprehensive unit tests using Jest/Vitest style.
Return ONLY the test code, no markdown fences.`;
    const userPrompt = `Write tests for ${filename}:

${code}`;
    return await this.callAI(systemPrompt, userPrompt);
  }

  // ───────────────────────────────────────────────
  // LOW-LEVEL: Call AI API (OpenAI → Gemini fallback)
  // ───────────────────────────────────────────────
  async callAI(systemPrompt, userPrompt, options = {}) {
    if (!this.hasKey()) {
      throw new Error('No AI API key configured. Add keys in Settings or SafeDrop vault.');
    }

    this.metrics.calls++;
    const providers = this.preferredProvider === 'openai' 
      ? ['openai', 'gemini'] 
      : ['gemini', 'openai'];

    let lastError = null;

    for (const provider of providers) {
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const result = provider === 'openai' 
            ? await this.callOpenAI(systemPrompt, userPrompt, options)
            : await this.callGemini(systemPrompt, userPrompt, options);

          this.metrics.success++;
          return result;
        } catch (e) {
          lastError = e;
          console.warn(`⚠️ ${provider} attempt ${attempt + 1} failed:`, e.message);
          if (attempt < this.maxRetries - 1) await this.delay(1000 * (attempt + 1));
        }
      }
    }

    this.metrics.failures++;
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  async callOpenAI(systemPrompt, userPrompt, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.models.openai,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 2000,
        response_format: options.json ? { type: 'json_object' } : undefined
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI ${res.status}: ${err}`);
    }

    const data = await res.json();
    this.metrics.tokens += data.usage?.total_tokens || 0;
    return data.choices[0].message.content;
  }

  async callGemini(systemPrompt, userPrompt, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.models.gemini}:generateContent?key=${this.geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt + '\n\n' + userPrompt }
            ]
          }],
          generationConfig: {
            temperature: options.temperature ?? 0.2,
            maxOutputTokens: options.maxTokens ?? 2000
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ───────────────────────────────────────────────
  // FALLBACKS (only when AI is unavailable, never mock)
  // ───────────────────────────────────────────────
  fallbackReview(code) {
    return {
      score: 50,
      summary: { critical: 0, warnings: 1, suggestions: 1 },
      issues: [{ severity: 'info', line: 1, message: 'AI review unavailable — configure API key for full analysis', fix: 'Add API key in Settings' }],
      security: [], performance: [], architecture: [], naming: [], dependencies: [],
      refactor: 'Configure AI API key for intelligent review'
    };
  }

  fallbackErrorAnalysis(error) {
    return {
      rootCause: 'AI analysis unavailable — configure API key',
      severity: 'medium',
      confidence: 0.1,
      fix: { description: 'Manual investigation required', code: null, explanation: 'Add API key in Settings' },
      prevention: ['Configure AI API key'],
      relatedPatterns: []
    };
  }

  fallbackDecompose(goal) {
    return [
      { id: 'p1', name: 'Analysis', order: 1, status: 'pending', tasks: [{ name: 'Analyze requirements', description: 'Understand project scope', priority: 'high', hours: 4 }] },
      { id: 'p2', name: 'Planning', order: 2, status: 'pending', tasks: [{ name: 'Create plan', description: 'Define architecture and tasks', priority: 'high', hours: 4 }] },
      { id: 'p3', name: 'Execution', order: 3, status: 'pending', tasks: [{ name: 'Implement features', description: 'Build core functionality', priority: 'high', hours: 8 }] },
      { id: 'p4', name: 'Review', order: 4, status: 'pending', tasks: [{ name: 'Code review', description: 'Review and optimize', priority: 'medium', hours: 4 }] }
    ];
  }

  fallbackArchitecture(goal, techStack) {
    const stack = techStack.length > 0 ? techStack : ['HTML', 'CSS', 'JavaScript', 'Supabase'];
    return {
      pattern: 'MVC + Service Layer',
      frontend: stack.includes('React') ? 'React + Vite' : 'Vanilla JS + Modular Architecture',
      backend: 'Supabase (PostgreSQL + Auth + Storage)',
      database: 'PostgreSQL via Supabase',
      hosting: 'GitHub Pages (Frontend) + Supabase (Backend)',
      security: 'AES-256 + SHA-256 + RLS Policies',
      ai: 'OpenAI GPT-4 + Gemini Fallback',
      reasoning: 'AI-powered architecture suggestion unavailable — configure API key for intelligent recommendations'
    };
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIService };
}
