
import { AgentId, TokenUsage, AgentConfig, DEFAULT_AGENT_CONFIG, ContentConfig } from "../types";
import { GLOBAL_CLINICAL_PROTOCOLS } from "../constants/protocols";
import { llmRouter } from "./llm/llmRouter";
import { AgentStrategyFactory } from "./agents/agentStrategyFactory";

export class AgentService {
    private getPromptForAgent(agentId: AgentId, keyword: string, context: string, config?: AgentConfig, contentConfig?: ContentConfig): string {
        // 1. If custom prompt is provided, use it as the base
        if (config?.customSystemPrompt?.trim()) {
            return `${config.customSystemPrompt}

Topic: "${keyword}"

${context ? `Context:\n${context}` : ''}

${GLOBAL_CLINICAL_PROTOCOLS}`;
        }

        // 2. Get Strategy for the agent
        const strategy = AgentStrategyFactory.getStrategy(agentId);
        let basePrompt = strategy
            ? strategy.getPrompt(keyword, context, config, contentConfig)
            : `You are a helpful assistant for Zappyhealth.`;

        // 3. Append Global Protocols to ALL generations (Standard clinical safety layer)
        return basePrompt + `\n\n${GLOBAL_CLINICAL_PROTOCOLS}`;
    }

    async runAgentTask(
        agentId: AgentId,
        keyword: string,
        previousContext: string,
        config?: AgentConfig,
        contentConfig?: ContentConfig
    ): Promise<{ content: string, usage: TokenUsage, skipped?: boolean }> {
        // Use provided config or defaults
        const agentConfig = config || DEFAULT_AGENT_CONFIG;

        // Check if agent is disabled
        if (!agentConfig.enabled) {
            return {
                content: `[Agent ${agentId} is disabled - skipped]`,
                usage: { promptTokens: 0, responseTokens: 0, totalTokens: 0 },
                skipped: true
            };
        }

        try {
            const prompt = this.getPromptForAgent(agentId, keyword, previousContext, agentConfig, contentConfig);

            // Delegate to Smart Router
            const response = await llmRouter.route(agentId, prompt, "", agentConfig);

            return {
                content: response.content || "Agent failed to generate response.",
                usage: response.usage,
                skipped: false
            };
        } catch (error) {
            console.error(`Error in agent ${agentId}:`, error);
            throw new Error(`Agent ${agentId} encountered a failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const agentService = new AgentService();
