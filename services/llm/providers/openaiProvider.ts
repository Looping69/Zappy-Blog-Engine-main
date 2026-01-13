import { AgentConfig, LLMProvider } from '../../../types';
import { ILLMProvider, LLMResponse } from '../types';

export class OpenAIProvider implements ILLMProvider {
    id = LLMProvider.OPENAI;
    name = 'OpenAI GPT-4o';
    private apiKey: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async generate(systemPrompt: string, userPrompt: string, config: AgentConfig): Promise<LLMResponse> {
        if (!this.apiKey) throw new Error('OpenAI API Key missing');

        const modelName = config.priority === 'speed' ? 'gpt-4o-mini' : 'gpt-4o';

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: config.temperature,
                    max_tokens: config.maxOutputTokens,
                    top_p: config.topP,
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
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
            console.error('OpenAI Generation Error:', error);
            throw error;
        }
    }
}
