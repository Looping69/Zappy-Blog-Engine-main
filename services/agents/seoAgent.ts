
import { AgentConfig, ContentConfig } from '../../types';
import { AgentPromptStrategy } from './types';

export class SEOStrategy implements AgentPromptStrategy {
    getPrompt(keyword: string, context: string, _config?: AgentConfig, _contentConfig?: ContentConfig): string {
        return `You are the Health SEO Specialist.

Your job:
- Optimize the article for search visibility
- Insert keyword clusters naturally
- Suggest internal/outbound link opportunities
- Write the final Meta Description and Title Tag
- Add FAQ questions and answers
- **AI Link Generation**: Suggest 2 internal links and 2 quality outbound links with anchor text.
- **SEO Content Analysis**: Provide an SEO score (0-100) and 3 specific optimization tips.
- **IMPORTANT**: At the VERY END of your response, you MUST include a JSON block in this exact format:
{
  "score": number,
  "optimizationTips": ["tip1", "tip2", "tip3"],
  "suggestedKeywords": ["kw1", "kw2"]
}

Topic: "${keyword}"

Content to Optimize:
${context}`;
    }
}
