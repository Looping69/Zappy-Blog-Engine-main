import { AgentConfig, TokenUsage, LLMProvider } from '../../types';

export interface LLMResponse {
    content: string;
    usage: TokenUsage;
    provider: LLMProvider;
    model: string;
}

export interface ILLMProvider {
    id: LLMProvider;
    name: string;
    generate(systemPrompt: string, userPrompt: string, config: AgentConfig): Promise<LLMResponse>;
    isConfigured(): boolean;
}
