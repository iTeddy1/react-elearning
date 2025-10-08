// Interview Question Types
export interface InterviewQuestion {
  id: string;
  text: string;
  question: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedTopics: string[];
  followUpQuestions?: string[];
}

// Audio Recording Types
export interface AudioRecording {
  id: string;
  questionId: string;
  audioBlob: Blob;
  duration: number;
  timestamp: Date;
}

// Transcript Types
export interface Transcript {
  id: string;
  questionId: string;
  text: string;
  confidence: number;
  processingTime: number;
}

// Interview Answer Types
export interface InterviewAnswer {
  questionId: string;
  answer: string;
  recordingUrl?: string;
  duration?: number;
  timestamp: Date;
}

// Interview Feedback Types
export interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendations: string[];
}

// AI Evaluation Types
export interface QuestionEvaluation {
  questionId: string;
  question: string;
  answer: string;
  relevancy_score: number;
  relevancy_type: string;
  reason: string;
  improvements: string[];
  extracted_ideal_answer: string;
  strengths: string[];
}

export interface GrammarBreakdown {
  questionid: string;
  sentence_structure: number;
  grammar_rules: number;
  word_usage: number;
  incomplete_sentences_and_fillers: number;
  improvements: string[];
  overallQuestionGrammarScore: number;
}

export interface CommunicationBreakdown {
  name: string;
  definition: string;
  score: number;
  reasoning: string;
}

export interface OverallSummary {
  overall_summary: string;
  transcript_summary: string;
  strengths: string[];
  weaknesses: string[];
  key_insights: string[];
  recommendation: string;
}

// Complete Interview Result
export interface InterviewResult {
  questions: Array<{
    questionId: string;
    question: string;
    response: string;
    grammar: GrammarBreakdown | null;
    contentRelevancy: {
      score: number;
      improvement: string[];
      reason: string;
    };
  }>;
  scores: ScoreBreakdown;
  communication_breakdown: CommunicationBreakdown[];
  relevancy_score_breakdown: QuestionEvaluation[];
  grammar_score_breakdown: GrammarBreakdown[];
  overallSummary: OverallSummary;
}

export interface ScoreBreakdown {
  grammarScore: number;
  communicationScore: number;
  totalRelevancyScore: number;
  overallInterviewScore: number;
  professionalismScore: number;
  sociabilityScore: number;
  energyLevelScore: number;
}

// Interview Session Types
export interface InterviewSession {
  id: string;
  role: string;
  experience: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'en' | 'vi';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  status: 'pending' | 'active' | 'completed' | 'in-progress' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  startTime?: Date;
  endTime?: Date;
  recordings: AudioRecording[];
  transcripts: Transcript[];
  result?: InterviewResult;
}

// Interview Configuration Types
export interface InterviewConfig {
  role: string;
  experience: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  numberOfQuestions: number;
  language: 'en' | 'vi';
}

// API Request/Response Types
export interface GenerateQuestionsRequest {
  jobRole: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  roundType: 'technical' | 'behavioral' | 'system-design';
  questionCount: number;
  language: 'en' | 'vi';
}

export interface TranscriptionRequest {
  audioFile: File;
  language?: string;
}

export interface EvaluationRequest {
  questions: InterviewQuestion[];
  transcripts: Transcript[];
  jobRole: string;
}

// Store State Types
export interface InterviewState {
  currentSession: InterviewSession | null;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  audioPermission: boolean;
}

// Interview Review Types
export interface InterviewReview {
  sessionId: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
  questionFeedback: Array<{
    questionId: string;
    score: number;
    feedback: string;
  }>;
  suggestedImprovements: string[];
  nextSteps: string[];
}

export interface InterviewActions {
  startInterview: (config: GenerateQuestionsRequest) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ blob: Blob; duration: number }>;
  submitAnswer: (questionId: string, audioBlob: Blob) => Promise<void>;
  completeInterview: () => Promise<void>;
  resetInterview: () => void;
  setError: (error: string | null) => void;
}
