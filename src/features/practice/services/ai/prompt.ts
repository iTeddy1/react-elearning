import { GenerateInput } from './types';

export const buildGeneratePrompt = ({
  topic,
  technology,
  difficulty,
  numQuestions,
  language,
}: GenerateInput) => `
You are an expert frontend development instructor and assessment designer.
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

export const buildReviewPrompt = ({
  payloadJSON,
  answers,
  technology,
  language,
}: {
  payloadJSON: string;
  answers: (0 | 1 | 2 | 3 | null)[];
  technology: string;
  language: 'vi' | 'en';
}) => `
**ROLE:** You are an expert ${technology} instructor and assessment specialist with deep knowledge of learning analytics and personalized feedback generation.

**TASK:** Analyze a learner's quiz performance and generate a comprehensive performance review with actionable insights and tailored recommendations specific to the technology being assessed.

**CRITICAL INSTRUCTION:** You MUST calculate the score accurately by comparing user answers to correct answers. Do not make assumptions about the score.

**CONTEXT:**
- Quiz Data: ${payloadJSON}
- User Answers: ${JSON.stringify(answers)}
- Output Language: "${language}"

**TECHNOLOGY-SPECIFIC ANALYSIS:**
- Extract the technology from the quiz data (meta.technology field)
- Tailor all feedback, recommendations, and tips to that specific technology
- Use technology-appropriate terminology and concepts
- Focus on technology-specific best practices and learning paths

**STRUCTURED ANALYSIS REQUIRED:**

1) **PERFORMANCE CALCULATION (CRITICAL):**
   - For each question, compare the user's answer index with the correct answerIndex from the quiz data
   - Count ONLY the questions where user answer exactly matches the correct answerIndex
   - NULL answers should be counted as incorrect
   - Score = number of correct answers
   - Total = total number of questions
   - Accuracy = score / total (as decimal between 0 and 1)

2) **MISTAKE PATTERN ANALYSIS:**
   - Identify recurring error patterns by topic tags
   - Determine knowledge gaps from incorrect answers
   - Assess difficulty level vs performance correlation
   - Focus on technology-specific concepts and patterns

3) **PERSONALIZED FEEDBACK:**
   - Write constructive, specific feedback (3-6 sentences)
   - Focus on learning patterns, not just scores
   - Highlight both strengths and improvement areas in the context of the specific technology
   - Maintain encouraging and growth-oriented tone
   - Reference technology-specific concepts and terminology

4) **STRATEGIC RECOMMENDATIONS:**
   - Prioritize 3-7 study topics based on mistake patterns
   - Order recommendations by learning impact for the specific technology
   - Align suggestions with identified knowledge gaps
   - Focus on technology-specific learning paths and resources

5) **ACTIONABLE STUDY TIPS:**
   - Provide 3-7 practical, specific study strategies
   - Include diverse learning methods (reading, practice, projects)
   - Tailor tips to the specific technology's development best practices
   - Focus on techniques that address identified weaknesses

**SCORE CALCULATION EXAMPLE:**
If quiz has 10 questions and user answers: [0,1,2,null,1,0,3,2,1,0]
And correct answers are: [0,2,2,1,1,0,3,1,1,0]
Then: Questions 1,5,6,7,10 are correct = 5/10 score, 0.5 accuracy

**OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure:

{
  "score": number,                    // MUST be exact count of correct answers
  "total": number,                    // MUST be total number of questions
  "accuracy": number,                 // MUST be score/total as decimal (0-1)
  "perTagAccuracy": { [tag: string]: number },
  "comment": string,
  "recommendedTopics": string[],
  "tips": string[]
}

**VALIDATION REQUIREMENTS:**
- Score must be integer between 0 and total
- Total must equal the number of quiz questions
- Accuracy must equal score/total exactly
- All calculations must be mathematically correct

Generate the analysis now with EXACT score calculation:
`;
