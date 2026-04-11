export const generateQuestionsPrompt = (
  role: string,
  experience: string,
  roundType: string,
  skills: string[],
  numberOfQuestions: number,
  difficulty: string,
  language: string,
  resumeText?: string
) => `
You are an expert technical interviewer. Generate ${numberOfQuestions} interview questions for a ${role} position.

Candidate Profile:
- Role: ${role}
- Interview Round Type: ${roundType}
- Experience Level: ${experience}
- Key Skills: ${skills.join(', ')}
- Question Difficulty: ${difficulty}
- Language: ${language}
${resumeText ? `\n\nCandidate Resume/Background:\n${resumeText}\n\nIMPORTANT: Use the resume information above to tailor questions specifically to the candidate's experience, projects, and skills mentioned. Ask about specific technologies, projects, or achievements listed in the resume to make the interview more realistic and relevant.` : ''}

Requirements:
- Generate exactly ${numberOfQuestions} questions
- Questions should be relevant to the role and experience level
- Include expected topics/concepts for each question
- Provide follow-up questions for deeper assessment
- Categorize questions by type (technical, behavioral, situational)

Return the result in JSON format:
{
  "questions": [
    {
      "id": "unique_id",
      "category": "Technical/Behavioral/Situational",
      "question": "Interview question text here",
      "difficulty": "${difficulty}",
      "expectedTopics": ["topic1", "topic2", "topic3"],
      "followUpQuestions": ["follow-up question 1", "follow-up question 2"]
    }
  ]
}`;
