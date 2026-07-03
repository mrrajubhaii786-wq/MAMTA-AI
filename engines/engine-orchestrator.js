/**
 * MAMTA AI V5 - Orchestrator Engine
 * Coordinates all engines, manages autonomous loop, handles multi-agent tasks
 * @version 5.0.0
 */
class OrchestratorEngine extends BaseEngine {
  constructor() {
    super('OrchestratorEngine', '5.0.0');
    this.engines = new Map();
    this.taskQueue = [];
    this.running = false;
    this.autonomousLoopInterval = null;
  }

  async init() {
    await super.init();
    this.log(`🎛️ Orchestrator initialized`);
    return true;
  }

  registerEngine(name, engineInstance) {
    this.engines.set(name, engineInstance);
    this.log(`🔌 Engine registered: ${name}`);
    return true;
  }

  getEngine(name) {
    return this.engines.get(name);
  }

  getAllEngines() {
    const status = {};
    this.engines.forEach((engine, name) => {
      status[name] = engine.getStatus();
    });
    return status;
  }

  // Main autonomous loop
  startAutonomousLoop(intervalMs = 60000) {
    if (this.autonomousLoopInterval) {
      this.log('⚠️ Autonomous loop already running');
      return false;
    }

    this.running = true;
    this.log('🔄 Autonomous loop started');

    this.autonomousLoopInterval = setInterval(async () => {
      await this.runAutonomousCycle();
    }, intervalMs);

    // Run first cycle immediately
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
    this.log('🔄 Running autonomous cycle...');

    const cycle = {
      id: `cycle_${Date.now()}`,
      timestamp: new Date().toISOString(),
      steps: []
    };

    try {
      // Step 1: Observe (Monitor)
      const monitor = this.getEngine('monitor');
      if (monitor) {
        const health = await monitor.execute({ action: 'health' });
        cycle.steps.push({ step: 'observe', status: 'completed', result: health });
      }

      // Step 2: Understand (Memory + Learning)
      const memory = this.getEngine('memory');
      const learning = this.getEngine('learning');
      if (memory && learning) {
        const stats = await memory.execute({ action: 'stats' });
        const metrics = await learning.execute({ action: 'metrics' });
        cycle.steps.push({ step: 'understand', status: 'completed', result: { stats, metrics } });
      }

      // Step 3: Plan (Planner)
      const planner = this.getEngine('planner');
      if (planner && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        const plan = await planner.execute({ action: 'createPlan', goal: task.goal, options: task.options });
        cycle.steps.push({ step: 'plan', status: 'completed', result: plan });
      }

      // Step 4: Build (Builder)
      // Only if there's an active plan requiring build

      // Step 5: Review (Reviewer)
      // Review any generated code

      // Step 6: Repair (Repair)
      const repair = this.getEngine('repair');
      if (repair) {
        // Check for any errors to heal
        cycle.steps.push({ step: 'repair', status: 'completed' });
      }

      // Step 7: Learn (Learning)
      if (learning) {
        cycle.steps.push({ step: 'learn', status: 'completed' });
      }

      // Step 8: Evolve (Evolution)
      const evolution = this.getEngine('evolution');
      if (evolution) {
        const analysis = await evolution.execute({ action: 'analyze' });
        cycle.steps.push({ step: 'evolve', status: 'completed', result: analysis });
      }

      cycle.status = 'completed';
      this.log('✅ Autonomous cycle complete');

    } catch (error) {
      cycle.status = 'error';
      cycle.error = error.message;
      this.error(error);
    }

    return cycle;
  }

  // Queue a task for autonomous processing
  queueTask(goal, options = {}) {
    const task = {
      id: `task_${Date.now()}`,
      goal,
      options,
      queuedAt: new Date().toISOString(),
      status: 'queued'
    };
    this.taskQueue.push(task);
    this.log(`📋 Task queued: ${goal.substring(0, 50)}...`);
    return task;
  }

  // Direct command to specific engine
  async command(engineName, task, context = {}) {
    const engine = this.getEngine(engineName);
    if (!engine) {
      return { success: false, error: `Engine ${engineName} not found` };
    }
    return await engine.execute(task, context);
  }

  // Multi-agent collaboration
  async collaborate(agents, task) {
    this.log(`🤝 Multi-agent collaboration: ${agents.join(', ')}`);

    const results = {};
    for (const agentName of agents) {
      const engine = this.getEngine(agentName);
      if (engine) {
        try {
          results[agentName] = await engine.execute(task);
        } catch (e) {
          results[agentName] = { success: false, error: e.message };
        }
      }
    }

    return {
      task,
      agents,
      results,
      consensus: this.deriveConsensus(results),
      timestamp: new Date().toISOString()
    };
  }

  deriveConsensus(results) {
    const successes = Object.values(results).filter(r => r.success).length;
    const total = Object.keys(results).length;
    return {
      agreement: total > 0 ? successes / total : 0,
      recommendation: successes > total / 2 ? 'proceed' : 'review'
    };
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
    if (task.action === 'startLoop') {
      return { success: this.startAutonomousLoop(task.interval) };
    }
    if (task.action === 'stopLoop') {
      return { success: this.stopAutonomousLoop() };
    }
    if (task.action === 'queue') {
      return this.queueTask(task.goal, task.options);
    }
    if (task.action === 'command') {
      return this.command(task.engine, task.task, context);
    }
    if (task.action === 'collaborate') {
      return this.collaborate(task.agents, task.task);
    }
    if (task.action === 'status') {
      return this.getSystemStatus();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrchestratorEngine };
}
