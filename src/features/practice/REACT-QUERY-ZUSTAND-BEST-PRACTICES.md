# React Query + Zustand Error & Success Handling - Best Practices

This document explains the comprehensive error and success handling implementation using React Query combined with Zustand stores.

## 🎯 Overview

Our implementation provides:
- **Proper async error handling** with React Query mutations
- **Success state management** with Zustand stores  
- **Loading states** and UI feedback
- **Cache invalidation** and optimistic updates
- **Centralized notification system**
- **Service layer abstraction**

## 🏗️ Architecture

### 1. Service Layer (`QuizService`)
```typescript
// Enhanced service with proper error handling
export class QuizService {
  async generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    // Returns promise for React Query to handle
  }
  
  async saveQuizAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    // Handles API calls with proper error propagation
  }
}
```

### 2. React Query Hooks (`use-quiz-queries.ts`)
```typescript
// Generate quiz with comprehensive error/success handling
export const useGenerateQuizMutation = () => {
  return useMutation({
    mutationFn: async (input: GenerateQuizInput): Promise<Quiz> => {
      return await quizService.generateQuiz(input);
    },
    onSuccess: (quiz: Quiz) => {
      console.log('✅ Quiz generated successfully:', quiz.title);
      // Invalidate related queries
      // Store in React Query cache
    },
    onError: (error: Error) => {
      console.error('❌ Quiz generation failed:', error.message);
      // Error handling and notifications
    },
    onSettled: () => {
      // Always runs regardless of success/error
    },
  });
};
```

### 3. Zustand Store Integration
```typescript
// Stores handle local state while React Query manages server state
const generateMutation = useGenerateQuizMutation();
const { startQuiz } = useQuizSessionStore(); // Local state

// On success, update both React Query cache AND Zustand store
onSuccess: (quiz) => {
  queryClient.setQueryData(quizKeys.detail(quiz.id), quiz); // Cache
  startQuiz(quiz); // Local state
}
```

## ✨ Best Practices Implemented

### 1. **Separation of Concerns**
- **React Query**: Server state, caching, error/loading states
- **Zustand**: Local UI state, user preferences, session data  
- **Service Layer**: Business logic, API abstraction

### 2. **Error Handling Strategy**
```typescript
// Service layer throws detailed errors
throw new Error('Failed to generate quiz: Invalid topic');

// React Query catches and provides to UI
onError: (error: Error) => {
  notifications.showError(error.message);
  // Log to monitoring service
}

// Zustand stores handle error states for UI
set({ isGenerating: false, generationError: error.message });
```

### 3. **Success Flow**
```typescript
// 1. Service completes successfully
const quiz = await quizService.generateQuiz(input);

// 2. React Query onSuccess runs
onSuccess: (quiz) => {
  // Update cache
  queryClient.setQueryData(quizKeys.detail(quiz.id), quiz);
  
  // Invalidate related queries
  queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
  
  // Show success notification
  notifications.showSuccess('Quiz generated successfully!');
}

// 3. Component can start quiz session
startQuiz(quiz);
navigate(`/practice/${quiz.id}`);
```

### 4. **Loading States**
```typescript
// React Query provides loading states
const generateMutation = useGenerateQuizMutation();

// Use in UI
<Button disabled={generateMutation.isPending}>
  {generateMutation.isPending && <Loader2 className="animate-spin" />}
  Generate Quiz
</Button>
```

### 5. **Cache Management**
```typescript
// Invalidate queries when data changes
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
  queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
}

// Optimistic updates for better UX
onMutate: async (newAttempt) => {
  await queryClient.cancelQueries({ queryKey: quizKeys.stats() });
  // Update cache immediately
}
```

## 🔄 Usage Examples

### 1. Generate Quiz with Error Handling
```typescript
const generateMutation = useGenerateQuizMutation();

const handleSubmit = (data: FormData) => {
  generateMutation.mutate({
    topic: data.topic,
    difficulty: data.difficulty,
    questionCount: data.numQuestions,
    language: 'en',
  });
};

// UI automatically shows loading/error/success states
```

### 2. Generate and Start Quiz Flow  
```typescript
const generateAndStartMutation = useGenerateAndStartQuizMutation();

generateAndStartMutation.mutate(input); // Automatically navigates on success
```

### 3. Submit Quiz with Fallback
```typescript
const submitMutation = useSubmitQuizMutation();

// Saves to API AND local store, with fallback to local on API failure
submitMutation.mutate(quizAttempt);
```

## 🎨 UI Integration

### Error Display
```typescript
// Form shows mutation errors automatically
{generateMutation.isError && (
  <div className="text-red-600">
    Error: {generateMutation.error?.message}
  </div>
)}
```

### Success Feedback  
```typescript
// Success states trigger notifications and navigation
useEffect(() => {
  if (mutation.isSuccess) {
    notifications.showSuccess('Operation completed!');
  }
}, [mutation.isSuccess]);
```

### Loading States
```typescript
// Proper loading UI with pending states
<Button disabled={mutation.isPending}>
  {mutation.isPending && <Spinner />}
  {mutation.isPending ? 'Processing...' : 'Submit'}
</Button>
```

## 🧪 Testing the Implementation

Visit the practice page to see the **Quiz Error & Success Demo** component that demonstrates:

1. **Generate Quiz Only** - Shows React Query mutation with success/error states
2. **Generate & Start Quiz** - Full flow with navigation
3. **Submit Quiz Attempt** - API simulation with fallback to local storage  
4. **Test Notifications** - Notification system demonstration
5. **Store States** - Live view of Zustand store states

## 📊 Monitoring and Debugging

### Console Logging
- ✅ Success operations logged with green checkmarks
- ❌ Error operations logged with red X marks  
- 🔄 State changes logged with blue circles
- ℹ️ Info messages for debugging

### React Query DevTools
```typescript
// Add to your app for debugging
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

### Zustand DevTools
```typescript
// Already configured in stores
export const useQuizStore = create<State & Actions>()(
  devtools((set, get) => ({ ... }), { name: 'quiz-store' })
);
```

## 🚀 Performance Benefits

1. **Automatic Caching** - React Query caches server responses
2. **Background Refetching** - Keeps data fresh automatically  
3. **Optimistic Updates** - UI updates before API confirmation
4. **Request Deduplication** - Prevents duplicate API calls
5. **Garbage Collection** - Automatically cleans unused cache

## 📚 Key Files

- **Service**: `src/features/practice/services/quiz-service.ts`
- **Hooks**: `src/features/practice/hooks/use-quiz-queries.ts`  
- **Demo**: `src/features/practice/components/quiz-error-success-demo.tsx`
- **Form**: `src/features/practice/components/create-quiz-form.tsx`

This implementation provides a robust, scalable foundation for error and success handling in React applications using the powerful combination of React Query and Zustand!
