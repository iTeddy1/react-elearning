import { GenerateInput } from '../types';

export const buildGeneratePrompt = ({
  topic,
  technology,
  difficulty,
  numQuestions,
  language,
}: GenerateInput) => `
You are an expert ${technology} instructor and assessment designer.
Your task: generate a high-quality multiple-choice quiz about the specified technology and topic.

Technology: "${technology}"
Topic: "${topic}"
Difficulty: "${difficulty}"
Number of questions: ${numQuestions}
Output language: "${language}"

### Requirements
- Each question is multiple-choice with exactly 4 options.
- Exactly ONE correct option per question.
- Options must be concise, mutually exclusive, and plausible (no “All of the above”).
- Explanations must be short (1–3 sentences), technically accurate, and reference the concept.
- Questions must be strictly about ${technology} and the ${topic} (no unrelated content unless essential).
- Prefer practical, real-world scenarios relevant to ${technology} development.
- Avoid ambiguous wording. No duplicate or near-duplicate questions.

### JSON-ONLY Output
Return a single, valid JSON object and nothing else.
Do not include explanations, prose, or markdown formatting.
Your response must be a raw JSON string.
Omit the json object wrapper; return the JSON directly.

The JSON object must conform to this exact schema:

{
  "meta": {
    "topic": string,
    "technology": string,
    "difficulty": "easy" | "medium" | "hard",
    "language": "vi" | "en",
    "numQuestions": number
  },
  "items": [
    {
      "id": string,                         // stable unique id (e.g., uuid or slug)
      "question": string,
      "choices": [string, string, string, string],
      "answerIndex": 0 | 1 | 2 | 3,
      "explanation": string,                // why the answer is correct (1–3 sentences)
      "tags": string[]                      // e.g., ["hooks","useEffect","rendering"] for React
    }
  ],
  "overall": {
    "summary": string,                      // 2–4 sentences summarizing what this quiz assesses
    "strengths": string[],                  // areas likely done well by learners at this level
    "weaknesses": string[],                 // common pitfalls/misconceptions for this topic
    "suggestedTopics": string[],            // 3–7 next study topics based on the quiz scope
    "studyTips": string[],                  // concise actionable tips (max 7)
    "estimatedLevel": "beginner" | "intermediate" | "advanced"
  }
}

### Validation Rules
- items.length === numQuestions
- choices.length === 4
- 0 <= answerIndex <= 3
- No code with syntax errors; keep code snippets minimal and correct.
- Use plain text only; do not include markdown code fences.
- Keep the total JSON under ~7KB for {numQuestions} <= 10.

If constraints conflict, favor correctness and clarity. Produce **JSON only**.
`;
