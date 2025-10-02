# AI-Generated Quiz System with Zustand

## 🎯 **Complete Implementation**

This system creates AI-generated quizzes based on the `res.json` structure and manages the complete quiz flow using Zustand stores.

## 🏗️ **Architecture Overview**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Quiz Generator    │    │   Quiz Session      │    │   Progress Store    │
│     Store           │    │     Store           │    │                     │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ • AI Integration    │    │ • Current Quiz      │    │ • Attempt History   │
│ • Generation State  │    │ • Question Nav      │    │ • Statistics        │
│ • History Tracking  │    │ • Answer Management │    │ • Achievements      │
│ • Settings          │    │ • Timer & Scoring   │    │ • Data Persistence  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
             │                        │                        │
             └─────────┬──────────────┴───────────────┬─────────┘
                       │                              │
            ┌─────────────────────────────────────────────┐
            │           Quiz Coordinator Store            │
            │                                             │
            │ • Cross-store Communication                 │
            │ • Quiz Flow Orchestration                   │
            │ • Action Logging                            │
            └─────────────────────────────────────────────┘
```

## 🚀 **Usage Flow**

### **1. Generate Quiz with AI**
```typescript
const { startGeneration, generatedQuiz, isGenerating } = useQuizGeneratorStore();

// Generate quiz based on res.json structure
await startGeneration({
  topic: 'React rendering',
  difficulty: 'Advanced',
  questionCount: 1,
  language: 'en'
});
```

### **2. Start Quiz Session**
```typescript
const { startQuizFlow } = useQuizStore();
const { currentQuestion, progress } = useQuizSessionSelectors();

// Start the complete quiz flow
startQuizFlow(generatedQuiz);
```

### **3. Handle Answers & Navigation**
```typescript
const { submitAnswer, nextQuestion } = useQuizSessionStore();

// Submit answer for current question
submitAnswer(currentQuestion.id, selectedOptionIndex);

// Navigate through questions
nextQuestion(); // Auto-advances or completes quiz
```

### **4. Complete & Track Progress**
```typescript
const { completeQuizSession } = useQuizStore();
const { overallStats, accuracy } = useProgressSelectors();

// Complete quiz and save progress
completeQuizSession(); // Automatically saves to progress store
```

## 📊 **Data Flow: AI Response → Quiz**

### **Input (AI Request):**
```typescript
{
  topic: 'React rendering',
  difficulty: 'advanced',
  numQuestions: 1,
  language: 'en'
}
```

### **Output (AI Response - res.json format):**
```typescript
{
  meta: {
    topic: "React rendering",
    difficulty: "advanced",
    language: "en",
    numQuestions: 1
  },
  items: [{
    id: "react-rendering-advanced-001",
    question: "Consider the following React components...",
    choices: ["Option A", "Option B", "Option C", "Option D"],
    answerIndex: 1,
    explanation: "The handleClick function is defined inside Parent...",
    tags: ["rendering", "performance", "memoization"]
  }],
  overall: {
    summary: "This quiz assesses deep understanding...",
    strengths: ["Understanding of component lifecycle..."],
    weaknesses: ["Misconceptions about React.memo..."],
    suggestedTopics: ["Understanding JavaScript reference equality..."],
    studyTips: ["Experiment with React.memo, useCallback..."],
    estimatedLevel: "advanced"
  }
}
```

### **Converted Quiz Object:**
```typescript
{
  id: 1693483200000,
  title: "React rendering - Advanced Quiz",
  description: "This quiz assesses deep understanding of React's rendering mechanism...",
  difficulty: "Advanced",
  timeLimit: 2, // 2 minutes (1 question × 2 min)
  questions: [{
    id: 1,
    question: "Consider the following React components...",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 1,
    explanation: "The handleClick function is defined inside Parent...",
    difficulty: "Advanced",
    tags: ["rendering", "performance", "memoization"]
  }],
  aiGenerated: true,
  aiMeta: { /* original AI meta */ },
  aiOverall: { /* AI analysis for results page */ }
}
```

## 🎮 **Store Functions Implementation**

### **Quiz Generator Store**
- ✅ `startGeneration()` - Calls AI service and converts response
- ✅ `setGenerationResult()` - Saves converted quiz
- ✅ `saveToHistory()` - Tracks generation history
- ✅ `convertAIResponseToQuiz()` - Helper function for conversion

### **Quiz Session Store**
- ✅ `startQuiz()` - Initialize session with timer
- ✅ `submitAnswer()` - Record answers with timing
- ✅ `nextQuestion()` - Navigate or auto-complete
- ✅ `calculateScore()` - Real-time scoring
- ✅ `endQuiz()` - Session completion

### **Progress Store**
- ✅ `saveQuizAttempt()` - Store attempt with AI metadata
- ✅ `updateUserProgress()` - Calculate statistics
- ✅ `calculateStreak()` - Maintain learning streaks
- ✅ `checkAchievements()` - Unlock achievements
- ✅ **Persistence** - Auto-save to localStorage

### **Quiz Coordinator Store**
- ✅ `startQuizFlow()` - Orchestrate quiz start
- ✅ `completeQuizSession()` - Handle completion flow
- ✅ `endQuizFlow()` - Save progress and cleanup

## 🎨 **Component Integration**

### **Demo Component Usage:**
```typescript
import QuizDemo from '@/features/practice/components/QuizDemo';

// Complete working demo with:
// - AI quiz generation
// - Interactive quiz session
// - Results with AI analysis
// - Progress tracking
```

### **Custom Implementation:**
```typescript
// In your components
import {
  useQuizGeneratorStore,
  useQuizSessionStore,
  useQuizSessionSelectors,
  useProgressStore,
  useProgressSelectors,
  useQuizStore
} from '@/features/practice/store';

// Generate quiz
const { startGeneration, generatedQuiz } = useQuizGeneratorStore();

// Quiz session
const { startQuiz, submitAnswer } = useQuizSessionStore();
const { currentQuestion, progress } = useQuizSessionSelectors();

// Progress tracking
const { overallStats, accuracy } = useProgressSelectors();

// Coordinator
const { startQuizFlow, completeQuizSession } = useQuizStore();
```

## 🔧 **Environment Setup**

Make sure you have the Google GenAI API key:
```env
VITE_GOOGLE_GENAI_API_KEY=your_api_key_here
```

## 🎯 **Features Implemented**

✅ **AI Quiz Generation** - Converts res.json format to Quiz objects  
✅ **Real-time Scoring** - Instant feedback and progress tracking  
✅ **Question Navigation** - Forward/backward with auto-completion  
✅ **Timer Management** - Question and quiz-level timing  
✅ **Progress Persistence** - localStorage with import/export  
✅ **Achievement System** - Streaks, milestones, and badges  
✅ **AI Analysis Integration** - Show strengths/weaknesses from AI  
✅ **Cross-store Communication** - Coordinated state management  
✅ **TypeScript Support** - Fully typed throughout  

## 🚀 **Ready to Use**

The system is completely functional and ready for production use. Just run the `QuizDemo` component to test the complete flow from AI generation to progress tracking!

```typescript
// Test the complete flow:
<QuizDemo />
```

This implementation follows Zustand best practices with:
- **Separated concerns** across multiple stores
- **Clean state management** with proper actions
- **TypeScript integration** for type safety
- **Real-world functionality** with persistence and analytics
- **Scalable architecture** for future enhancements
