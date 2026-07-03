-- ============================================
-- MAMTA AI V5 Database Schema
-- 12 New Tables for Autonomous AI OS
-- ============================================

-- 1. memory: Long-term AI memory
CREATE TABLE IF NOT EXISTS memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('conversation', 'project', 'decision', 'error', 'solution', 'pattern', 'knowledge')),
  content JSONB NOT NULL,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. knowledge: Knowledge base
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  source TEXT DEFAULT 'ai',
  confidence FLOAT DEFAULT 0.9,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. tasks: Task tracking
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_agent TEXT,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. plans: Project plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  phases JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  sprints JSONB DEFAULT '[]',
  architecture JSONB,
  tech_stack TEXT[],
  priority TEXT DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. errors: Error tracking
CREATE TABLE IF NOT EXISTS errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  solution TEXT,
  solution_applied BOOLEAN DEFAULT FALSE,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 6. solutions: Solution database
CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_pattern TEXT NOT NULL,
  solution TEXT NOT NULL,
  fix_type TEXT,
  confidence FLOAT DEFAULT 0.8,
  usage_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. versions: Code versions
CREATE TABLE IF NOT EXISTS versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  changes TEXT[],
  files JSONB,
  size_bytes INTEGER,
  build_status TEXT DEFAULT 'pending' CHECK (build_status IN ('pending', 'building', 'success', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  built_at TIMESTAMPTZ
);

-- 8. deployments: Deployment history
CREATE TABLE IF NOT EXISTS deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID,
  version TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('development', 'staging', 'production')),
  status TEXT DEFAULT 'deploying' CHECK (status IN ('pending', 'deploying', 'success', 'failed', 'rolled_back')),
  url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 9. agent_logs: Agent activity
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  action TEXT NOT NULL,
  task_id UUID,
  input JSONB,
  output JSONB,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. learning_history: Learning records
CREATE TABLE IF NOT EXISTS learning_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('success', 'failure', 'pattern', 'feedback')),
  input TEXT,
  output TEXT,
  context TEXT,
  outcome TEXT,
  lesson TEXT,
  confidence FLOAT DEFAULT 0.5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. project_graph: Dependency graph
CREATE TABLE IF NOT EXISTS project_graph (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  node_type TEXT NOT NULL CHECK (node_type IN ('file', 'module', 'component', 'service', 'database', 'api')),
  node_name TEXT NOT NULL,
  node_path TEXT,
  dependencies TEXT[],
  dependents TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. reasoning_chain: AI reasoning
CREATE TABLE IF NOT EXISTS reasoning_chain (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  chain JSONB NOT NULL,
  conclusion TEXT,
  confidence FLOAT DEFAULT 0.8,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memory_type ON memory(type);
CREATE INDEX IF NOT EXISTS idx_memory_session ON memory(session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_topic ON knowledge(topic);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_errors_type ON errors(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON errors(severity);
CREATE INDEX IF NOT EXISTS idx_versions_version ON versions(version);
CREATE INDEX IF NOT EXISTS idx_deployments_target ON deployments(target);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent_name);
CREATE INDEX IF NOT EXISTS idx_learning_type ON learning_history(type);

-- V5 Migration Complete
