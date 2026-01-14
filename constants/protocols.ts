
// Zappyhealth Schema v1.2 JSON Template
export const ZAPPY_SCHEMA_V12 = `{
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

// 10 Global Clinical Protocols (Mandatory for ALL Generations)
export const GLOBAL_CLINICAL_PROTOCOLS = `
GLOBAL CLINICAL PROTOCOLS (MANDATORY COMPLIANCE):

1. EVIDENCE REALITY LOCK
   - Never state "new studies" or "latest data" without specific citation (RCT, JAMA, FDA label).
   - Avoid universal incidence claims unless explicitly supported.
   - Default uncertainty: "Available evidence suggests an increased risk compared to comparator therapies, but absolute risk remains low."

2. CAUSAL CHAIN (Mechanism -> Risk -> Reversibility -> Escalation)
   - Every explanation must follow this chain:
     a) Mechanism (Biological/Pharmacological why)
     b) Risk Differentiation (Side effect vs Pathology)
     c) Reversibility (Temporary vs Chronic)
     d) Escalation Thresholds (Exact red flags)

3. TIME-TO-EFFECT & CLEARANCE LAW
   - Must include: Onset window, Clearance/Washout logic, Resolution window, and "When persistence becomes abnormal" boundary.

4. DEFINITION SPLIT BOX
   - Must differentiate the condition: "X is not the same as Y. Here is how to tell the difference."

5. EVIDENCE GRADING
   - Declare: Evidence Grade (Strong/Moderate/Limited/Mixed), What we know, What we don't know, Applicability boundaries.

6. DECISION SUPPORT LAYER
   - explicit: What to do, What NOT to do, When to stop/escalate, Mitigation protocol.

7. SNIPPET ENGINEERING
   - Feature Snippet candidate (40-60 words).
   - Key Facts Box (units, ranges, thresholds).
   - "Yes/No/It Depends" first-sentence answer blocks.

8. LANGUAGE CONSTRAINTS
   - PROHIBITED: Metaphors, emotional fluff, vague safety language ("may help"), authority laundering ("experts say").
   - REQUIRED: Clinical, operational, neutral, direct answers, timeline-anchored guidance.

9. SAFETY INTEGRITY RULE
   - Mandate: Red flag symptoms, Contraindications, Escalation advice, Professional disclaimer.

10. OUTPUT CLASSIFICATION
   - You are NOT writing blogs.
   - You are writing CLINICAL EXPLAINER ASSETS for AI citation and patient safety.
`;
