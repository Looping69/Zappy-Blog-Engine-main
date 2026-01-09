
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

export interface BlogHistoryItem {
  id: string;
  keyword: string;
  title: string;
  content: string;
  createdAt: number;
  tokenCount: number;
  blogStructure: string;
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

// Blog Structure Templates
export type BlogStructure =
  | 'schema-v12'
  | 'clinical-authority'
  | 'listicle'
  | 'how-to-guide'
  | 'qa-format'
  | 'comparison'
  | 'case-study'
  | 'myth-busting';

export interface BlogStructureOption {
  id: BlogStructure;
  name: string;
  description: string;
  icon: string;
  template: string;
}

export const BLOG_STRUCTURES: BlogStructureOption[] = [
  {
    id: 'schema-v12',
    name: 'Zappyhealth v1.2',
    description: 'Production schema with TL;DR, strict authority, JSON output',
    icon: '✅',
    template: `Schema v1.2 - Production Standard

• SEO Title (40-70 chars)
• Meta Description (140-160 chars)
• Introduction (300-700 chars)
• TL;DR (3-5 bullet conclusions)
• Overview
• Mechanism
• Evidence Summary OR Provider Guidance
• Common Concerns (3-5 Q&A)
• Supportive Actions (2-5 items)
• Topic-Specific Section (optional)
• Key Takeaway
• FAQ (3-5 Q&A)
• Disclaimer`
  },
  {
    id: 'clinical-authority',
    name: 'Clinical Authority',
    description: 'Professional medical article with research-backed structure',
    icon: '🏥',
    template: `[META DESCRIPTION]: 150-160 characters summarizing the post.
[TITLE]: H1 Header incorporating the primary keyword.
[INTRODUCTION]: Hook + Overview + Thesis
[MAIN BODY]: H2/H3 subheadings with clinical explanations and evidence
[CONCLUSION]: Key takeaways + CTA + Future outlook
[MEDICAL DISCLAIMER]: Standard professional warning`
  },
  {
    id: 'listicle',
    name: 'Listicle',
    description: 'Numbered list format (e.g., "7 Ways to...")',
    icon: '📋',
    template: `[META DESCRIPTION]: 150-160 characters with the number and benefit.
[TITLE]: "X [Benefits/Ways/Tips] for [Topic]" format
[INTRODUCTION]: Brief hook explaining why this list matters
[LIST ITEMS]: Numbered H2 headers (1. First Item, 2. Second Item...)
  - Each item: 150-300 words with actionable advice
  - Include sub-bullets for key points
[CONCLUSION]: Summary of top picks + CTA
[MEDICAL DISCLAIMER]: Standard warning`
  },
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step instructional format',
    icon: '📝',
    template: `[META DESCRIPTION]: "Learn how to [action] with this step-by-step guide"
[TITLE]: "How to [Action]: A Complete Guide" format
[INTRODUCTION]: What readers will learn + prerequisites
[MATERIALS/REQUIREMENTS]: What's needed before starting (if applicable)
[STEPS]: Numbered steps with H2 headers
  - Step 1: [Action] - detailed instructions
  - Step 2: [Action] - detailed instructions
  - Include tips/warnings in callout boxes
[TROUBLESHOOTING]: Common issues and solutions
[CONCLUSION]: Summary + expected outcomes + CTA
[MEDICAL DISCLAIMER]: Standard warning`
  },
  {
    id: 'qa-format',
    name: 'Q&A Format',
    description: 'FAQ-style with questions as headers',
    icon: '❓',
    template: `[META DESCRIPTION]: "Get answers to common questions about [topic]"
[TITLE]: "[Topic]: Your Questions Answered" or "FAQ: [Topic]"
[INTRODUCTION]: Overview of why these questions matter
[QUESTIONS]: H2 headers as questions people commonly ask
  - What is [topic]?
  - How does [topic] work?
  - Who should consider [topic]?
  - What are the risks of [topic]?
  - When should I see a doctor about [topic]?
[ADDITIONAL RESOURCES]: Links to related content
[CONCLUSION]: Summary + when to seek professional help
[MEDICAL DISCLAIMER]: Standard warning`
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Side-by-side analysis (e.g., Treatment A vs B)',
    icon: '⚖️',
    template: `[META DESCRIPTION]: "[Option A] vs [Option B]: Which is right for you?"
[TITLE]: "[Option A] vs [Option B]: A Complete Comparison"
[INTRODUCTION]: Why this comparison matters + who it's for
[OVERVIEW]: Brief intro to both options
[COMPARISON TABLE]: Side-by-side feature comparison
[OPTION A DEEP DIVE]: Pros, cons, best use cases
[OPTION B DEEP DIVE]: Pros, cons, best use cases
[HEAD-TO-HEAD]: Direct comparison on key factors
[VERDICT]: Recommendations based on different needs
[CONCLUSION]: Summary + CTA
[MEDICAL DISCLAIMER]: Standard warning`
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Problem → Solution → Results narrative',
    icon: '📊',
    template: `[META DESCRIPTION]: "See how [approach] helped with [problem]"
[TITLE]: "Case Study: [Outcome] Through [Approach]"
[INTRODUCTION]: Overview of the case and why it matters
[BACKGROUND]: Patient/situation context (anonymized)
[THE CHALLENGE]: Detailed problem description
[THE APPROACH]: What was tried and why
[THE SOLUTION]: What worked and how it was implemented
[RESULTS]: Measurable outcomes and improvements
[KEY TAKEAWAYS]: Lessons learned
[CONCLUSION]: Implications for readers + CTA
[MEDICAL DISCLAIMER]: Standard warning + note about individual variation`
  },
  {
    id: 'myth-busting',
    name: 'Myth-Busting',
    description: 'Separating fact from fiction',
    icon: '🔍',
    template: `[META DESCRIPTION]: "Separate fact from fiction about [topic]"
[TITLE]: "[X] Common Myths About [Topic] - Debunked"
[INTRODUCTION]: Why misinformation about this topic is dangerous
[MYTHS]: H2 headers in "Myth: [statement]" format
  - Myth 1: [Common misconception]
    - The Truth: [Evidence-based correction]
    - Why This Matters: [Clinical implications]
  - Myth 2: [Common misconception]
    - The Truth: [Evidence-based correction]
[THE FACTS]: Summary of what science actually says
[CONCLUSION]: How to evaluate health information + CTA
[MEDICAL DISCLAIMER]: Standard warning`
  }
];

export interface ContentConfig {
  blogStructure: BlogStructure;
  customStructureInstructions: string;
}

export const DEFAULT_CONTENT_CONFIG: ContentConfig = {
  blogStructure: 'schema-v12',
  customStructureInstructions: ''
};

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
