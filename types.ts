
export enum AgentId {
  RESEARCHER = 'researcher',
  WRITER = 'writer',
  COMPLIANCE = 'compliance',
  ENHANCER = 'enhancer',
  SEO = 'seo',
  EDITOR = 'editor'
}

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  icon: string;
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface AgentResponse {
  agentId: AgentId;
  content: string;
  timestamp: number;
  usage?: TokenUsage;
}

export interface BlogState {
  keyword: string;
  activeAgents: AgentId[];
  history: AgentResponse[];
  finalPost: string | null;
  isGenerating: boolean;
  error: string | null;
  totalTokens: number;
}

export interface SanityConfig {
  projectId: string;
  dataset: string;
  token: string;
}

export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}

// Agent Fine-Tuning Configuration
export type ToneModifier = 'clinical' | 'friendly' | 'concise' | 'detailed' | 'custom';
export type PriorityMode = 'speed' | 'quality' | 'balanced';

export interface AgentConfig {
  // Model Parameters
  temperature: number;        // 0-2, creativity/randomness
  topK: number;               // 1-100, token sampling breadth
  topP: number;               // 0-1, nucleus sampling
  maxOutputTokens: number;    // Max response length

  // Persona Tuning
  customSystemPrompt: string; // Override default agent prompt
  toneModifier: ToneModifier;
  customToneInstruction: string;

  // Behavioral Flags
  enabled: boolean;           // Skip this agent in pipeline
  priority: PriorityMode;
}

export type AgentConfigs = Record<AgentId, AgentConfig>;

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
  customSystemPrompt: '',
  toneModifier: 'clinical',
  customToneInstruction: '',
  enabled: true,
  priority: 'balanced'
};

export const getDefaultAgentConfigs = (): AgentConfigs => ({
  [AgentId.RESEARCHER]: { ...DEFAULT_AGENT_CONFIG },
  [AgentId.WRITER]: { ...DEFAULT_AGENT_CONFIG },
  [AgentId.COMPLIANCE]: { ...DEFAULT_AGENT_CONFIG },
  [AgentId.ENHANCER]: { ...DEFAULT_AGENT_CONFIG, toneModifier: 'friendly' },
  [AgentId.SEO]: { ...DEFAULT_AGENT_CONFIG },
  [AgentId.EDITOR]: { ...DEFAULT_AGENT_CONFIG, priority: 'quality' }
});

export const AGENTS: Agent[] = [
  {
    id: AgentId.RESEARCHER,
    name: "Research & Keyword Analyst",
    role: "Intelligence Gatherer",
    description: "Performs deep medical research and identifies primary/secondary semantic keywords for the topic.",
    icon: "🔍"
  },
  {
    id: AgentId.WRITER,
    name: "Medical Content Drafter",
    role: "Narrative Architect",
    description: "Follows a strict clinical structure to draft the initial high-authority blog post.",
    icon: "📄"
  },
  {
    id: AgentId.COMPLIANCE,
    name: "Medical Accuracy Reviewer",
    role: "Clinical Auditor",
    description: "Verifies every medical claim and ensures safety warnings are present and accurate.",
    icon: "⚖️"
  },
  {
    id: AgentId.ENHANCER,
    name: "Readability & Engagement Expert",
    role: "UX Optimizer",
    description: "Refines tone and clarity to ensure complex medical concepts are accessible to patients.",
    icon: "✨"
  },
  {
    id: AgentId.SEO,
    name: "Health SEO Specialist",
    role: "Visibility Strategist",
    description: "Integrates keyword clusters naturally and optimizes meta-data for search visibility.",
    icon: "🚀"
  },
  {
    id: AgentId.EDITOR,
    name: "Executive Medical Editor",
    role: "Quality Controller",
    description: "Finalizes formatting, structure, and provides the ultimate professional polish.",
    icon: "🏆"
  }
];
