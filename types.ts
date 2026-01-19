
export type AgentRole = 'planner' | 'architect' | 'designer' | 'engineer' | 'qa' | 'devops';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'working' | 'waiting' | 'done';
  message: string;
}

export interface File {
  name: string;
  language: string;
  content: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentId: string; // 'system' or agent ID
  message: string;
  type: 'info' | 'success' | 'error' | 'cmd' | 'warning' | 'chat';
  sources?: GroundingSource[];
}

export interface ExecutionStep {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: string;
  isThinking?: boolean;
}

export interface ProjectAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface ApiContract {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  request?: string;
  response: string;
}

export interface ClarificationRequest {
  fromAgentId: string;
  toAgentId: string;
  question: string;
}

export type AppTheme = 'modern-clean' | 'glassmorphism' | 'neobrutalism' | 'cyberpunk' | 'minimal';

export interface ProjectConfig {
  name: string;
  description: string;
  theme: AppTheme;
  features: string[];
}

export type ViewMode = 'dashboard' | 'wizard' | 'ide';
