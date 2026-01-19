
// State machine phases
export type ProjectPhase = 'planning' | 'designing' | 'architecting' | 'coding' | 'healing' | 'ready';

// Enhanced agent roles
export type AgentRole = 'planner' | 'designer' | 'architect' | 'coder' | 'healer' | 'qa';

export interface Agent
{
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'working' | 'waiting' | 'done';
  message: string;
  phase?: ProjectPhase; // Which phase this agent is active in
}

export interface File
{
  name: string;
  language: string;
  content: string;
}

// Structured project state for state machine
export interface ProjectState
{
  phase: ProjectPhase;
  plan: {
    features: string[];
    fileStructure: string[];
    mockDataSchema?: Record<string, any>;
  };
  designSystem: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      accent: string;
    };
    radius: string;
    font: string;
    spacing: string;
  };
  fileSystem: Record<string, string>; // path: content
  terminalLogs?: {
    stdout: string;
    stderr: string;
    exitCode: number;
  };
  healingAttempts: number;
  currentStep: number;
}

export interface GroundingSource
{
  title: string;
  uri: string;
}

export interface LogEntry
{
  id: string;
  timestamp: string;
  agentId: string; // 'system' or agent ID
  message: string;
  type: 'info' | 'success' | 'error' | 'cmd' | 'warning' | 'chat' | 'phase';
  sources?: GroundingSource[];
  phase?: ProjectPhase;
}

export interface ExecutionStep
{
  id: number;
  label: string;
  status: 'pending' | 'running' | 'completed';
  phase?: ProjectPhase;
}

export interface ChatMessage
{
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: string;
  isThinking?: boolean;
}

export interface ProjectAsset
{
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface ApiContract
{
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  request?: string;
  response: string;
}

export interface ClarificationRequest
{
  fromAgentId: string;
  toAgentId: string;
  question: string;
}

export type AppTheme = 'modern-clean' | 'glassmorphism' | 'neobrutalism' | 'cyberpunk' | 'minimal';

export interface ProjectConfig
{
  name: string;
  description: string;
  theme: AppTheme;
  features: string[];
}

export type ViewMode = 'dashboard' | 'wizard' | 'ide';
