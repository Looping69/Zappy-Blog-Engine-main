
import { AgentId } from '../../types';
import { AgentPromptStrategy } from './types';
import { ResearcherStrategy } from './researcherAgent';
import { WriterStrategy } from './writerAgent';
import { ComplianceStrategy } from './complianceAgent';
import { EnhancerStrategy } from './enhancerAgent';
import { SEOStrategy } from './seoAgent';
import { EditorStrategy } from './editorAgent';

export class AgentStrategyFactory {
    private static strategies: Record<AgentId, AgentPromptStrategy> = {
        [AgentId.RESEARCHER]: new ResearcherStrategy(),
        [AgentId.WRITER]: new WriterStrategy(),
        [AgentId.COMPLIANCE]: new ComplianceStrategy(),
        [AgentId.ENHANCER]: new EnhancerStrategy(),
        [AgentId.SEO]: new SEOStrategy(),
        [AgentId.EDITOR]: new EditorStrategy()
    };

    static getStrategy(agentId: AgentId): AgentPromptStrategy | null {
        return this.strategies[agentId] || null;
    }
}
