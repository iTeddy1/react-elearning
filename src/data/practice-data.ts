import { BaseQuizAttempt, Quiz } from '@/features/practice/type';

export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'React Fundamentals Quiz',
    description: 'Test your knowledge of React basics, JSX, and components',
    difficulty: 'Beginner',
    timeLimit: 10,
    topicId: 1,
    questions: [
      {
        id: 1,
        question: 'What is JSX in React?',
        options: [
          'A JavaScript extension that allows writing HTML-like syntax',
          'A CSS-in-JS library',
          'A state management tool',
          'A testing framework',
        ],
        correctAnswer: 0,
        explanation:
          'JSX is a syntax extension for JavaScript that allows you to write HTML-like syntax in your React components. It makes the code more readable and easier to write.',
        difficulty: 'Beginner',
      },
      {
        id: 2,
        question:
          'What is the correct way to create a functional component in React?',
        options: [
          'function MyComponent() { return <div>Hello</div>; }',
          'const MyComponent = () => { return <div>Hello</div>; }',
          'Both A and B are correct',
          'class MyComponent extends Component { render() { return <div>Hello</div>; } }',
        ],
        correctAnswer: 2,
        explanation:
          'Both function declarations and arrow functions are valid ways to create functional components in React. The fourth option is a class component, which is also valid but not a functional component.',
        difficulty: 'Beginner',
      },
      {
        id: 3,
        question: 'What are props in React?',
        options: [
          'Properties passed from parent to child components',
          'Internal component state',
          'CSS styling properties',
          'Event handlers',
        ],
        correctAnswer: 0,
        explanation:
          'Props (properties) are arguments passed from parent components to child components. They are read-only and help make components reusable.',
        difficulty: 'Beginner',
      },
      {
        id: 4,
        question: 'Which of the following is true about React components?',
        options: [
          'Components must always return multiple elements',
          'Component names must start with a lowercase letter',
          'Components must return a single root element or Fragment',
          'Components cannot accept props',
        ],
        correctAnswer: 2,
        explanation:
          'React components must return a single root element, or you can use React.Fragment or the shorthand <> </> to wrap multiple elements.',
        difficulty: 'Beginner',
      },
      {
        id: 5,
        question: 'What is the purpose of keys in React lists?',
        options: [
          'To style list items',
          'To help React identify which items have changed',
          'To sort the list',
          'To validate list data',
        ],
        correctAnswer: 1,
        explanation:
          'Keys help React identify which items have changed, are added, or are removed, making list updates more efficient.',
        difficulty: 'Beginner',
      },
    ],
  },
  {
    id: 2,
    title: 'State Management Challenge',
    description: 'Practice useState, useEffect, and state management concepts',
    difficulty: 'Intermediate',
    timeLimit: 15,
    topicId: 2,
    questions: [
      {
        id: 1,
        question: 'What happens when you call setState in React?',
        options: [
          'The component re-renders immediately',
          'The state is updated synchronously',
          'React schedules a re-render and may batch updates',
          'Nothing happens until the next render cycle',
        ],
        correctAnswer: 2,
        explanation:
          'When setState is called, React schedules a re-render and may batch multiple state updates for performance reasons.',
        difficulty: 'Intermediate',
      },
      {
        id: 2,
        question:
          'Which hook would you use to perform side effects in functional components?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation:
          'useEffect is the hook used to perform side effects in functional components, such as API calls, subscriptions, or manually changing the DOM.',
        difficulty: 'Intermediate',
      },
    ],
  },
  {
    id: 3,
    title: 'Hooks Deep Dive',
    description: 'Advanced questions on React hooks and custom hooks',
    difficulty: 'Advanced',
    timeLimit: 20,
    topicId: 7,
    questions: [
      {
        id: 1,
        question: 'What is the difference between useMemo and useCallback?',
        options: [
          'useMemo memoizes values, useCallback memoizes functions',
          'useMemo is for objects, useCallback is for primitives',
          'They are exactly the same',
          'useMemo is deprecated, useCallback is the new version',
        ],
        correctAnswer: 0,
        explanation:
          'useMemo memoizes the result of a computation, while useCallback memoizes a function itself to prevent unnecessary re-renders.',
        difficulty: 'Advanced',
      },
    ],
  },
  {
    id: 4,
    title: 'Component Lifecycle',
    description: 'Master component mounting, updating, and unmounting',
    difficulty: 'Intermediate',
    timeLimit: 12,
    questions: [
      {
        id: 1,
        question: 'In which lifecycle phase does componentDidMount execute?',
        options: [
          'Before the component is rendered',
          'After the component is mounted to the DOM',
          'During every re-render',
          'Before the component unmounts',
        ],
        correctAnswer: 1,
        explanation:
          'componentDidMount executes after the component is mounted to the DOM, making it ideal for API calls and setting up subscriptions.',
        difficulty: 'Intermediate',
      },
    ],
  },
  {
    id: 5,
    title: 'Event Handling',
    description: 'Practice handling user interactions and form events',
    difficulty: 'Beginner',
    timeLimit: 8,
    topicId: 3,
    questions: [
      {
        id: 1,
        question:
          'How do you prevent the default behavior of an event in React?',
        options: [
          'event.preventDefault()',
          'event.stopPropagation()',
          'return false',
          'event.cancel()',
        ],
        correctAnswer: 0,
        explanation:
          'event.preventDefault() is used to prevent the default behavior of an event, such as form submission or link navigation.',
        difficulty: 'Beginner',
      },
    ],
  },
  {
    id: 6,
    title: 'Context API Mastery',
    description: 'Test your understanding of React Context and providers',
    difficulty: 'Advanced',
    timeLimit: 18,
    topicId: 8,
    questions: [
      {
        id: 1,
        question: 'What problem does React Context solve?',
        options: [
          'Component styling',
          'Prop drilling',
          'Performance optimization',
          'Error handling',
        ],
        correctAnswer: 1,
        explanation:
          'React Context solves the prop drilling problem by allowing you to share data across the component tree without passing props through every level.',
        difficulty: 'Advanced',
      },
    ],
  },
];

// Mock user attempts data
export const mockQuizAttempts: BaseQuizAttempt[] = [
  {
    id: 1,
    quizId: 1,
    score: 87,
    completedAt: '2024-01-15T10:30:00Z',
    timeSpent: 480,
  },
  {
    id: 2,
    quizId: 1,
    score: 94,
    completedAt: '2024-01-18T14:20:00Z',
    timeSpent: 420,
  },
  {
    id: 3,
    quizId: 3,
    score: 76,
    completedAt: '2024-01-20T09:15:00Z',
    timeSpent: 890,
  },
  {
    id: 4,
    quizId: 5,
    score: 94,
    completedAt: '2024-01-22T16:45:00Z',
    timeSpent: 380,
  },
  {
    id: 5,
    quizId: 5,
    score: 88,
    completedAt: '2024-01-10T11:30:00Z',
    timeSpent: 420,
  },
];

// Helper functions
export const getQuizById = (id: number): Quiz | undefined => {
  return mockQuizzes.find((quiz) => quiz.id === id);
};

export const getQuizzesByDifficulty = (difficulty: string): Quiz[] => {
  if (difficulty === 'All') return mockQuizzes;
  return mockQuizzes.filter((quiz) => quiz.difficulty === difficulty);
};

export const getUserBestScore = (quizId: number): number | null => {
  const attempts = mockQuizAttempts.filter(
    (attempt) => attempt.quizId === quizId
  );
  if (attempts.length === 0) return null;
  return Math.max(...attempts.map((attempt) => attempt.score));
};

export const getUserAttemptCount = (quizId: number): number => {
  return mockQuizAttempts.filter((attempt) => attempt.quizId === quizId).length;
};

export const getCompletedQuizzesCount = (): number => {
  const completedQuizIds = new Set(
    mockQuizAttempts.map((attempt) => attempt.quizId)
  );
  return completedQuizIds.size;
};

export const getAverageScore = (): number => {
  if (mockQuizAttempts.length === 0) return 0;
  const totalScore = mockQuizAttempts.reduce(
    (sum, attempt) => sum + attempt.score,
    0
  );
  return Math.round(totalScore / mockQuizAttempts.length);
};

export const getTotalAttempts = (): number => {
  return mockQuizAttempts.length;
};
