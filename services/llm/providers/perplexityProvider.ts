import { AgentConfig, LLMProvider } from '../../../types';
import { ILLMProvider, LLMResponse } from '../types';

export class PerplexityProvider implements ILLMProvider {
    id = LLMProvider.PERPLEXITY;
    name = 'Perplexity Sonar';
    private apiKey: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async generate(systemPrompt: string, userPrompt: string, config: AgentConfig): Promise<LLMResponse> {
        if (!this.apiKey) throw new Error('Perplexity API Key missing');

        const modelName = 'sonar-pro'; // Optimized for research tasks

        try {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: config.temperature,
                    max_tokens: config.maxOutputTokens, // Perplexity often ignores this or has lower limits
                    top_p: config.topP,
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`Perplexity Error: ${err.error?.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                content: data.choices[0]?.message?.content || '',
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    responseTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                },
                provider: this.id,
                model: modelName
            };
        } catch (error) {
            console.error('Perplexity Generation Error:', error);
            throw error;
        }
    }
}
