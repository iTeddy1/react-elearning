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
  relevancyScore: number;
  relevancyType: string;
  reason: string;
  improvements: string[];
  extractedIdealAnswer: string;
  strengths: string[];
}

export interface GrammarBreakdown {
  questionId: string;
  question?: string;
  sentenceStructure: number;
  grammarRules: number;
  wordUsage: number;
  incompleteSentencesAndFillers: number;
  improvements?: string[];
  suggestions?: string[];
  overallQuestionGrammarScore?: number;
  // For inline grammar in questions array
  score?: number;
  issues?: string[];
}

export interface CommunicationBreakdown {
  metric?: string; // For new format
  name?: string; // For legacy format
  definition?: string;
  score: number;
  feedback?: string; // For new format
  reasoning?: string; // For legacy format
}

export interface OverallSummary {
  overallSummary: string;
  transcriptSummary: string;
  strengths: string[];
  weaknesses: string[];
  keyInsights: string[];
  recommendation: string;
  decision?: string;
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
  communicationBreakdown: CommunicationBreakdown[];
  relevancyScoreBreakdown: QuestionEvaluation[];
  grammarScoreBreakdown: GrammarBreakdown[];
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
  scores?: {
    technicalKnowledge: number;
    communicationSkills: number;
    problemSolving: number;
    professionalism: number;
    overallFit: number;
    confidence?: number;
    articulation?: number;
    responseDepth?: number;
  };
  communicationMetrics?: {
    clarity: number;
    pace: number;
    vocabulary: number;
    grammarAccuracy: number;
    fillerWords: number;
    structuredThinking: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
  questionFeedback: Array<{
    questionId: string;
    score: number;
    feedback: string;
    transcription?: string;
    detailedScores?: {
      technicalAccuracy: number;
      relevance: number;
      completeness: number;
      clarity: number;
    };
    strengths?: string[];
    weaknesses?: string[];
    criticalPoints?: string[];
    improvementAreas?: string[];
  }>;
  suggestedImprovements: string[];
  nextSteps: string[];
  hiringPotential?: string;
  redFlags?: string[];
  standoutMoments?: string[];
  criticalConcerns?: string[];
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
