/**
 * MAMTA AI V5 - Planner Engine
 * Goal decomposition, milestone creation, sprint planning, roadmap generation
 * @version 5.0.0
 */
class PlannerEngine extends BaseEngine {
  constructor() {
    super('PlannerEngine', '5.0.0');
    this.plans = [];
    this.storageKey = 'mamta_v5_plans';
  }

  async init() {
    await super.init();
    this.loadPlans();
    return true;
  }

  loadPlans() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) this.plans = JSON.parse(stored);
    } catch (e) { this.error(e); }
  }

  savePlans() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.plans));
    } catch (e) { this.error(e); }
  }

  // Main: Create plan from goal
  createPlan(goal, options = {}) {
    this.log(`🎯 Creating plan for: ${goal}`);

    const plan = {
      id: `plan_${Date.now()}`,
      goal,
      description: options.description || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phases: [],
      milestones: [],
      sprints: [],
      tasks: [],
      backlog: [],
      architecture: null,
      techStack: options.techStack || [],
      priority: options.priority || 'medium',
      deadline: options.deadline || null
    };

    // Auto-decompose goal
    plan.phases = this.decomposeGoal(goal);
    plan.milestones = this.generateMilestones(plan.phases);
    plan.sprints = this.generateSprints(plan.phases, options.sprintDuration || 7);
    plan.tasks = this.generateTasks(plan.phases);
    plan.backlog = [...plan.tasks];
    plan.architecture = this.suggestArchitecture(goal, options.techStack);

    this.plans.push(plan);
    this.savePlans();
    this.log(`✅ Plan created: ${plan.id} with ${plan.tasks.length} tasks`);
    return plan;
  }

  decomposeGoal(goal) {
    const goalLower = goal.toLowerCase();
    const phases = [];

    // Smart phase detection based on goal keywords
    if (goalLower.includes('app') || goalLower.includes('website') || goalLower.includes('platform')) {
      phases.push(
        { id: 'p1', name: 'Requirements Analysis', order: 1, status: 'pending', tasks: [] },
        { id: 'p2', name: 'System Architecture', order: 2, status: 'pending', tasks: [] },
        { id: 'p3', name: 'Database Design', order: 3, status: 'pending', tasks: [] },
        { id: 'p4', name: 'Frontend Development', order: 4, status: 'pending', tasks: [] },
        { id: 'p5', name: 'Backend Development', order: 5, status: 'pending', tasks: [] },
        { id: 'p6', name: 'API Integration', order: 6, status: 'pending', tasks: [] },
        { id: 'p7', name: 'Testing & QA', order: 7, status: 'pending', tasks: [] },
        { id: 'p8', name: 'Documentation', order: 8, status: 'pending', tasks: [] },
        { id: 'p9', name: 'Deployment', order: 9, status: 'pending', tasks: [] }
      );
    } else if (goalLower.includes('fix') || goalLower.includes('repair') || goalLower.includes('bug')) {
      phases.push(
        { id: 'p1', name: 'Error Detection', order: 1, status: 'pending', tasks: [] },
        { id: 'p2', name: 'Root Cause Analysis', order: 2, status: 'pending', tasks: [] },
        { id: 'p3', name: 'Solution Design', order: 3, status: 'pending', tasks: [] },
        { id: 'p4', name: 'Implementation', order: 4, status: 'pending', tasks: [] },
        { id: 'p5', name: 'Verification', order: 5, status: 'pending', tasks: [] }
      );
    } else {
      phases.push(
        { id: 'p1', name: 'Analysis', order: 1, status: 'pending', tasks: [] },
        { id: 'p2', name: 'Planning', order: 2, status: 'pending', tasks: [] },
        { id: 'p3', name: 'Execution', order: 3, status: 'pending', tasks: [] },
        { id: 'p4', name: 'Review', order: 4, status: 'pending', tasks: [] }
      );
    }

    return phases;
  }

  generateMilestones(phases) {
    return phases.map((phase, idx) => ({
      id: `ms_${phase.id}`,
      name: `${phase.name} Complete`,
      phaseId: phase.id,
      order: idx + 1,
      status: 'pending',
      criteria: [`All ${phase.name} tasks completed`, 'Code reviewed', 'Tests passing'],
      deadline: null
    }));
  }

  generateSprints(phases, durationDays = 7) {
    const sprints = [];
    phases.forEach((phase, idx) => {
      const sprint = {
        id: `sp_${phase.id}`,
        name: `Sprint ${idx + 1}: ${phase.name}`,
        phaseId: phase.id,
        duration: durationDays,
        status: 'planned',
        startDate: null,
        endDate: null,
        tasks: [],
        goal: `Complete ${phase.name}`
      };
      sprints.push(sprint);
    });
    return sprints;
  }

  generateTasks(phases) {
    const tasks = [];
    phases.forEach(phase => {
      const phaseTasks = this.getDefaultTasksForPhase(phase.name);
      phaseTasks.forEach((t, idx) => {
        tasks.push({
          id: `task_${phase.id}_${idx}`,
          name: t.name,
          description: t.description,
          phaseId: phase.id,
          status: 'backlog',
          priority: t.priority || 'medium',
          estimatedHours: t.hours || 4,
          assignedTo: null,
          createdAt: new Date().toISOString(),
          completedAt: null
        });
      });
    });
    return tasks;
  }

  getDefaultTasksForPhase(phaseName) {
    const defaults = {
      'Requirements Analysis': [
        { name: 'Gather requirements', description: 'Collect all functional and non-functional requirements', priority: 'high', hours: 4 },
        { name: 'User stories', description: 'Write user stories and acceptance criteria', priority: 'high', hours: 3 },
        { name: 'Feasibility check', description: 'Check technical feasibility', priority: 'medium', hours: 2 }
      ],
      'System Architecture': [
        { name: 'Design architecture', description: 'Create system architecture diagram', priority: 'high', hours: 6 },
        { name: 'Tech stack selection', description: 'Choose frameworks and libraries', priority: 'high', hours: 2 },
        { name: 'Security design', description: 'Plan security measures', priority: 'high', hours: 3 }
      ],
      'Database Design': [
        { name: 'Schema design', description: 'Design database schema', priority: 'high', hours: 4 },
        { name: 'Migration plan', description: 'Create migration strategy', priority: 'medium', hours: 2 },
        { name: 'Indexing strategy', description: 'Plan indexes for performance', priority: 'medium', hours: 2 }
      ],
      'Frontend Development': [
        { name: 'UI components', description: 'Build reusable UI components', priority: 'high', hours: 8 },
        { name: 'Page layouts', description: 'Create page layouts', priority: 'high', hours: 6 },
        { name: 'Responsive design', description: 'Make it mobile-friendly', priority: 'high', hours: 4 },
        { name: 'Accessibility', description: 'Add ARIA labels and keyboard nav', priority: 'medium', hours: 3 }
      ],
      'Backend Development': [
        { name: 'API endpoints', description: 'Create REST API endpoints', priority: 'high', hours: 8 },
        { name: 'Authentication', description: 'Implement auth system', priority: 'high', hours: 6 },
        { name: 'Business logic', description: 'Implement core business logic', priority: 'high', hours: 8 }
      ],
      'API Integration': [
        { name: 'Frontend-Backend connect', description: 'Connect frontend to backend APIs', priority: 'high', hours: 4 },
        { name: 'Third-party APIs', description: 'Integrate external services', priority: 'medium', hours: 4 },
        { name: 'Error handling', description: 'Add API error handling', priority: 'high', hours: 3 }
      ],
      'Testing & QA': [
        { name: 'Unit tests', description: 'Write unit tests', priority: 'high', hours: 6 },
        { name: 'Integration tests', description: 'Test API integrations', priority: 'high', hours: 4 },
        { name: 'E2E tests', description: 'End-to-end testing', priority: 'medium', hours: 4 },
        { name: 'Performance tests', description: 'Load and stress testing', priority: 'medium', hours: 3 }
      ],
      'Documentation': [
        { name: 'API docs', description: 'Document all APIs', priority: 'medium', hours: 3 },
        { name: 'User guide', description: 'Write user documentation', priority: 'medium', hours: 4 },
        { name: 'Developer docs', description: 'Write technical documentation', priority: 'medium', hours: 3 }
      ],
      'Deployment': [
        { name: 'CI/CD pipeline', description: 'Setup build and deploy pipeline', priority: 'high', hours: 4 },
        { name: 'Environment config', description: 'Configure production environment', priority: 'high', hours: 3 },
        { name: 'Monitoring', description: 'Setup logging and monitoring', priority: 'medium', hours: 3 }
      ]
    };
    return defaults[phaseName] || [{ name: `${phaseName} task`, description: 'Complete phase work', priority: 'medium', hours: 4 }];
  }

  suggestArchitecture(goal, techStack = []) {
    const stack = techStack.length > 0 ? techStack : ['HTML', 'CSS', 'JavaScript', 'Supabase'];
    return {
      pattern: 'MVC + Service Layer',
      frontend: stack.includes('React') ? 'React + Vite' : 'Vanilla JS + Modular Architecture',
      backend: 'Supabase (PostgreSQL + Auth + Storage)',
      database: 'PostgreSQL via Supabase',
      hosting: 'GitHub Pages (Frontend) + Supabase (Backend)',
      security: 'AES-256 + SHA-256 + RLS Policies',
      ai: 'OpenAI GPT-4 + Gemini Fallback'
    };
  }

  getPlan(id) {
    return this.plans.find(p => p.id === id);
  }

  getAllPlans() {
    return this.plans;
  }

  updateTaskStatus(planId, taskId, status) {
    const plan = this.getPlan(planId);
    if (!plan) return null;
    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.status = status;
    if (status === 'completed') task.completedAt = new Date().toISOString();
    plan.updatedAt = new Date().toISOString();
    this.savePlans();
    return task;
  }

  async process(task, context) {
    if (task.action === 'createPlan') {
      return this.createPlan(task.goal, task.options);
    }
    if (task.action === 'getPlan') {
      return this.getPlan(task.planId);
    }
    if (task.action === 'getAllPlans') {
      return this.getAllPlans();
    }
    if (task.action === 'updateTask') {
      return this.updateTaskStatus(task.planId, task.taskId, task.status);
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlannerEngine };
}
