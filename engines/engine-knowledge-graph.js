/**
 * MAMTA AI V6 — Knowledge Graph Engine
 * Manages project dependencies, file relations, module graph
 * @version 6.0.0
 */
class KnowledgeGraphEngine extends BaseEngine {
  constructor() {
    super('KnowledgeGraphEngine', '6.0.0');
    this.graph = new Map();
    this.supabase = null;
    this.aiService = null;
  }

  async init() {
    await super.init();
    if (typeof SupabaseService !== 'undefined') {
      this.supabase = new SupabaseService();
      await this.supabase.init();
    }
    await this.loadGraph();
    this.log('🕸️ Knowledge Graph Engine ready');
    return true;
  }

  enableAI(aiService) {
    this.aiService = aiService;
    this.log('🤖 AI Knowledge Graph analysis enabled');
  }

  async loadGraph() {
    if (!this.supabase) return;
    try {
      const data = await this.supabase.select('project_graph', { limit: 500 });
      data.forEach(node => {
        this.graph.set(node.node_name, {
          id: node.id,
          type: node.node_type,
          path: node.node_path,
          dependencies: node.dependencies || [],
          dependents: node.dependents || [],
          metadata: node.metadata || {}
        });
      });
      this.log(`📚 Loaded ${data.length} graph nodes from Supabase`);
    } catch (e) {
      this.error(e);
    }
  }

  // Add node to graph
  async addNode(projectId, nodeType, nodeName, nodePath, dependencies = []) {
    const node = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      projectId,
      type: nodeType,
      name: nodeName,
      path: nodePath,
      dependencies,
      dependents: [],
      createdAt: new Date().toISOString()
    };

    // Update dependents on existing nodes
    for (const dep of dependencies) {
      if (this.graph.has(dep)) {
        const depNode = this.graph.get(dep);
        if (!depNode.dependents.includes(nodeName)) {
          depNode.dependents.push(nodeName);
        }
      }
    }

    this.graph.set(nodeName, node);

    if (this.supabase) {
      try {
        await this.supabase.insert('project_graph', {
          project_id: projectId,
          node_type: nodeType,
          node_name: nodeName,
          node_path: nodePath,
          dependencies,
          dependents: [],
          metadata: { added_by: 'KnowledgeGraphEngine' }
        });
      } catch (e) {
        this.error(e);
      }
    }

    this.log(`🕸️ Added ${nodeType}: ${nodeName}`);
    return node;
  }

  // Analyze code and build graph
  async analyzeProject(files, projectId) {
    this.log(`🔍 Analyzing ${files.length} files...`);

    for (const file of files) {
      const type = this.detectNodeType(file.path);
      const deps = this.extractDependencies(file.content || '', type);

      await this.addNode(projectId, type, file.path, file.path, deps);
    }

    // AI-powered analysis
    if (this.aiService && this.aiService.hasKey()) {
      try {
        const structure = Array.from(this.graph.values()).map(n => ({
          name: n.name,
          type: n.type,
          dependencies: n.dependencies
        }));

        const systemPrompt = `You are MAMTA AI Knowledge Graph V6. Analyze project structure.
Return JSON only: { "issues": ["..."], "suggestions": ["..."], "architecture": "..." }`;
        const result = await this.aiService.callAI(systemPrompt, JSON.stringify(structure), { json: true });

        return {
          nodes: Array.from(this.graph.values()),
          aiAnalysis: typeof result === 'string' ? JSON.parse(result) : result
        };
      } catch (e) {
        this.error(e);
      }
    }

    return { nodes: Array.from(this.graph.values()) };
  }

  detectNodeType(path) {
    if (path.endsWith('.html')) return 'file';
    if (path.endsWith('.css')) return 'file';
    if (path.endsWith('.js') && path.includes('component')) return 'component';
    if (path.endsWith('.js')) return 'module';
    if (path.endsWith('.sql')) return 'database';
    if (path.includes('api') || path.includes('route')) return 'api';
    if (path.includes('service')) return 'service';
    return 'file';
  }

  extractDependencies(content, type) {
    if (type === 'module' || type === 'component') {
      const imports = [];
      const regex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      return imports;
    }
    return [];
  }

  // Get dependency tree
  getDependencyTree(nodeName, depth = 3) {
    const visited = new Set();
    const buildTree = (name, currentDepth) => {
      if (currentDepth <= 0 || visited.has(name)) return null;
      visited.add(name);

      const node = this.graph.get(name);
      if (!node) return null;

      return {
        name: node.name,
        type: node.type,
        children: (node.dependencies || []).map(dep => buildTree(dep, currentDepth - 1)).filter(Boolean)
      };
    };

    return buildTree(nodeName, depth);
  }

  // Find circular dependencies
  findCircularDependencies() {
    const cycles = [];
    const visited = new Set();
    const stack = new Set();

    const dfs = (node, path) => {
      if (stack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat([node]));
        return;
      }
      if (visited.has(node)) return;

      visited.add(node);
      stack.add(node);
      path.push(node);

      const graphNode = this.graph.get(node);
      if (graphNode) {
        for (const dep of graphNode.dependencies || []) {
          dfs(dep, [...path]);
        }
      }

      stack.delete(node);
    };

    for (const [name] of this.graph) {
      if (!visited.has(name)) dfs(name, []);
    }

    return cycles;
  }

  getStats() {
    return {
      totalNodes: this.graph.size,
      byType: Array.from(this.graph.values()).reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      circularDeps: this.findCircularDependencies().length,
      aiEnabled: !!(this.aiService && this.aiService.hasKey())
    };
  }

  async process(task, context) {
    if (task.action === 'addNode') {
      return await this.addNode(task.projectId, task.nodeType, task.nodeName, task.nodePath, task.dependencies);
    }
    if (task.action === 'analyzeProject') {
      return await this.analyzeProject(task.files, task.projectId);
    }
    if (task.action === 'getTree') {
      return this.getDependencyTree(task.nodeName, task.depth);
    }
    if (task.action === 'findCycles') {
      return this.findCircularDependencies();
    }
    if (task.action === 'stats') {
      return this.getStats();
    }
    return { status: 'unknown_action' };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KnowledgeGraphEngine };
}
