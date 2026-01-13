import { AgentConfig, AgentId, LLMProvider } from '../../types';
import { ILLMProvider, LLMResponse } from './types';
import { GeminiProvider } from './providers/geminiProvider';
import { AnthropicProvider } from './providers/anthropicProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { PerplexityProvider } from './providers/perplexityProvider';

export class LLMRouter {
    private providers: Record<LLMProvider, ILLMProvider>;
    private geminiDefault: GeminiProvider;

    constructor() {
        this.geminiDefault = new GeminiProvider();

        this.providers = {
            [LLMProvider.GEMINI]: this.geminiDefault,
            [LLMProvider.ANTHROPIC]: new AnthropicProvider(),
            [LLMProvider.OPENAI]: new OpenAIProvider(),
            [LLMProvider.PERPLEXITY]: new PerplexityProvider()
        };
    }

    getBestProviderForAgent(agentId: AgentId): ILLMProvider {
        // 1. Research Agent -> Perplexity preference
        if (agentId === AgentId.RESEARCHER) {
            if (this.providers[LLMProvider.PERPLEXITY].isConfigured()) return this.providers[LLMProvider.PERPLEXITY];
            if (this.providers[LLMProvider.OPENAI].isConfigured()) return this.providers[LLMProvider.OPENAI];
            // Fallback to Gemini
        }

        // 2. Writer Agent -> Claude preference (better flow)
        if (agentId === AgentId.WRITER) {
            if (this.providers[LLMProvider.ANTHROPIC].isConfigured()) return this.providers[LLMProvider.ANTHROPIC];
            if (this.providers[LLMProvider.OPENAI].isConfigured()) return this.providers[LLMProvider.OPENAI];
        }

        // 3. Editor/Compliance -> GPT-4 preference (better logic/instruction following)
        if (agentId === AgentId.EDITOR || agentId === AgentId.COMPLIANCE) {
            if (this.providers[LLMProvider.OPENAI].isConfigured()) return this.providers[LLMProvider.OPENAI];
            if (this.providers[LLMProvider.ANTHROPIC].isConfigured()) return this.providers[LLMProvider.ANTHROPIC];
        }

        // 4. Enhancer/SEO -> Speed/Balanced (Gemini is great here, or GPT-4o-mini if configured)
        if (agentId === AgentId.ENHANCER || agentId === AgentId.SEO) {
            // Keep Gemini as primary for these speed-sensitive tasks unless user explicit override (which we aren't implementing yet)
            if (this.geminiDefault.isConfigured()) return this.geminiDefault;
        }

        // Default Fallback: Gemini
        if (this.geminiDefault.isConfigured()) {
            return this.geminiDefault;
        }

        // Ultimate Fallback: Return first configured provider or throw
        const configured = Object.values(this.providers).find(p => p.isConfigured());
        if (configured) return configured;

        throw new Error("No LLM Providers Configured. Please add an API Key in Settings.");
    }

    async route(agentId: AgentId, systemPrompt: string, userPrompt: string, config: AgentConfig): Promise<LLMResponse> {
        const provider = this.getBestProviderForAgent(agentId);
        console.log(`[LLM Router] Routing Agent ${agentId} to ${provider.name}`);

        try {
            return await provider.generate(systemPrompt, userPrompt, config);
        } catch (error) {
            console.warn(`[LLM Router] Provider ${provider.name} failed. Falling back to Gemini.`);
            // Simple fallback to Gemini if primary failed and it wasn't Gemini
            if (provider.id !== LLMProvider.GEMINI && this.geminiDefault.isConfigured()) {
                console.log(`[LLM Router] Fallback: Routing to Gemini`);
                return await this.geminiDefault.generate(systemPrompt, userPrompt, config);
            }
            throw error;
        }
    }
}

export const llmRouter = new LLMRouter();
