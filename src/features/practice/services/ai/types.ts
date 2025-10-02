export interface GenerateInput {
  topic: string;
  technology: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  numQuestions: number;
  language: 'vi' | 'en';
}

export interface AIProvider {
  generateQuiz(input: GenerateInput, key: string): Promise<string>; // raw JSON string!
  reviewAnswers(
    args: {
      payloadJSON: string;
      answers: (0 | 1 | 2 | 3 | null)[];
      language: 'vi' | 'en';
    },
    key: string
  ): Promise<string>;
}
