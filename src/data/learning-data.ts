export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  description?: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  lessons: Lesson[];
  completed: boolean;
  thumbnail?: string;
}

export const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'React Fundamentals',
    description:
      'Learn the basics of React including components, JSX, and props',
    difficulty: 'Beginner',
    estimatedTime: '2 hours',
    completed: false,
    lessons: [
      { id: 1, title: 'What is React?', duration: '15 min', completed: true },
      {
        id: 2,
        title: 'Setting up a React Project',
        duration: '20 min',
        completed: true,
      },
      {
        id: 3,
        title: 'Your First Component',
        duration: '15 min',
        completed: false,
      },
      {
        id: 4,
        title: 'Understanding JSX',
        duration: '20 min',
        completed: false,
      },
      {
        id: 5,
        title: 'Props and Data Flow',
        duration: '25 min',
        completed: false,
      },
      {
        id: 6,
        title: 'Component Composition',
        duration: '20 min',
        completed: false,
      },
      {
        id: 7,
        title: 'Styling React Components',
        duration: '15 min',
        completed: false,
      },
      {
        id: 8,
        title: 'Practice Project',
        duration: '10 min',
        completed: false,
      },
    ],
  },
  {
    id: 2,
    title: 'State and Lifecycle',
    description:
      'Master React state management and component lifecycle methods',
    difficulty: 'Beginner',
    estimatedTime: '3 hours',
    completed: false,
    lessons: [
      {
        id: 1,
        title: 'Understanding State',
        duration: '20 min',
        completed: false,
      },
      { id: 2, title: 'useState Hook', duration: '25 min', completed: false },
      { id: 3, title: 'Event Handling', duration: '15 min', completed: false },
      {
        id: 4,
        title: 'Component Lifecycle',
        duration: '30 min',
        completed: false,
      },
      { id: 5, title: 'useEffect Hook', duration: '35 min', completed: false },
      {
        id: 6,
        title: 'Cleanup Functions',
        duration: '20 min',
        completed: false,
      },
      { id: 7, title: 'State Updates', duration: '25 min', completed: false },
      {
        id: 8,
        title: 'State Best Practices',
        duration: '15 min',
        completed: false,
      },
      {
        id: 9,
        title: 'Mini Project: Counter App',
        duration: '20 min',
        completed: false,
      },
      {
        id: 10,
        title: 'Mini Project: Todo List',
        duration: '25 min',
        completed: false,
      },
      {
        id: 11,
        title: 'State Debugging',
        duration: '15 min',
        completed: false,
      },
      {
        id: 12,
        title: 'Practice Exercises',
        duration: '20 min',
        completed: false,
      },
    ],
  },
  {
    id: 3,
    title: 'Handling Events',
    description: 'Learn how to handle user interactions and events in React',
    difficulty: 'Beginner',
    estimatedTime: '1.5 hours',
    completed: true,
    lessons: [
      { id: 1, title: 'Event Basics', duration: '15 min', completed: true },
      { id: 2, title: 'onClick Events', duration: '10 min', completed: true },
      { id: 3, title: 'Form Events', duration: '20 min', completed: true },
      { id: 4, title: 'Keyboard Events', duration: '15 min', completed: true },
      { id: 5, title: 'Mouse Events', duration: '10 min', completed: true },
      { id: 6, title: 'Event Object', duration: '15 min', completed: true },
    ],
  },
  {
    id: 4,
    title: 'Conditional Rendering',
    description:
      'Master different techniques for conditional rendering in React',
    difficulty: 'Intermediate',
    estimatedTime: '2 hours',
    completed: false,
    lessons: [
      { id: 1, title: 'If Statements', duration: '15 min', completed: false },
      {
        id: 2,
        title: 'Ternary Operators',
        duration: '20 min',
        completed: false,
      },
      {
        id: 3,
        title: 'Logical AND Operator',
        duration: '15 min',
        completed: false,
      },
      {
        id: 4,
        title: 'Switch Statements',
        duration: '20 min',
        completed: false,
      },
      {
        id: 5,
        title: 'Conditional Components',
        duration: '25 min',
        completed: false,
      },
      { id: 6, title: 'Loading States', duration: '20 min', completed: false },
      {
        id: 7,
        title: 'Error Boundaries',
        duration: '25 min',
        completed: false,
      },
    ],
  },
  {
    id: 5,
    title: 'Lists and Keys',
    description: 'Learn how to render lists efficiently and understand keys',
    difficulty: 'Intermediate',
    estimatedTime: '1.5 hours',
    completed: false,
    lessons: [
      { id: 1, title: 'Rendering Lists', duration: '20 min', completed: false },
      {
        id: 2,
        title: 'Understanding Keys',
        duration: '25 min',
        completed: false,
      },
      { id: 3, title: 'Dynamic Lists', duration: '15 min', completed: false },
      {
        id: 4,
        title: 'List Performance',
        duration: '20 min',
        completed: false,
      },
      { id: 5, title: 'Nested Lists', duration: '20 min', completed: false },
    ],
  },
  {
    id: 6,
    title: 'Forms and Controlled Components',
    description: 'Build interactive forms with controlled components',
    difficulty: 'Intermediate',
    estimatedTime: '3 hours',
    completed: false,
    lessons: [
      {
        id: 1,
        title: 'Controlled vs Uncontrolled',
        duration: '20 min',
        completed: false,
      },
      { id: 2, title: 'Text Inputs', duration: '15 min', completed: false },
      { id: 3, title: 'Textareas', duration: '10 min', completed: false },
      {
        id: 4,
        title: 'Select Dropdowns',
        duration: '15 min',
        completed: false,
      },
      {
        id: 5,
        title: 'Checkboxes and Radios',
        duration: '20 min',
        completed: false,
      },
      { id: 6, title: 'Form Validation', duration: '30 min', completed: false },
      { id: 7, title: 'Form Submission', duration: '25 min', completed: false },
      { id: 8, title: 'Form Libraries', duration: '20 min', completed: false },
      { id: 9, title: 'File Uploads', duration: '25 min', completed: false },
      { id: 10, title: 'Form Project', duration: '30 min', completed: false },
    ],
  },
  {
    id: 7,
    title: 'React Hooks',
    description: 'Master useState, useEffect, and other essential hooks',
    difficulty: 'Advanced',
    estimatedTime: '4 hours',
    completed: false,
    lessons: [
      {
        id: 1,
        title: 'Introduction to Hooks',
        duration: '20 min',
        completed: false,
      },
      {
        id: 2,
        title: 'useState Deep Dive',
        duration: '25 min',
        completed: false,
      },
      {
        id: 3,
        title: 'useEffect Deep Dive',
        duration: '30 min',
        completed: false,
      },
      { id: 4, title: 'useContext Hook', duration: '25 min', completed: false },
      { id: 5, title: 'useReducer Hook', duration: '30 min', completed: false },
      { id: 6, title: 'useMemo Hook', duration: '20 min', completed: false },
      {
        id: 7,
        title: 'useCallback Hook',
        duration: '20 min',
        completed: false,
      },
      { id: 8, title: 'useRef Hook', duration: '15 min', completed: false },
      {
        id: 9,
        title: 'useImperativeHandle',
        duration: '15 min',
        completed: false,
      },
      {
        id: 10,
        title: 'useLayoutEffect',
        duration: '15 min',
        completed: false,
      },
      { id: 11, title: 'Custom Hooks', duration: '30 min', completed: false },
      { id: 12, title: 'Hook Rules', duration: '10 min', completed: false },
      { id: 13, title: 'Hook Patterns', duration: '25 min', completed: false },
      { id: 14, title: 'Hook Testing', duration: '20 min', completed: false },
      { id: 15, title: 'Hooks Project', duration: '40 min', completed: false },
    ],
  },
  {
    id: 8,
    title: 'Context API',
    description: 'Learn state management with React Context API',
    difficulty: 'Advanced',
    estimatedTime: '2.5 hours',
    completed: false,
    lessons: [
      {
        id: 1,
        title: 'What is Context?',
        duration: '20 min',
        completed: false,
      },
      {
        id: 2,
        title: 'Creating Context',
        duration: '15 min',
        completed: false,
      },
      {
        id: 3,
        title: 'Context Provider',
        duration: '20 min',
        completed: false,
      },
      {
        id: 4,
        title: 'Consuming Context',
        duration: '15 min',
        completed: false,
      },
      {
        id: 5,
        title: 'Multiple Contexts',
        duration: '25 min',
        completed: false,
      },
      {
        id: 6,
        title: 'Context Best Practices',
        duration: '20 min',
        completed: false,
      },
      {
        id: 7,
        title: 'Context vs Props',
        duration: '15 min',
        completed: false,
      },
      { id: 8, title: 'Context Project', duration: '30 min', completed: false },
    ],
  },
  {
    id: 9,
    title: 'Custom Hooks',
    description: 'Create reusable logic with custom React hooks',
    difficulty: 'Advanced',
    estimatedTime: '3 hours',
    completed: false,
    lessons: [
      {
        id: 1,
        title: 'Why Custom Hooks?',
        duration: '15 min',
        completed: false,
      },
      {
        id: 2,
        title: 'Creating Your First Hook',
        duration: '20 min',
        completed: false,
      },
      { id: 3, title: 'Hook Parameters', duration: '15 min', completed: false },
      {
        id: 4,
        title: 'Hook Return Values',
        duration: '15 min',
        completed: false,
      },
      {
        id: 5,
        title: 'useLocalStorage Hook',
        duration: '25 min',
        completed: false,
      },
      { id: 6, title: 'useFetch Hook', duration: '30 min', completed: false },
      { id: 7, title: 'useToggle Hook', duration: '15 min', completed: false },
      {
        id: 8,
        title: 'Hook Composition',
        duration: '20 min',
        completed: false,
      },
      {
        id: 9,
        title: 'Testing Custom Hooks',
        duration: '25 min',
        completed: false,
      },
    ],
  },
];

// Helper function to get topic by id
export const getTopicById = (id: number): Topic | undefined => {
  return mockTopics.find((topic) => topic.id === id);
};

// Helper function to get completed topics count
export const getCompletedTopicsCount = (): number => {
  return mockTopics.filter((topic) => topic.completed).length;
};

// Helper function to calculate overall progress
export const getOverallProgress = (): number => {
  const totalTopics = mockTopics.length;
  const completedTopics = getCompletedTopicsCount();
  return Math.round((completedTopics / totalTopics) * 100);
};
