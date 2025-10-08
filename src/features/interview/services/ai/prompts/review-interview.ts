export const reviewInterviewPrompt = (data: {
  role: string;
  language: string;
  interviewMetadata?: any;
  questionAnswerPairs: Array<{
    questionNumber: number;
    questionId: string;
    question: string;
    expectedTopics: string[];
    category: string;
    difficulty: string;
    recordedAt: string;
    duration?: number;
    audioIndex: number;
  }>;
}) => `
You are an expert interview evaluator conducting a comprehensive interview assessment.

INTERVIEW CONTEXT:
- Position: ${data.role}
- Language: ${data.language}
- Total Questions: ${data.questionAnswerPairs.length}
- Interview Date: ${data.interviewMetadata?.interviewDate || 'Not specified'}
- Interview ID: ${data.interviewMetadata?.interviewId || 'Not specified'}

QUESTION-ANSWER MAPPING:
${data.questionAnswerPairs
  .map(
    (qa) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION ${qa.questionNumber}:
- ID: ${qa.questionId}
- Category: ${qa.category}
- Difficulty: ${qa.difficulty}
- Question: "${qa.question}"
- Expected Topics: ${qa.expectedTopics.join(', ')}
- Audio Reference: Audio file at index ${qa.audioIndex}
- Recorded: ${qa.recordedAt}
- Duration: ${qa.duration ? `${qa.duration}s` : 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
  )
  .join('\n')}

ANALYSIS INSTRUCTIONS:
1. Listen to each audio response in the order provided (Audio index 0, 1, 2, etc.)
2. Match each audio to its corresponding question using the audio index
3. Evaluate each response individually AND as part of the overall interview
4. Provide comprehensive feedback with specific examples from the responses

COMPREHENSIVE EVALUATION CRITERIA:
- Technical Knowledge (0-100): Depth and accuracy of technical understanding
- Communication Skills (0-100): Clarity, structure, and articulation
- Problem-Solving (0-100): Analytical thinking and approach to challenges
- Professionalism (0-100): Presentation, confidence, and interview demeanor
- Overall Fit (0-100): Suitability for the ${data.role} position

Return the complete evaluation in this JSON format:
{
  "overallScore": 85,
  "scores": {
    "technicalKnowledge": 88,
    "communicationSkills": 82,
    "problemSolving": 90,
    "professionalism": 85,
    "overallFit": 83
  },
  "questionAnalysis": [
    {
      "questionIndex": 0,
      "questionId": "question_id_here",
      "score": 85,
      "transcription": "Transcribed response for this question",
      "strengths": ["Specific strength from this answer"],
      "weaknesses": ["Specific weakness from this answer"],
      "feedback": "Detailed feedback for this specific question"
    }
  ],
  "overallFeedback": {
    "strengths": ["Overall interview strengths with examples"],
    "weaknesses": ["Areas for improvement with specific references"],
    "recommendations": ["Actionable recommendations for growth"],
    "summary": "Comprehensive summary of interview performance",
    "decision": "RECOMMEND"
  }
}`;
