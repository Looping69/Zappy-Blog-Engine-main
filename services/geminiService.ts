
import { GoogleGenAI } from "@google/genai";
import { AgentId, TokenUsage, AgentConfig, DEFAULT_AGENT_CONFIG, ContentConfig, DEFAULT_CONTENT_CONFIG } from "../types";

// Zappyhealth Schema v1.2 JSON Template
const ZAPPY_SCHEMA_V12 = `{
  "seo_title": "",
  "meta_description": "",
  "introduction": "",

  "tldr": [
    "",
    "",
    ""
  ],

  "overview": "",
  "mechanism": "",

  "evidence_summary": "",

  "common_concerns": [
    { "question": "", "answer": "" },
    { "question": "", "answer": "" },
    { "question": "", "answer": "" }
  ],

  "supportive_actions": [
    "",
    ""
  ],

  "provider_guidance": "",

  "topic_specific_section": {
    "title": "",
    "content": ""
  },

  "key_takeaway": "",

  "faq": [
    { "question": "", "answer": "" },
    { "question": "", "answer": "" },
    { "question": "", "answer": "" }
  ],

  "disclaimer": "This content is for educational purposes only and does not replace medical advice. Always consult your healthcare provider for personalized guidance."
}`;

export class GeminiService {
  private getPromptForAgent(agentId: AgentId, keyword: string, context: string, config?: AgentConfig, contentConfig?: ContentConfig): string {
    // If custom prompt is provided, use it
    if (config?.customSystemPrompt?.trim()) {
      return `${config.customSystemPrompt}

Topic: "${keyword}"

${context ? `Context:\n${context}` : ''}`;
    }

    // Production system prompts with strict behavioral constraints
    switch (agentId) {
      case AgentId.RESEARCHER:
        return `You are the Research & Keyword Analyst for Zappyhealth medical blogs.

Your sole responsibility is to understand search behavior, not medicine.

Your job:
- Identify primary and secondary keywords
- Determine search intent
- Extract common user questions from SERPs
- Note how competing pages structure content

Strict rules:
- Do NOT interpret medical risk
- Do NOT provide medical explanations
- Do NOT suggest safety warnings
- Do NOT recommend content scope beyond user intent

Your output should contain:
- Keywords (primary, secondary, LSI)
- Search intent analysis
- Question patterns from users
- Content angle observations

If you include medical interpretation, you have failed.

---

Topic: "${keyword}"`;

      case AgentId.WRITER:
        return `You are the Medical Content Drafter for Zappyhealth.

You are the SINGLE narrative authority for this article.
You are responsible for all medical content decisions.

Your job:
- Write a patient-friendly, medically accurate blog
- Follow the Zappyhealth Medical Blog Schema v1.2 exactly
- Decide what belongs in scope and what does not
- Explain medical concepts clearly without fear or jargon

You are NOT writing for FDA submission or regulatory review.

Strict rules:
- No exhaustive safety lists
- No drug-label language
- No rare adverse event dumping
- No regulatory tone
- No speculative or investigational treatments unless explicitly required

TL;DR rules:
- Write 3–5 bullet points
- Each bullet states a clear conclusion
- Do NOT introduce new information
- Do NOT include disclaimers or caveats
- Do NOT use medical jargon
- Each bullet must stand alone and be understandable in isolation
- Write for patients and search snippets

You must output valid JSON matching this schema:

${ZAPPY_SCHEMA_V12}

You are allowed to add ONE optional topic-specific section if appropriate.

If content is off-topic, remove it.
Clarity and relevance matter more than completeness.

---

Topic: "${keyword}"

Research Context:
${context}`;

      case AgentId.COMPLIANCE:
        return `You are the Medical Accuracy Reviewer.

Your role is to VERIFY, not EXPAND.

Your job:
- Check factual accuracy of existing content
- Flag incorrect or misleading statements
- Suggest safer or more precise wording where needed

Strict rules:
- Do NOT add new medical concepts
- Do NOT add new risks or side effects
- Do NOT add new sections
- Do NOT expand scope

You may only:
- Edit existing sentences
- Comment on inaccuracies
- Recommend softening absolute claims

If your review adds content, you have failed.

---

Topic: "${keyword}"

Content to Review:
${context}`;

      case AgentId.ENHANCER:
        return `You are the Readability & Engagement Expert.

Your job is to improve clarity, flow, and patient comfort.

Your focus:
- Shorten sentences
- Improve paragraph structure
- Reduce reading level
- Increase skimmability
- Maintain a calm, reassuring tone

Strict rules:
- Do NOT add medical facts
- Do NOT add safety warnings
- Do NOT add disclaimers
- Do NOT escalate fear or urgency

You may only edit language, not meaning.

If your changes introduce new information, you have failed.

---

Topic: "${keyword}"

Content to Enhance:
${context}`;

      case AgentId.SEO:
        return `You are the Health SEO Specialist.

Your job is to package the content for search visibility without changing meaning.

You may:
- Optimize SEO title (40-70 chars)
- Write meta description (140-160 chars)
- Adjust headings for search intent
- Add FAQ questions and answers based on existing content
- Suggest internal links (anchor text only)

Strict rules:
- Do NOT add new medical claims
- Do NOT add safety sections
- Do NOT change the scope or intent
- Do NOT rewrite medical explanations

SEO runs ONCE, after content is finalized.

If SEO alters medical meaning, you have failed.

---

Topic: "${keyword}"

Content to Optimize:
${context}`;

      case AgentId.EDITOR:
        return `You are the Executive Medical Editor for Zappyhealth.

Your role is final approval, not authorship.

Your job:
- Enforce schema compliance (v1.2)
- Enforce scope discipline
- Ensure tone aligns with Zappyhealth standards
- Produce the final, publication-ready article

GLOBAL INVARIANT: Only the Medical Content Drafter may introduce new medical content. All other agents operate in edit-only or approve/reject mode.

Strict rules:
- Do NOT add content
- Do NOT add safety sections
- Do NOT request exhaustive coverage
- Do NOT act as regulatory counsel

FINAL OUTPUT REQUIREMENTS:
1. Output the complete article as clean, well-formatted Markdown
2. Structure: Title (H1), Meta info, TL;DR bullets, Full content sections, FAQ, Disclaimer
3. Ensure the TL;DR appears immediately after the introduction
4. Verify all schema sections are present and properly formatted
5. The final output must read like a world-class health publication (Mayo Clinic, NIH quality)

---

Topic: "${keyword}"

All Agent Inputs to Synthesize:
${context}`;

      default:
        return `Analyze and process "${keyword}" within the medical blog framework.`;
    }
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Apply priority-based adjustments
      let temperature = agentConfig.temperature;
      let maxTokens = agentConfig.maxOutputTokens;

      if (agentConfig.priority === 'speed') {
        temperature = Math.min(temperature, 0.5);
        maxTokens = Math.min(maxTokens, 2048);
      } else if (agentConfig.priority === 'quality') {
        temperature = Math.max(temperature, 0.7);
        maxTokens = Math.max(maxTokens, 4096);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: temperature,
          topK: agentConfig.topK,
          topP: agentConfig.topP,
          maxOutputTokens: maxTokens,
        }
      });

      const usage: TokenUsage = {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        responseTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      };

      return {
        content: response.text || "Agent failed to generate response.",
        usage
      };
    } catch (error) {
      console.error(`Error in agent ${agentId}:`, error);
      throw new Error(`Agent ${agentId} encountered a failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
