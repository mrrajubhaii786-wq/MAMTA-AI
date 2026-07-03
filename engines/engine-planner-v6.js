/**
 * MAMTA AI V6 — Planner Engine
 * AI-powered planning with Supabase persistence
 * @version 6.0.0
 */
class PlannerEngineV6 extends BaseEngine {
  constructor() {
    super('PlannerEngineV6', '6.0.0');
    this.supabase = null;
    this.aiService = null;
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    this.log('🎯 Planner V6 ready');
    return true;
  }

  enableAI(aiService) {
    this.aiService = aiService;
    this.log('🤖 AI Planning enabled');
  }

  async createPlan(goal, options = {}) {
    this.log(`🎯 Creating plan for: ${goal}`);

    let phases = [];
    let architecture = null;

    // AI-powered decomposition
    if (this.aiService && this.aiService.hasKey()) {
      try {
        phases = await this.aiService.decomposeGoal(goal);
        architecture = await this.aiService.suggestArchitecture(goal, options.techStack);
        this.log('🤖 AI-powered plan created');
      } catch (e) {
        this.error(e);
        this.log('⚠️ AI planning failed, using templates');
      }
    }

    // Fallback templates
    if (phases.length === 0) phases = this.templateDecompose(goal);
    if (!architecture) architecture = this.templateArchitecture(goal, options.techStack);

    const planId = `plan_${Date.now()}`;
    const tasks = this.generateTasks(phases);

    // Save to Supabase
    if (this.supabase) {
      try {
        await this.supabase.insert('plans', {
          id: planId,
          goal,
          description: options.description || '',
          status: 'draft',
          phases,
          milestones: this.generateMilestones(phases),
          sprints: this.generateSprints(phases, options.sprintDuration || 7),
          architecture,
          tech_stack: options.techStack || [],
          priority: options.priority || 'medium',
          deadline: options.deadline,
          metadata: { ai_generated: !!(this.aiService && this.aiService.hasKey()) }
        });

        for (const task of tasks) {
          await this.supabase.insert('tasks', {
            plan_id: planId,
            name: task.name,
            description: task.description,
            status: task.status,
            priority: task.priority,
            estimated_hours: task.estimatedHours,
            assigned_agent: task.assignedTo,
            metadata: { phase_id: task.phaseId, source: 'auto-generated' }
          });
        }

        this.log(`✅ Plan stored in Supabase: ${planId}`);
      } catch (e) {
        this.error(e);
      }
    }

    return {
      id: planId,
      goal,
      phases,
      tasks,
      architecture,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
  }

  templateDecompose(goal) {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('app') || goalLower.includes('website')) {
      return [
        { id: 'p1', name: 'Requirements Analysis', order: 1, status: 'pending', tasks: [] },
        { id: 'p2', name: 'System Architecture', order: 2, status: 'pending', tasks: [] },
        { id: 'p3', name: 'Database Design', order: 3, status: 'pending', tasks: [] },
        { id: 'p4', name: 'Frontend Development', order: 4, status: 'pending', tasks: [] },
        { id: 'p5', name: 'Backend Development', order: 5, status: 'pending', tasks: [] },
        { id: 'p6', name: 'API Integration', order: 6, status: 'pending', tasks: [] },
        { id: 'p7', name: 'Testing & QA', order: 7, status: 'pending', tasks: [] },
        { id: 'p8', name: 'Documentation', order: 8, status: 'pending', tasks: [] },
        { id: 'p9', name: 'Deployment', order: 9, status: 'pending', tasks: [] }
      ];
    }
    return [
      { id: 'p1', name: 'Analysis', order: 1, status: 'pending', tasks: [] },
      { id: 'p2', name: 'Planning', order: 2, status: 'pending', tasks: [] },
      { id: 'p3', name: 'Execution', order: 3, status: 'pending', tasks: [] },
      { id: 'p4', name: 'Review', order: 4, status: 'pending', tasks: [] }
    ];
  }

  templateArchitecture(goal, techStack = []) {
    const stack = techStack.length > 0 ? techStack : ['HTML', 'CSS', 'JavaScript', 'Supabase'];
    return {
      pattern: 'MVC + Service Layer',
      frontend: stack.includes('React') ? 'React + Vite' : 'Vanilla JS + Modular Architecture',
      backend: 'Supabase (PostgreSQL + Auth + Storage)',
      database: 'PostgreSQL via Supabase',
      hosting: 'GitHub Pages + Supabase',
      security: 'AES-256 + SHA-256 + RLS Policies',
      ai: 'OpenAI GPT-4 + Gemini Fallback'
    };
  }

  generateMilestones(phases) {
    return phases.map((phase, idx) => ({
      id: `ms_${phase.id}`,
      name: `${phase.name} Complete`,
      phaseId: phase.id,
      order: idx + 1,
      status: 'pending',
      criteria: [`All ${phase.name} tasks completed`, 'Code reviewed', 'Tests passing']
    }));
  }

  generateSprints(phases, durationDays = 7) {
    return phases.map((phase, idx) => ({
      id: `sp_${phase.id}`,
      name: `Sprint ${idx + 1}: ${phase.name}`,
      phaseId: phase.id,
      duration: durationDays,
      status: 'planned',
      goal: `Complete ${phase.name}`
    }));
  }

  generateTasks(phases) {
    const tasks = [];
    phases.forEach(phase => {
      const defaults = this.getDefaultTasks(phase.name);
      defaults.forEach((t, idx) => {
        tasks.push({
          id: `task_${phase.id}_${idx}`,
          name: t.name,
          description: t.description,
          phaseId: phase.id,
          status: 'backlog',
          priority: t.priority || 'medium',
          estimatedHours: t.hours || 4,
          assignedTo: null,
          createdAt: new Date().toISOString()
        });
      });
    });
    return tasks;
  }

  getDefaultTasks(phaseName) {
    const defaults = {
      'Requirements Analysis': [
        { name: 'Gather requirements', description: 'Collect all functional and non-functional requirements', priority: 'high', hours: 4 },
        { name: 'User stories', description: 'Write user stories and acceptance criteria', priority: 'high', hours: 3 }
      ],
      'System Architecture': [
        { name: 'Design architecture', description: 'Create system architecture diagram', priority: 'high', hours: 6 },
        { name: 'Tech stack selection', description: 'Choose frameworks and libraries', priority: 'high', hours: 2 }
      ],
      'Frontend Development': [
        { name: 'UI components', description: 'Build reusable UI components', priority: 'high', hours: 8 },
        { name: 'Page layouts', description: 'Create page layouts', priority: 'high', hours: 6 }
      ],
      'Backend Development': [
        { name: 'API endpoints', description: 'Create REST API endpoints', priority: 'high', hours: 8 },
        { name: 'Authentication', description: 'Implement auth system', priority: 'high', hours: 6 }
      ]
    };
    return defaults[phaseName] || [{ name: `${phaseName} task`, description: 'Complete phase work', priority: 'medium', hours: 4 }];
  }

  async getPlan(id) {
    if (!this.supabase) return null;
    try {
      const plans = await this.supabase.select('plans', { filters: { id }, limit: 1 });
      if (plans.length === 0) return null;

      const plan = plans[0];
      const tasks = await this.supabase.select('tasks', { filters: { plan_id: id }, limit: 100 });

      return { ...plan, tasks };
    } catch (e) {
      this.error(e);
      return null;
    }
  }

  async getAllPlans() {
    if (!this.supabase) return [];
    try {
      return await this.supabase.select('plans', { limit: 100, order: 'created_at.desc' });
    } catch (e) {
      this.error(e);
      return [];
    }
  }

  async updateTaskStatus(planId, taskId, status) {
    if (!this.supabase) return null;
    try {
      await this.supabase.update('tasks', {
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, { id: taskId });

      this.log(`✅ Task ${taskId} → ${status}`);
      return { id: taskId, status };
    } catch (e) {
      this.error(e);
      return null;
    }
  }

  async process(task, context) {
    if (task.action === 'createPlan') {
      return await this.createPlan(task.goal, task.options);
    }
    if (task.action === 'getPlan') {
      return await this.getPlan(task.planId);
    }
    if (task.action === 'getAllPlans') {
      return await this.getAllPlans();
    }
    if (task.action === 'updateTask') {
      return await this.updateTaskStatus(task.planId, task.taskId, task.status);
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlannerEngineV6 };
}
