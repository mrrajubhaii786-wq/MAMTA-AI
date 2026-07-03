/**
 * MAMTA AI V5 - Planner Service
 * API layer for Planner Engine
 * @version 5.0.0
 */
class PlannerService {
  constructor(engine) {
    this.engine = engine;
    this.name = 'PlannerService';
  }

  async init() {
    if (!this.engine) throw new Error('PlannerEngine not provided');
    console.log('[PlannerService] Initialized');
    return true;
  }

  async createPlan(goal, options = {}) {
    return await this.engine.execute({
      action: 'createPlan',
      goal,
      options
    });
  }

  async getPlan(planId) {
    return await this.engine.execute({
      action: 'getPlan',
      planId
    });
  }

  async getAllPlans() {
    return await this.engine.execute({ action: 'getAllPlans' });
  }

  async updateTask(planId, taskId, status) {
    return await this.engine.execute({
      action: 'updateTask',
      planId,
      taskId,
      status
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlannerService };
}
