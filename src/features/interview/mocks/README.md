# Interview Feature Mock Data

This document explains how to use the mock data system for offline development and testing of the interview feature.

## Overview

The interview feature includes a comprehensive mock data system that allows you to develop and test functionality without requiring internet connectivity or real AI API calls. This is particularly useful for:

- Offline development
- Testing interview workflows  
- Development without API keys
- Consistent testing with predictable data
- CI/CD environments

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Set to 'true' to use mock data instead of real AI API calls
VITE_USE_INTERVIEW_MOCKS=true

# Google Generative AI API Key (optional when using mocks)
VITE_GOOGLE_GENAI_API_KEY=your_api_key_here
```

### Automatic Fallback

The system automatically falls back to mock data in these scenarios:

1. **Configured Mock Mode**: When `VITE_USE_INTERVIEW_MOCKS=true`
2. **Offline Mode**: When `navigator.onLine` returns `false`
3. **API Errors**: When the real AI service fails or throws errors

## Mock Data Structure

### Interview Questions

Mock questions are organized by:
- **Role**: Frontend Developer, Backend Developer, Full Stack Developer
- **Difficulty**: Beginner, Intermediate, Advanced
- **Categories**: Technical, Behavioral, Situational

Example question structure:
```typescript
{
  id: 'fe-bg-001',
  text: 'What is the difference between let, const, and var in JavaScript?',
  category: 'Technical',
  question: 'What is the difference between let, const, and var in JavaScript?',
  difficulty: 'beginner',
  expectedTopics: ['Variable declarations', 'Block scope', 'Hoisting'],
  followUpQuestions: [
    'Can you explain what hoisting means in JavaScript?',
    'When would you use const versus let?'
  ]
}
```

### Answer Analysis

Mock answer analysis includes:
- **Transcription**: Simulated speech-to-text result
- **Scoring**: Overall score and detailed analysis metrics
- **Feedback**: Strengths, weaknesses, and suggestions
- **Realistic Variation**: Random score variations for testing

### Interview Reviews

Mock reviews provide:
- **Overall Score**: Numerical assessment
- **Detailed Scores**: Technical knowledge, communication, problem-solving, etc.
- **Question Analysis**: Individual question feedback
- **Recommendations**: Hiring decision and improvement suggestions

## Available Mock Data

### Question Counts by Role/Difficulty

| Role | Beginner | Intermediate | Advanced |
|------|----------|--------------|----------|
| Frontend Developer | 5 questions | 3 questions | 1 question |
| Backend Developer | 1 question | 1 question | 1 question |
| Full Stack Developer | 1 question | 1 question | 1 question |

### Sample Roles Supported

- **Frontend Developer**: React, JavaScript, CSS, performance optimization
- **Backend Developer**: Databases, caching, system design
- **Full Stack Developer**: Authentication, real-time applications

## Usage Examples

### 1. Enable Mock Mode

```bash
# In your .env file
VITE_USE_INTERVIEW_MOCKS=true
```

### 2. Generate Mock Questions

```typescript
import { InterviewAIService } from './services/ai/interview-ai-service';

const aiService = new InterviewAIService();

// This will return mock data when configured
const questions = await aiService.generateInterviewQuestions({
  role: 'Frontend Developer',
  experience: '2-5 years',
  skills: ['React', 'JavaScript', 'TypeScript'],
  numberOfQuestions: 5,
  difficulty: 'Intermediate'
});
```

### 3. Analyze Mock Answers

```typescript
// This will return mock analysis data
const analysis = await aiService.analyzeAnswer({
  question: 'What is the difference between let, const, and var?',
  questionId: 'fe-bg-001',
  questionIndex: 0,
  expectedTopics: ['Variable declarations', 'Block scope'],
  audioBlob: mockAudioBlob,
  metadata: {
    category: 'Technical',
    difficulty: 'Beginner'
  }
});
```

## Mock Timing

The system includes realistic delays to simulate real API calls:

- **Question Generation**: 2 seconds
- **Answer Analysis**: 1.5 seconds  
- **Interview Review**: 3 seconds

These delays help test loading states and user experience.

## Development Workflow

### 1. Start with Mock Data

```bash
# Enable mock mode
echo "VITE_USE_INTERVIEW_MOCKS=true" >> .env

# Start development
npm run dev
```

### 2. Test Complete Interview Flow

1. Generate questions (gets mock questions)
2. Record answers (analyzes with mock AI)
3. Review interview (gets mock feedback)
4. Test edge cases and error scenarios

### 3. Switch to Real API

```bash
# Disable mock mode
echo "VITE_USE_INTERVIEW_MOCKS=false" >> .env

# Add your API key
echo "VITE_GOOGLE_GENAI_API_KEY=your_key" >> .env
```

## Extending Mock Data

### Adding New Questions

Edit `src/features/interview/mocks/interview-mock-data.ts`:

```typescript
export const mockInterviewQuestions = {
  'Frontend Developer': {
    beginner: [
      // Add new questions here
      {
        id: 'fe-bg-new',
        text: 'Your new question',
        category: 'Technical',
        // ... other properties
      }
    ]
  }
};
```

### Adding New Roles

```typescript
export const mockInterviewQuestions = {
  // ... existing roles
  'DevOps Engineer': {
    beginner: [
      // Add DevOps questions
    ],
    intermediate: [
      // Add intermediate questions  
    ],
    advanced: [
      // Add advanced questions
    ]
  }
};
```

### Customizing Mock Reviews

Update the `getMockInterviewReview` function to add new performance levels or customize feedback patterns.

## File Structure

```
src/features/interview/mocks/
├── interview-mock-data.ts          # Main mock data file
└── README.md                       # This documentation

src/features/interview/services/ai/
└── interview-ai-service.ts         # Service with fallback logic
```

## Best Practices

1. **Keep Mock Data Realistic**: Ensure mock questions and feedback reflect real interview scenarios
2. **Test Both Modes**: Regularly test with both mock and real API data
3. **Update Mock Data**: Keep mock data current with feature changes
4. **Document Changes**: Update this README when adding new mock data

## Troubleshooting

### Mock Data Not Loading

1. Check environment variable: `VITE_USE_INTERVIEW_MOCKS=true`
2. Restart development server after changing `.env`
3. Check browser console for mock data logs

### TypeScript Errors

1. Ensure mock data types match service interfaces
2. Run `npm run build` to check for type errors
3. Update mock data structure if service interfaces change

### Missing Mock Questions

1. Check if the role exists in `mockInterviewQuestions`
2. Verify difficulty level is supported
3. Add fallback logic for new roles/difficulties

## Performance

Mock data provides several performance benefits:

- **No Network Requests**: Instant responses for development
- **Predictable Timing**: Consistent delay simulation
- **Reduced API Costs**: No usage of paid AI services during development
- **Offline Capability**: Full functionality without internet

This mock system enables efficient development and testing of the interview feature while maintaining the same user experience as the production environment.