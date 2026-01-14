
import { AgentConfig, ContentConfig } from '../../types';

export interface AgentPromptStrategy {
    getPrompt(keyword: string, context: string, config?: AgentConfig, contentConfig?: ContentConfig): string;
}
