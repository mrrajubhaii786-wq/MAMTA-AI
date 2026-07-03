/**
 * MAMTA AI V6 — Orchestrator Engine
 * Coordinates ALL engines with Supabase + Realtime
 * @version 6.0.0
 */
class OrchestratorEngineV6 extends BaseEngine {
  constructor() {
    super('OrchestratorEngineV6', '6.0.0');
    this.engines = new Map();
    this.taskQueue = [];
    this.running = false;
    this.autonomousLoopInterval = null;
    this.supabase = null;
    this.analytics = null;
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    this.log('🎛️ Orchestrator V6 initialized');
    return true;
  }

  registerEngine(name, engineInstance) {
    this.engines.set(name, engineInstance);
    this.log(`🔌 Engine registered: ${name}`);
    return true;
  }

  getEngine(name) { return this.engines.get(name); }

  getAllEngines() {
    const status = {};
    this.engines.forEach((engine, name) => { status[name] = engine.getStatus(); });
    return status;
  }

  startAutonomousLoop(intervalMs = 60000) {
    if (this.autonomousLoopInterval) {
      this.log('⚠️ Loop already running');
      return false;
    }
    this.running = true;
    this.log('🔄 Autonomous V6 loop started');

    this.autonomousLoopInterval = setInterval(async () => {
      await this.runAutonomousCycle();
    }, intervalMs);

    this.runAutonomousCycle();
    return true;
  }

  stopAutonomousLoop() {
    if (this.autonomousLoopInterval) {
      clearInterval(this.autonomousLoopInterval);
      this.autonomousLoopInterval = null;
      this.running = false;
      this.log('⏹️ Autonomous loop stopped');
    }
  }

  async runAutonomousCycle() {
    const cycleId = `cycle_${Date.now()}`;
    this.log(`🔄 Cycle ${cycleId}...`);

    const cycle = { id: cycleId, timestamp: new Date().toISOString(), steps: [], status: 'running' };
    const startTime = Date.now();

    try {
      // Step 1: Observe
      const monitor = this.getEngine('monitor');
      if (monitor) {
        const health = await monitor.execute({ action: 'health' });
        cycle.steps.push({ step: 'observe', status: 'completed', result: health });
        await this.logAgent('monitor', 'observe', cycleId, null, health, 'completed');
      }

      // Step 2: Understand (Context + Memory)
      const context = this.getEngine('context');
      const memory = this.getEngine('memory');
      if (memory) {
        const stats = await memory.execute({ action: 'stats' });
        cycle.steps.push({ step: 'understand', status: 'completed', result: stats });
        await this.logAgent('memory', 'understand', cycleId, null, stats, 'completed');
      }

      // Step 3: Plan
      const planner = this.getEngine('planner');
      if (planner && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        const plan = await planner.execute({ action: 'createPlan', goal: task.goal, options: task.options });
        cycle.steps.push({ step: 'plan', status: 'completed', result: plan });
        await this.logAgent('planner', 'plan', cycleId, task, plan, 'completed');
      }

      // Step 4: Build
      const builder = this.getEngine('builder');
      if (builder && this.taskQueue.length > 0) {
        const task = this.taskQueue[0];
        if (task.type === 'build') {
          const build = await builder.execute({ action: 'generateProject', name: task.name, type: task.projectType, description: task.description });
          cycle.steps.push({ step: 'build', status: 'completed', result: build });
          await this.logAgent('builder', 'build', cycleId, task, build, 'completed');
        }
      }

      // Step 5: Review
      const reviewer = this.getEngine('reviewer');
      if (reviewer) {
        const review = await reviewer.execute({ action: 'reviewCode', code: '// latest code', filename: 'latest.js' });
        cycle.steps.push({ step: 'review', status: 'completed', result: review });
        await this.logAgent('reviewer', 'review', cycleId, null, review, 'completed');
      }

      // Step 6: Repair
      const repair = this.getEngine('repair');
      if (repair && memory) {
        const errors = await memory.execute({ action: 'retrieve', query: 'error', type: 'errors', limit: 3 });
        for (const err of (errors || [])) {
          const healResult = await repair.execute({ action: 'heal', error: new Error(err.error || 'Unknown') });
          await this.logAgent('repair', 'heal', cycleId, err, healResult, healResult.status === 'healed' ? 'completed' : 'failed');
        }
        cycle.steps.push({ step: 'repair', status: 'completed' });
      }

      // Step 7: Learn
      const learning = this.getEngine('learning');
      if (learning) {
        const metrics = await learning.execute({ action: 'metrics' });
        cycle.steps.push({ step: 'learn', status: 'completed', result: metrics });
        await this.logAgent('learning', 'learn', cycleId, null, metrics, 'completed');
      }

      // Step 8: Evolve
      const evolution = this.getEngine('evolution');
      if (evolution) {
        const analysis = await evolution.execute({ action: 'analyze' });
        cycle.steps.push({ step: 'evolve', status: 'completed', result: analysis });
        await this.logAgent('evolution', 'evolve', cycleId, null, analysis, 'completed');
      }

      cycle.status = 'completed';
      this.log('✅ Cycle complete');

    } catch (error) {
      cycle.status = 'error';
      cycle.error = error.message;
      this.error(error);
      await this.logAgent('orchestrator', 'cycle', cycleId, null, { error: error.message }, 'failed');
    }

    // Track analytics
    if (this.analytics) {
      this.analytics.trackEngine('orchestrator', Date.now() - startTime, cycle.status === 'completed');
    }

    // Save reasoning chain
    if (this.supabase) {
      try {
        await this.supabase.insert('reasoning_chain', {
          task_id: cycleId,
          chain: cycle.steps,
          conclusion: cycle.status === 'completed' ? 'Success' : `Failed: ${cycle.error}`,
          confidence: cycle.status === 'completed' ? 0.95 : 0.3,
          metadata: { queue: this.taskQueue.length, engines: this.engines.size }
        });
      } catch (e) { this.error(e); }
    }

    return cycle;
  }

  async logAgent(agentName, action, taskId, input, output, status) {
    if (!this.supabase) return;
    try {
      await this.supabase.insert('agent_logs', {
        agent_name: agentName,
        agent_role: agentName,
        action,
        task_id: taskId,
        input: input ? { data: input } : null,
        output: output ? { data: output } : null,
        status,
        duration_ms: 0,
        metadata: { cycle_id: taskId }
      });
    } catch (e) { console.error('Agent log failed:', e); }
  }

  queueTask(goal, options = {}, type = 'general') {
    const task = { id: `task_${Date.now()}`, goal, type, options, queuedAt: new Date().toISOString(), status: 'queued' };
    this.taskQueue.push(task);
    this.log(`📋 Queued: ${goal.substring(0, 50)}...`);

    if (this.supabase) {
      this.supabase.insert('tasks', {
        name: goal.substring(0, 100),
        description: goal,
        status: 'backlog',
        priority: options.priority || 'medium',
        metadata: { type, queued_at: task.queuedAt }
      }).catch(e => console.error(e));
    }

    return task;
  }

  async command(engineName, task, context = {}) {
    const engine = this.getEngine(engineName);
    if (!engine) return { success: false, error: `Engine ${engineName} not found` };
    const start = Date.now();
    const result = await engine.execute(task, context);
    if (this.analytics) this.analytics.trackEngine(engineName, Date.now() - start, result.success !== false);
    await this.logAgent(engineName, task.action || 'command', null, task, result, result.success !== false ? 'completed' : 'failed');
    return result;
  }

  getSystemStatus() {
    return {
      orchestrator: this.getStatus(),
      engines: this.getAllEngines(),
      queueLength: this.taskQueue.length,
      autonomousRunning: this.running,
      timestamp: new Date().toISOString()
    };
  }

  async process(task, context) {
    if (task.action === 'startLoop') return { success: this.startAutonomousLoop(task.interval) };
    if (task.action === 'stopLoop') return { success: this.stopAutonomousLoop() };
    if (task.action === 'queue') return this.queueTask(task.goal, task.options, task.type);
    if (task.action === 'command') return await this.command(task.engine, task.task, context);
    if (task.action === 'status') return this.getSystemStatus();
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrchestratorEngineV6 };
}
