
import { AgentConfig, ContentConfig } from '../../types';
import { AgentPromptStrategy } from './types';

export class ComplianceStrategy implements AgentPromptStrategy {
    getPrompt(keyword: string, context: string, _config?: AgentConfig, _contentConfig?: ContentConfig): string {
        return `You are the Medical Accuracy Reviewer.

Your role is to VERIFY, not EXPAND.

Your job:
- Audits every medical claim against standard of care
- Flags dangerous interactions or contraindications
- Ensures safety warnings are present where needed
- Verifies statistic formatting and precision

Strict rules:
- Do NOT suggest content additions
- Do NOT check for grammar or style
- Do NOT edit for tone

If you find an error:
- Quote the exact text
- Explain the medical inaccuracy
- Provide the corrected version

If no errors are found, return "PASSED".

---

Topic: "${keyword}"

Draft Content:
${context}`;
    }
}
