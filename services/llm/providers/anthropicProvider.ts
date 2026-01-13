import { AgentConfig, LLMProvider } from '../../../types';
import { ILLMProvider, LLMResponse } from '../types';

export class AnthropicProvider implements ILLMProvider {
    id = LLMProvider.ANTHROPIC;
    name = 'Anthropic Claude';
    private apiKey: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async generate(systemPrompt: string, userPrompt: string, config: AgentConfig): Promise<LLMResponse> {
        if (!this.apiKey) throw new Error('Anthropic API Key missing');

        const modelName = config.priority === 'speed' ? 'claude-3-haiku-20240307' : 'claude-3-5-sonnet-20240620';

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'x-api-source': 'web_application' // Often needed for frontend calls if not proxied, but frontend calls to Anthropic usually CORS fail unless proxied.
                    // Note: Anthropic API typically blocks CORS from browser.
                    // If this fails, we might need a proxy like we did for SerpApi.
                    // For now, implementing as direct.
                },
                body: JSON.stringify({
                    model: modelName,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: config.maxOutputTokens,
                    temperature: config.temperature,
                    top_p: config.topP,
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`Anthropic Error: ${err.error?.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                content: data.content[0]?.text || '',
                usage: {
                    promptTokens: data.usage?.input_tokens || 0,
                    responseTokens: data.usage?.output_tokens || 0,
                    totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
                },
                provider: this.id,
                model: modelName
            };
        } catch (error) {
            console.error('Anthropic Generation Error:', error);
            throw error; // Router will catch and fallback
        }
    }
}
