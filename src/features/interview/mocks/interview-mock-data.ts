import { InterviewFeedback } from '../types';
import { AnswerAnalysis } from '../services/ai/interview-ai-service';

// Mock Interview Questions by Role and Difficulty
export const mockInterviewQuestions = {
  'Frontend Developer': {
    beginner: [
      {
        id: 'fe-bg-001',
        text: 'What is the difference between let, const, and var in JavaScript?',
        category: 'Technical',
        question:
          'What is the difference between let, const, and var in JavaScript?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'Variable declarations',
          'Block scope',
          'Hoisting',
          'Temporal dead zone',
        ],
        followUpQuestions: [
          'Can you explain what hoisting means in JavaScript?',
          'When would you use const versus let?',
        ],
      },
      {
        id: 'fe-bg-002',
        text: 'Tell me about a time when you had to learn a new technology quickly.',
        category: 'Behavioral',
        question:
          'Tell me about a time when you had to learn a new technology quickly. How did you approach it?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'Learning process',
          'Time management',
          'Problem-solving',
          'Adaptability',
        ],
        followUpQuestions: [
          'What resources did you use to learn this technology?',
          'How do you typically approach learning new technical concepts?',
        ],
      },
      {
        id: 'fe-bg-003',
        text: 'How would you explain React to someone new?',
        category: 'Technical',
        question:
          'How would you explain what React is to someone who has never heard of it?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'Component-based architecture',
          'Virtual DOM',
          'State management',
          'UI library',
        ],
        followUpQuestions: [
          'What are the main benefits of using React?',
          'How does React differ from vanilla JavaScript for UI development?',
        ],
      },
      {
        id: 'fe-bg-004',
        text: 'How would you debug slow website performance?',
        category: 'Situational',
        question:
          'If a user reports that the website is loading slowly, how would you investigate and solve this issue?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'Performance debugging',
          'Browser developer tools',
          'Network analysis',
          'Optimization techniques',
        ],
        followUpQuestions: [
          'What tools would you use to measure performance?',
          'What are some common causes of slow loading times?',
        ],
      },
      {
        id: 'fe-bg-005',
        text: 'Explain CSS specificity and its importance.',
        category: 'Technical',
        question: 'What is CSS specificity and why is it important?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'CSS specificity rules',
          'Selector weight',
          'Inheritance',
          'Cascade',
        ],
        followUpQuestions: [
          'How do you calculate specificity values?',
          'What happens when two CSS rules have the same specificity?',
        ],
      },
    ],
    intermediate: [
      {
        id: 'fe-int-001',
        text: 'Explain JavaScript closures with practical examples.',
        category: 'Technical',
        question:
          'Explain the concept of closures in JavaScript and provide a practical use case.',
        difficulty: 'intermediate' as const,
        expectedTopics: [
          'Lexical scoping',
          'Function scope',
          'Memory management',
          'Module pattern',
        ],
        followUpQuestions: [
          'What are some potential memory leak issues with closures?',
          'How do closures relate to the module pattern?',
        ],
      },
      {
        id: 'fe-int-002',
        text: 'How does React reconciliation work?',
        category: 'Technical',
        question:
          "How does React's reconciliation algorithm work, and why is the key prop important?",
        difficulty: 'intermediate' as const,
        expectedTopics: [
          'Virtual DOM diffing',
          'Reconciliation',
          'Key prop',
          'Performance optimization',
        ],
        followUpQuestions: [
          "What happens when you don't provide keys in a list?",
          'How does React decide when to reuse or create new DOM elements?',
        ],
      },
      {
        id: 'fe-int-003',
        text: 'Describe a challenging debugging experience.',
        category: 'Behavioral',
        question:
          'Describe a challenging bug you encountered and how you debugged it.',
        difficulty: 'intermediate' as const,
        expectedTopics: [
          'Debugging process',
          'Problem-solving',
          'Tools and techniques',
          'Root cause analysis',
        ],
        followUpQuestions: [
          'What debugging tools did you use?',
          'How did you prevent similar issues in the future?',
        ],
      },
    ],
    advanced: [
      {
        id: 'fe-adv-001',
        text: 'Design a performant infinite scroll component.',
        category: 'Technical',
        question:
          'Design a performant infinite scroll component for a large dataset. What considerations would you make?',
        difficulty: 'advanced' as const,
        expectedTopics: [
          'Virtual scrolling',
          'Performance optimization',
          'Memory management',
          'User experience',
        ],
        followUpQuestions: [
          'How would you handle variable item heights?',
          'What strategies would you use for data fetching and caching?',
        ],
      },
    ],
  },
  'Backend Developer': {
    beginner: [
      {
        id: 'be-bg-001',
        text: 'Difference between SQL and NoSQL databases.',
        category: 'Technical',
        question:
          'What is the difference between SQL and NoSQL databases? When would you use each?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'Database types',
          'ACID properties',
          'Scalability',
          'Data consistency',
        ],
        followUpQuestions: [
          'Can you give examples of SQL and NoSQL databases?',
          'What are the ACID properties and why are they important?',
        ],
      },
    ],
    intermediate: [
      {
        id: 'be-int-001',
        text: 'Design a caching strategy for high-traffic apps.',
        category: 'Technical',
        question:
          'How would you design a caching strategy for a high-traffic web application?',
        difficulty: 'intermediate' as const,
        expectedTopics: [
          'Caching layers',
          'Cache invalidation',
          'Redis',
          'CDN',
          'Database caching',
        ],
        followUpQuestions: [
          'What are the different types of cache invalidation strategies?',
          'How do you handle cache consistency in a distributed system?',
        ],
      },
    ],
    advanced: [
      {
        id: 'be-adv-001',
        text: 'Design a system for millions of users.',
        category: 'Technical',
        question:
          'Design a distributed system that can handle millions of users. What are your key architectural considerations?',
        difficulty: 'advanced' as const,
        expectedTopics: [
          'Scalability',
          'Load balancing',
          'Database sharding',
          'Microservices',
          'CAP theorem',
        ],
        followUpQuestions: [
          'How would you handle data consistency across multiple services?',
          'What monitoring and observability strategies would you implement?',
        ],
      },
    ],
  },
  'Full Stack Developer': {
    beginner: [
      {
        id: 'fs-bg-001',
        text: 'How do frontend and backend communicate?',
        category: 'Technical',
        question:
          'How do frontend and backend communicate in a web application?',
        difficulty: 'beginner' as const,
        expectedTopics: [
          'Client-server communication',
          'HTTP requests',
          'APIs',
          'JSON',
        ],
        followUpQuestions: [
          'What happens when you submit a form on a website?',
          'How does authentication work between frontend and backend?',
        ],
      },
    ],
    intermediate: [
      {
        id: 'fs-int-001',
        text: 'Implement user authentication in full-stack app.',
        category: 'Technical',
        question:
          'Describe how you would implement user authentication in a full-stack application.',
        difficulty: 'intermediate' as const,
        expectedTopics: [
          'JWT tokens',
          'Session management',
          'Password hashing',
          'Security best practices',
        ],
        followUpQuestions: [
          'How do you handle token refresh and expiration?',
          'What security measures would you implement to protect user data?',
        ],
      },
    ],
    advanced: [
      {
        id: 'fs-adv-001',
        text: 'Design real-time collaborative application.',
        category: 'Technical',
        question:
          'Design the architecture for a real-time collaborative application like Google Docs.',
        difficulty: 'advanced' as const,
        expectedTopics: [
          'Real-time communication',
          'WebSockets',
          'Conflict resolution',
          'Operational transformation',
        ],
        followUpQuestions: [
          'How would you handle concurrent edits from multiple users?',
          'What happens when users go offline and come back online?',
        ],
      },
    ],
  },
};

// Mock Answer Analysis Results
export const mockAnswerAnalysis: Record<string, AnswerAnalysis> = {
  'fe-bg-001': {
    transcription:
      'Let, const, and var are all ways to declare variables in JavaScript. Var is the old way and has function scope, while let and const have block scope. Const is for constants that cannot be reassigned, and let is for variables that can be changed.',
    score: 78,
    analysis: {
      relevance: 85,
      technicalAccuracy: 80,
      clarity: 75,
      completeness: 70,
      professionalism: 80,
    },
    strengths: [
      'Correctly identified the main differences between variable declarations',
      'Mentioned scope differences accurately',
      'Clear and concise explanation',
    ],
    weaknesses: [
      "Didn't mention hoisting behavior",
      'Could have provided examples',
      'Missing temporal dead zone concept',
    ],
    suggestions: [
      'Add practical examples to illustrate the differences',
      'Explain hoisting behavior for each declaration type',
      'Discuss the temporal dead zone for let and const',
    ],
    feedback:
      'Good basic understanding of variable declarations. The explanation covers the main differences but could be enhanced with examples and deeper concepts like hoisting.',
  },
};

// Mock Interview Reviews (using project's InterviewFeedback type)
export const mockInterviewReviews: Record<string, InterviewFeedback> = {
  'frontend-beginner-good': {
    overallScore: 78,
    strengths: [
      'Strong communication skills and professional demeanor',
      'Good foundational knowledge of JavaScript concepts',
      'Demonstrates ability to learn independently',
      'Clear and structured responses',
    ],
    weaknesses: [
      'Some gaps in advanced technical concepts',
      'Could benefit from more practical examples',
      'Room for improvement in problem-solving depth',
    ],
    improvements: [
      'Study advanced JavaScript concepts like closures and prototypes',
      'Practice coding problems to improve problem-solving skills',
      'Build more complex projects to gain practical experience',
    ],
    recommendations: [
      'Consider mentoring to accelerate growth',
      'Focus on hands-on project experience',
      'Join developer communities for peer learning',
      'Take online courses for advanced concepts',
    ],
  },
  'frontend-intermediate-excellent': {
    overallScore: 88,
    strengths: [
      'Excellent technical knowledge across frontend technologies',
      'Strong problem-solving abilities with systematic approach',
      'Great communication skills with clear explanations',
      'Good understanding of performance and optimization',
      'Shows depth in React and JavaScript fundamentals',
    ],
    weaknesses: [
      'Could improve knowledge of testing methodologies',
      'Room for growth in system design thinking',
      'Could benefit from more DevOps understanding',
    ],
    improvements: [
      'Explore advanced testing strategies and tools',
      'Study system design principles for scalable applications',
      'Learn about CI/CD and deployment strategies',
    ],
    recommendations: [
      'Ready for senior-level responsibilities',
      'Consider leading technical initiatives',
      'Mentor junior developers',
      'Contribute to open source projects',
    ],
  },
  'backend-intermediate-average': {
    overallScore: 72,
    strengths: [
      'Good foundational understanding of backend concepts',
      'Professional communication style',
      'Shows willingness to learn',
    ],
    weaknesses: [
      'Limited depth in technical explanations',
      'Lacks practical experience examples',
      'Could improve problem-solving approach',
      'Missing knowledge of advanced concepts',
    ],
    improvements: [
      'Gain more hands-on experience with database design',
      'Study system architecture and scalability concepts',
      'Practice explaining technical concepts with examples',
    ],
    recommendations: [
      'Additional learning and practice needed',
      'Consider pair programming with senior developers',
      'Work on more complex backend projects',
      'Focus on practical application of concepts',
    ],
  },
};

// Helper function to get mock questions by role and difficulty
export const getMockQuestionsByRole = (
  role: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  count: number = 5
): any[] => {
  const normalizedRole = role.toLowerCase().includes('frontend')
    ? 'Frontend Developer'
    : role.toLowerCase().includes('backend')
      ? 'Backend Developer'
      : role.toLowerCase().includes('full')
        ? 'Full Stack Developer'
        : 'Frontend Developer'; // Default fallback

  const difficultyMap = {
    Beginner: 'beginner',
    Intermediate: 'intermediate',
    Advanced: 'advanced',
  } as const;

  const mockDifficulty = difficultyMap[difficulty];
  const questions =
    mockInterviewQuestions[normalizedRole]?.[mockDifficulty] ||
    mockInterviewQuestions['Frontend Developer'][mockDifficulty];

  // Return requested number of questions, cycling through if necessary
  const result: any[] = [];
  for (let i = 0; i < count; i++) {
    const sourceQuestion = questions[i % questions.length];
    result.push({
      ...sourceQuestion,
      // Convert to match AI service interface - use uppercase difficulty
      id: `${sourceQuestion.id}-${i}`,
      question: sourceQuestion.question,
      category: sourceQuestion.category,
      difficulty: difficulty, // Use the original difficulty parameter
      expectedTopics: sourceQuestion.expectedTopics,
      followUpQuestions: sourceQuestion.followUpQuestions,
    });
  }

  return result;
};

// Helper function to get mock answer analysis
export const getMockAnswerAnalysis = (questionId: string): AnswerAnalysis => {
  return (
    mockAnswerAnalysis[questionId] || {
      transcription:
        "This is a sample transcription of the candidate's response to the interview question. The candidate provided a thoughtful answer that demonstrates understanding of the topic.",
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      analysis: {
        relevance: Math.floor(Math.random() * 20) + 80,
        technicalAccuracy: Math.floor(Math.random() * 25) + 75,
        clarity: Math.floor(Math.random() * 20) + 80,
        completeness: Math.floor(Math.random() * 25) + 75,
        professionalism: Math.floor(Math.random() * 15) + 85,
      },
      strengths: [
        'Clear communication and professional presentation',
        'Good technical understanding of core concepts',
        'Structured approach to answering questions',
      ],
      weaknesses: [
        'Could provide more specific examples',
        'Some technical concepts need deeper explanation',
        'Could improve conciseness in explanations',
      ],
      suggestions: [
        'Practice with more technical examples and use cases',
        'Work on explaining complex concepts in simpler terms',
        'Prepare specific examples from past experience',
      ],
      feedback:
        'Good overall response demonstrating solid understanding. With more practice and specific examples, the candidate could significantly improve their interview performance.',
    }
  );
};

// Helper function to get mock interview review
export const getMockInterviewReview = (
  role: string,
  difficulty: string,
  performance: 'excellent' | 'good' | 'average' | 'poor' = 'good'
): any => {
  const key = `${role.toLowerCase().split(' ')[0]}-${difficulty}-${performance}`;
  const basicFeedback =
    mockInterviewReviews[key] || mockInterviewReviews['frontend-beginner-good'];

  // Convert to AI service's InterviewFeedback format
  const overallScore = basicFeedback.overallScore;
  const decision =
    overallScore >= 85
      ? 'RECOMMEND'
      : overallScore >= 70
        ? 'MAYBE'
        : 'NOT_RECOMMEND';

  return {
    overallScore: overallScore,
    scores: {
      technicalKnowledge: Math.max(
        60,
        overallScore - 10 + Math.floor(Math.random() * 15)
      ),
      communicationSkills: Math.max(
        60,
        overallScore - 5 + Math.floor(Math.random() * 10)
      ),
      problemSolving: Math.max(
        60,
        overallScore - 8 + Math.floor(Math.random() * 12)
      ),
      professionalism: Math.max(
        60,
        overallScore + 5 + Math.floor(Math.random() * 8)
      ),
      overallFit: Math.max(
        60,
        overallScore - 3 + Math.floor(Math.random() * 10)
      ),
    },
    questionAnalysis: [
      {
        questionIndex: 0,
        score: Math.max(60, overallScore - 5 + Math.floor(Math.random() * 15)),
        strengths: basicFeedback.strengths.slice(0, 2),
        weaknesses: basicFeedback.weaknesses.slice(0, 2),
        feedback: `Question 1 demonstrated ${performance} understanding of the topic with clear communication.`,
      },
      {
        questionIndex: 1,
        score: Math.max(60, overallScore + 2 + Math.floor(Math.random() * 12)),
        strengths: basicFeedback.strengths.slice(1, 3),
        weaknesses: basicFeedback.weaknesses.slice(1, 3),
        feedback: `Question 2 showed solid technical knowledge with room for improvement in depth.`,
      },
    ],
    overallFeedback: {
      strengths: basicFeedback.strengths,
      weaknesses: basicFeedback.weaknesses,
      recommendations: basicFeedback.recommendations,
      summary: `The candidate demonstrated ${performance} performance overall with a score of ${overallScore}. ${basicFeedback.strengths[0]}`,
      decision: decision,
    },
  };
};

// Configuration for enabling mock mode
export const INTERVIEW_MOCK_CONFIG = {
  // Set to true to use mock data instead of real AI API calls
  USE_MOCK_DATA: import.meta.env.VITE_USE_INTERVIEW_MOCKS === 'true' || false,

  // Mock delays to simulate real API calls
  MOCK_GENERATION_DELAY: 2000, // 2 seconds
  MOCK_ANALYSIS_DELAY: 1500, // 1.5 seconds
  MOCK_REVIEW_DELAY: 3000, // 3 seconds
};

// Utility function to simulate API delay
export const simulateDelay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get mock interview questions based on role and difficulty
 */
export const getMockInterviewQuestions = (
  role: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  count: number = 5
) => {
  // Normalize role name
  const normalizedRole = role.toLowerCase().includes('frontend')
    ? 'Frontend Developer'
    : role.toLowerCase().includes('backend')
      ? 'Backend Developer'
      : 'Frontend Developer'; // Default

  const questions = mockInterviewQuestions[normalizedRole]?.[difficulty] || 
                    mockInterviewQuestions['Frontend Developer'].beginner;

  // Return requested number of questions
  return questions.slice(0, Math.min(count, questions.length));
};
