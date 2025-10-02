# Quiz Store Architecture - Best Practices

## 🏗️ **Store Structure**

Your quiz functionality is now split into **4 focused stores** following Zustand best practices:

### 1. **Quiz Generator Store** (`quiz-generator-store.ts`)
**Responsibility**: AI quiz generation and generation history
- ✅ Quiz generation state (loading, error, result)
- ✅ Generation settings and preferences
- ✅ Generation history tracking

### 2. **Quiz Session Store** (`quiz-session-store.ts`) 
**Responsibility**: Active quiz session management
- ✅ Current quiz and question navigation
- ✅ Answer tracking and submission
- ✅ Timer and session state
- ✅ Results display

### 3. **Progress Store** (`progress-store.ts`)
**Responsibility**: User progress and statistics
- ✅ Quiz attempt history
- ✅ Performance statistics
- ✅ Topic-wise progress tracking
- ✅ Achievement system
- ✅ **Persistence** (localStorage)

### 4. **Quiz Coordinator Store** (`quiz-coordinator-store.ts`)
**Responsibility**: Cross-store communication
- ✅ Quiz flow orchestration
- ✅ Store coordination
- ✅ Action logging

## 📋 **Usage Patterns**

### **In Components:**

```typescript
// Use specific stores for specific purposes
import { 
  useQuizGeneratorStore,
  useQuizSessionStore, 
  useQuizSessionSelectors,
  useProgressStore,
  useProgressSelectors 
} from '../store';

const QuizComponent = () => {
  // Generation logic
  const { isGenerating, startGeneration } = useQuizGeneratorStore();
  
  // Session logic  
  const { startQuiz, submitAnswer } = useQuizSessionStore();
  const { currentQuestion, progress } = useQuizSessionSelectors();
  
  // Progress logic
  const { saveQuizAttempt } = useProgressStore();
  const { overallStats, accuracy } = useProgressSelectors();
  
  // Coordinator for complex flows
  const { startQuizFlow, completeQuizSession } = useQuizStore();
};
```

### **Cross-Store Communication:**

```typescript
// Example: Complete quiz flow
const completeQuiz = () => {
  // 1. End session
  const sessionStore = useQuizSessionStore.getState();
  sessionStore.endQuiz();
  
  // 2. Save to progress
  const progressStore = useProgressStore.getState();
  progressStore.saveQuizAttempt(attempt);
  
  // 3. Update coordinator
  const coordinator = useQuizStore.getState();
  coordinator.logAction('quiz_completed');
};
```

## 🎯 **Implementation Tasks**

### **Quiz Generator Store:**
- [ ] `startGeneration()` - Set loading state, clear errors
- [ ] `setGenerationResult()` - Save generated quiz
- [ ] `setGenerationError()` - Handle AI generation errors
- [ ] `saveToHistory()` - Track generation history
- [ ] `updateDefaultSettings()` - Persist user preferences

### **Quiz Session Store:**
- [ ] `startQuiz()` - Initialize session with quiz data
- [ ] `submitAnswer()` - Record and validate answers
- [ ] `nextQuestion()` / `previousQuestion()` - Navigation logic
- [ ] `calculateScore()` - Score calculation algorithm
- [ ] `endQuiz()` - Session cleanup and finalization

### **Progress Store:**
- [ ] `saveQuizAttempt()` - Add attempt to history
- [ ] `updateUserProgress()` - Recalculate overall stats
- [ ] `updateTopicProgress()` - Topic-specific tracking
- [ ] `calculateStreak()` - Streak calculation logic
- [ ] `checkAchievements()` - Achievement unlock system

### **Quiz Coordinator Store:**
- [ ] `startQuizFlow()` - Orchestrate quiz start across stores
- [ ] `completeQuizSession()` - Coordinate completion flow
- [ ] `resetAllStores()` - Reset all stores to initial state

## ✨ **Benefits of This Architecture**

### **🎯 Single Responsibility**
- Each store has one clear purpose
- Easier to test and debug
- Better code organization

### **🔄 Reusability**
- Session store can work with any quiz source
- Progress store tracks all quiz types
- Generator store handles any AI service

### **🚀 Performance**
- Only relevant components re-render
- Smaller bundle chunks
- Better memory usage

### **🧪 Testability**
- Test each store independently
- Mock specific functionality
- Isolated unit tests

### **🔧 Maintainability**
- Clear separation of concerns
- Easy to extend functionality
- Simpler debugging

## 🎨 **Store Communication Patterns**

```typescript
// Pattern 1: Direct store access
const sessionStore = useQuizSessionStore();
const progressStore = useProgressStore();

// Pattern 2: Coordinator orchestration
const coordinator = useQuizStore();
coordinator.startQuizFlow(quiz); // Handles multiple stores

// Pattern 3: Cross-store subscriptions
useEffect(() => {
  const unsubscribe = useQuizSessionStore.subscribe(
    (state) => state.showResults,
    (showResults) => {
      if (showResults) {
        // Auto-save to progress when results shown
        const attempt = createAttemptFromSession();
        useProgressStore.getState().saveQuizAttempt(attempt);
      }
    }
  );
  return unsubscribe;
}, []);
```

This architecture gives you maximum flexibility and follows Zustand best practices! 🚀
