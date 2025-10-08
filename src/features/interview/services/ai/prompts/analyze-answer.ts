export const analyzeAnswerPrompt = (
  questionData: {
    question: string;
    questionId: string;
    questionIndex: number;
    expectedTopics: string[];
    category: string;
    difficulty: string;
  },
  audioBase64: string,
  language: string
) => `
You are an expert interview evaluator analyzing a single interview response.

QUESTION CONTEXT:
- Question ID: ${questionData.questionId}
- Question Number: ${questionData.questionIndex + 1}
- Category: ${questionData.category}
- Difficulty Level: ${questionData.difficulty}
- Question: "${questionData.question}"
- Expected Topics: ${questionData.expectedTopics.join(', ')}
- Response Language: ${language}

AUDIO ANALYSIS INSTRUCTIONS:
1. First, transcribe the audio response accurately
2. Evaluate the response against the expected topics
3. Assess technical accuracy, clarity, and completeness
4. Provide specific, actionable feedback

EVALUATION CRITERIA:
- Relevance to Question (0-100): How well does the answer address the question?
- Technical Accuracy (0-100): Correctness of technical concepts mentioned
- Clarity (0-100): How clearly the candidate communicated their thoughts
- Completeness (0-100): How thoroughly they covered the topic
- Professionalism (0-100): Overall presentation and communication style

Return the analysis in this JSON format:
{
  "transcription": "Full transcription of the audio response",
  "score": 85,
  "analysis": {
    "relevance": 90,
    "technicalAccuracy": 80,
    "clarity": 85,
    "completeness": 75,
    "professionalism": 90
  },
  "strengths": ["Clear explanation of concepts", "Good use of examples"],
  "weaknesses": ["Missing discussion of edge cases", "Could be more concise"],
  "suggestions": ["Practice explaining complex topics more simply", "Add more real-world examples"],
  "feedback": "Good technical understanding demonstrated, but could improve explanation structure"
}`;