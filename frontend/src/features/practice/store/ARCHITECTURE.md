# Zustand Store Architecture - Best Practices

## ✅ Current Architecture (GOOD)

### **Single Responsibility Principle**
Each store has ONE clear purpose:

```
quiz-generator-store.ts    → Quiz generation UI state
quiz-session-store.ts       → Active quiz session state  
quiz-review-store.ts        → Review display state
progress-store.ts           → User progress/history
quiz-coordinator-store.ts   → Cross-store coordination (optional)
```

### **Separation of Concerns**

#### ✅ **DO: Zustand for UI State Only**
```typescript
// GOOD: Pure UI state management
export const useQuizSessionStore = create<State & Actions>()(
  devtools((set, get) => ({
    // UI state
    currentQuestion: null,
    isLoading: false,
    selectedAnswer: null,
    
    // UI actions
    setCurrentQuestion: (question) => set({ currentQuestion: question }),
    setLoading: (loading) => set({ isLoading: loading }),
  }))
);
```

#### ❌ **DON'T: Server/AI Operations in Store**
```typescript
// BAD: AI service in store
const aiService = new AIService();

export const useQuizStore = create((set) => ({
  // ❌ ANTI-PATTERN
  generateQuiz: async (input) => {
    const result = await aiService.generate(input);
    set({ quiz: result });
  }
}));
```

#### ✅ **DO: React Query for Server State**
```typescript
// GOOD: Server operations in React Query
export const useGenerateQuizMutation = (callbacks?) => {
  const practiceAI = usePracticeAI(); // From provider
  const { setGenerating, setResult } = useQuizGeneratorStore(); // UI state only
  
  return useMutation({
    mutationFn: async (input) => {
      setGenerating(true);
      const quiz = await practiceAI.generateQuiz(input);
      return quiz;
    },
    onSuccess: (quiz) => {
      setResult(quiz); // Update UI state
      callbacks?.onSuccess?.(quiz);
    },
    onError: () => {
      setGenerating(false);
    }
  });
};
```

---

## 🔄 Store Communication Patterns

### **Question: Should Zustand stores call other Zustand stores?**

**Answer: It depends on the use case. Here are the patterns:**

### ✅ **Pattern 1: Independent Stores (BEST)**
Stores don't know about each other. Communication happens in components/hooks.

```typescript
// quiz-generator-store.ts
export const useQuizGeneratorStore = create((set) => ({
  quiz: null,
  setQuiz: (quiz) => set({ quiz }),
}));

// quiz-session-store.ts
export const useQuizSessionStore = create((set) => ({
  session: null,
  startSession: (quiz) => set({ session: { quiz, startTime: Date.now() } }),
}));

// ✅ Component coordinates between stores
function QuizPage() {
  const { quiz } = useQuizGeneratorStore();
  const { startSession } = useQuizSessionStore();
  
  const handleStartQuiz = () => {
    if (quiz) {
      startSession(quiz); // Component orchestrates
    }
  };
}
```

**Pros:**
- ✅ Clear separation of concerns
- ✅ Easy to test
- ✅ No circular dependencies
- ✅ Components control the flow

**Cons:**
- ⚠️ More boilerplate in components
- ⚠️ Logic spread across multiple files

---

### ✅ **Pattern 2: Coordinator Store (GOOD for complex flows)**
One store coordinates others for complex multi-step workflows.

```typescript
// quiz-coordinator-store.ts
export const useQuizCoordinator = create((set, get) => ({
  startQuizFlow: (quiz: Quiz) => {
    // Coordinate multiple stores
    const generatorStore = useQuizGeneratorStore.getState();
    const sessionStore = useQuizSessionStore.getState();
    const progressStore = useProgressStore.getState();
    
    generatorStore.setQuiz(quiz);
    sessionStore.startSession(quiz);
    progressStore.trackQuizStart(quiz.id);
    
    set({ isFlowActive: true });
  },
  
  completeQuizFlow: (score: number) => {
    const sessionStore = useQuizSessionStore.getState();
    const progressStore = useProgressStore.getState();
    
    sessionStore.endSession();
    progressStore.saveScore(score);
    
    set({ isFlowActive: false });
  }
}));

// Component uses coordinator
function QuizPage() {
  const { startQuizFlow } = useQuizCoordinator();
  
  return <button onClick={() => startQuizFlow(quiz)}>Start Quiz</button>;
}
```

**Pros:**
- ✅ Centralized workflow logic
- ✅ Less boilerplate in components
- ✅ Clear orchestration point

**Cons:**
- ⚠️ Coordinator knows about all stores (coupling)
- ⚠️ Can become a "god object"

**When to use:**
- Complex multi-step workflows
- Transaction-like operations across stores
- Audit logging requirements

---

### ❌ **Pattern 3: Direct Store Dependencies (AVOID)**
Stores directly import and call each other.

```typescript
// ❌ ANTI-PATTERN
import { useQuizSessionStore } from './quiz-session-store';

export const useQuizGeneratorStore = create((set) => ({
  generateAndStart: async (input) => {
    const quiz = await generateQuiz(input);
    set({ quiz });
    
    // ❌ BAD: Direct dependency
    useQuizSessionStore.getState().startSession(quiz);
  }
}));
```

**Problems:**
- ❌ Tight coupling
- ❌ Circular dependency risk
- ❌ Hard to test
- ❌ Hidden side effects
- ❌ Breaks single responsibility

---

## 📊 Comparison: When to Use Which Pattern

| Scenario | Pattern | Why |
|----------|---------|-----|
| Simple quiz generation | **Pattern 1** | Clear flow, no complex orchestration |
| Quiz generation + session start | **Pattern 1** | Component can handle both |
| Quiz generation + session + progress + analytics | **Pattern 2** | Too complex for component |
| Transaction-like operations | **Pattern 2** | Need atomic operations |
| Cross-cutting concerns (logging, audit) | **Pattern 2** | Centralized tracking |
| Independent features | **Pattern 1** | Keep them decoupled |

---

## 🏗️ Your Current Implementation Review

### **Current Structure:**
```
quiz-generator-store.ts     → Quiz generation UI state
quiz-session-store.ts       → Session UI state
quiz-review-store.ts        → Review UI state
progress-store.ts           → Progress tracking
quiz-coordinator-store.ts   → Optional coordinator
quiz-store.ts               → Re-exports (index file)
```

### **Assessment:**

#### ✅ **What's Good:**
1. **Clear separation**: Each store has one responsibility
2. **No direct dependencies**: Stores don't call each other
3. **UI state only**: After our fixes, all AI calls are in React Query
4. **Index file for convenience**: `quiz-store.ts` re-exports for easy imports

#### ⚠️ **What Could Be Improved:**

1. **Coordinator Store Usage**
   - You have `quiz-coordinator-store.ts` but it's not widely used
   - **Recommendation**: Either use it consistently OR remove it
   
   **Option A: Use Coordinator**
   ```typescript
   // In components, use coordinator for complex flows
   function QuizPage() {
     const { startQuizFlow } = useQuizCoordinator();
     // Not: const { setQuiz } = useQuizGeneratorStore();
   }
   ```
   
   **Option B: Remove Coordinator**
   ```typescript
   // If flows are simple, components can orchestrate
   function QuizPage() {
     const { setQuiz } = useQuizGeneratorStore();
     const { startSession } = useQuizSessionStore();
     
     const handleStart = () => {
       setQuiz(quiz);
       startSession(quiz);
     };
   }
   ```

2. **Quiz Store as Index**
   - Currently `quiz-store.ts` is just re-exports
   - **Recommendation**: Rename to `index.ts` to make intent clearer
   
   ```typescript
   // src/features/practice/store/index.ts
   export { useQuizGeneratorStore } from './quiz-generator-store';
   export { useQuizSessionStore } from './quiz-session-store';
   export { useQuizReviewStore } from './quiz-review-store';
   export { useProgressStore } from './progress-store';
   export { useQuizCoordinator } from './quiz-coordinator-store';
   
   export type { GenerateQuizInput } from './quiz-generator-store';
   // ... other types
   ```

---

## 🎯 Recommended Architecture for Your Use Case

Based on your quiz feature complexity, I recommend **Pattern 1 (Independent Stores)** with optional coordinator for specific complex flows:

### **Default: Pattern 1 (Independent)**
```typescript
// Component handles simple flows
function CreateQuizForm() {
  const { setGenerating, setResult } = useQuizGeneratorStore();
  const generateMutation = useGenerateQuizMutation({
    onSuccess: (quiz) => setResult(quiz)
  });
  
  return <form onSubmit={() => generateMutation.mutate(input)} />;
}
```

### **For Complex Flows: Use Coordinator**
```typescript
// Coordinator for complete quiz lifecycle
export const useQuizCoordinator = create((set) => ({
  completeQuiz: (quiz: Quiz, answers: Answer[]) => {
    // Coordinate multiple stores atomically
    const { setReview } = useQuizReviewStore.getState();
    const { endSession } = useQuizSessionStore.getState();
    const { saveAttempt } = useProgressStore.getState();
    
    endSession();
    saveAttempt({ quiz, answers, completedAt: new Date() });
    // Review will be set by React Query mutation
    
    set({ lastCompletedQuiz: quiz.id });
  }
}));
```

---

## 📝 Summary: Best Practices

### ✅ **DO:**
1. Use Zustand ONLY for UI state
2. Use React Query for ALL server/AI operations
3. Keep stores independent by default
4. Use coordinator pattern for complex multi-store workflows
5. Inject services via React Context (Provider pattern)
6. Components orchestrate simple flows
7. Test stores in isolation

### ❌ **DON'T:**
1. Create AI/API service instances in stores
2. Make async server calls in stores
3. Have stores directly import/call other stores (unless coordinator)
4. Mix server state with UI state
5. Use stores as a replacement for React Query
6. Create circular dependencies between stores
7. Put business logic in stores (keep them as state containers)

---

## 🔧 Migration Checklist

- [x] ✅ Remove AI service from `quiz-generator-store.ts`
- [x] ✅ Remove AI service from `quiz-review-store.ts`
- [x] ✅ Remove AI service from `interview-session-store.ts`
- [x] ✅ Move all AI operations to React Query mutations
- [x] ✅ Update components to use mutations instead of store methods
- [ ] ⚠️ Decide: Keep or remove `quiz-coordinator-store.ts`?
- [ ] ⚠️ Consider: Rename `quiz-store.ts` to `index.ts`
- [ ] ⚠️ Add: Unit tests for stores
- [ ] ⚠️ Add: Integration tests for complex flows

---

## 🎓 Learning Resources

1. **Zustand Best Practices**: https://github.com/pmndrs/zustand#best-practices
2. **React Query + Zustand**: https://tkdodo.eu/blog/react-query-and-forms
3. **State Colocation**: https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster
4. **Separation of Concerns**: https://www.patterns.dev/posts/presentational-container-pattern

---

**Last Updated**: After architecture fixes (Interview & Practice features)
**Status**: ✅ All stores now follow best practices - UI state only!
