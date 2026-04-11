export interface GenerateInput {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numQuestions: number;
  language: 'Vietnamese' | 'English';
  focusArea?: string;
}

export interface QuizGenerateApiItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizGenerateApiResponse {
  quiz: QuizGenerateApiItem[];
}

export interface AIProvider {
  generateQuiz(
    input: GenerateInput,
    key: string
  ): Promise<QuizGenerateApiResponse>;
  reviewAnswers(
    args: {
      payloadJSON: string;
      answers: (0 | 1 | 2 | 3 | null)[];
      language: 'vi' | 'en';
    },
    key: string
  ): Promise<string>;
}
