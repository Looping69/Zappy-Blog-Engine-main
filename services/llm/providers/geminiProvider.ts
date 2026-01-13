import { GoogleGenAI } from "@google/genai";
import { AgentConfig, LLMProvider } from '../../../types';
import { ILLMProvider, LLMResponse } from '../types';

export class GeminiProvider implements ILLMProvider {
    id = LLMProvider.GEMINI;
    name = 'Google Gemini';
    private client: GoogleGenAI | null = null;
    private apiKey: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (this.apiKey) {
            this.client = new GoogleGenAI({ apiKey: this.apiKey });
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async generate(systemPrompt: string, userPrompt: string, config: AgentConfig): Promise<LLMResponse> {
        if (!this.client) throw new Error('Gemini API Key missing');

        // Priority-based adjustments (legacy logic preservation)
        let temperature = config.temperature;
        let maxTokens = config.maxOutputTokens;

        if (config.priority === 'speed') {
            temperature = Math.min(temperature, 0.5);
            maxTokens = Math.min(maxTokens, 2048);
        } else if (config.priority === 'quality') {
            temperature = Math.max(temperature, 0.7);
            maxTokens = Math.max(maxTokens, 4096);
        }

        const modelName = config.priority === 'speed' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

        try {
            const response = await this.client.models.generateContent({
                model: modelName,
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
                    // Gemini doesn't always support strict system/user separation in all SDK versions effectively,
                    // but prepending system prompt is a safe fallback pattern for consistency.
                ],
                config: {
                    temperature: temperature,
                    topK: config.topK,
                    topP: config.topP,
                    maxOutputTokens: maxTokens,
                }
            });

            return {
                content: response.text || '',
                usage: {
                    promptTokens: response.usageMetadata?.promptTokenCount || 0,
                    responseTokens: response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata?.totalTokenCount || 0
                },
                provider: this.id,
                model: modelName
            };
        } catch (error) {
            console.error('Gemini Generation Error:', error);
            throw error;
        }
    }
}
