import { describe, it, expect } from '@jest/globals';
import {
  getMockQuestionsByRole,
  getMockAnswerAnalysis,
  getMockInterviewReview,
  INTERVIEW_MOCK_CONFIG,
  simulateDelay,
} from './interview-mock-data';

describe('Interview Mock Data', () => {
  describe('getMockQuestionsByRole', () => {
    it('should return questions for Frontend Developer - Beginner', () => {
      const questions = getMockQuestionsByRole(
        'Frontend Developer',
        'Beginner',
        3
      );

      expect(questions).toHaveLength(3);
      expect(questions[0]).toHaveProperty('id');
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0]).toHaveProperty('category');
      expect(questions[0]).toHaveProperty('difficulty', 'Beginner');
      expect(questions[0]).toHaveProperty('expectedTopics');
    });

    it('should return questions for Backend Developer - Intermediate', () => {
      const questions = getMockQuestionsByRole(
        'Backend Developer',
        'Intermediate',
        2
      );

      expect(questions).toHaveLength(2);
      expect(questions[0].difficulty).toBe('Intermediate');
    });

    it('should cycle through questions when requesting more than available', () => {
      const questions = getMockQuestionsByRole(
        'Backend Developer',
        'Beginner',
        5
      );

      expect(questions).toHaveLength(5);
      // Should cycle through the single beginner backend question
      expect(questions[0].id).toBe('be-bg-001-0');
      expect(questions[1].id).toBe('be-bg-001-1');
    });

    it('should default to Frontend Developer for unknown roles', () => {
      const questions = getMockQuestionsByRole('Unknown Role', 'Beginner', 2);

      expect(questions).toHaveLength(2);
      expect(questions[0].id).toContain('fe-bg-');
    });
  });

  describe('getMockAnswerAnalysis', () => {
    it('should return analysis for known question ID', () => {
      const analysis = getMockAnswerAnalysis('fe-bg-001');

      expect(analysis).toHaveProperty('transcription');
      expect(analysis).toHaveProperty('score');
      expect(analysis).toHaveProperty('analysis');
      expect(analysis).toHaveProperty('strengths');
      expect(analysis).toHaveProperty('weaknesses');
      expect(analysis).toHaveProperty('suggestions');
      expect(analysis).toHaveProperty('feedback');

      expect(analysis.score).toBeGreaterThanOrEqual(70);
      expect(analysis.score).toBeLessThanOrEqual(100);
    });

    it('should return default analysis for unknown question ID', () => {
      const analysis = getMockAnswerAnalysis('unknown-question');

      expect(analysis).toHaveProperty('transcription');
      expect(analysis.score).toBeGreaterThanOrEqual(70);
      expect(analysis.score).toBeLessThanOrEqual(100);
    });

    it('should have realistic scoring breakdown', () => {
      const analysis = getMockAnswerAnalysis('fe-bg-001');

      expect(analysis.analysis.relevance).toBeGreaterThanOrEqual(80);
      expect(analysis.analysis.technicalAccuracy).toBeGreaterThanOrEqual(75);
      expect(analysis.analysis.clarity).toBeGreaterThanOrEqual(80);
      expect(analysis.analysis.completeness).toBeGreaterThanOrEqual(75);
      expect(analysis.analysis.professionalism).toBeGreaterThanOrEqual(85);
    });
  });

  describe('getMockInterviewReview', () => {
    it('should return review for frontend beginner good performance', () => {
      const review = getMockInterviewReview(
        'Frontend Developer',
        'beginner',
        'good'
      );

      expect(review).toHaveProperty('overallScore');
      expect(review).toHaveProperty('scores');
      expect(review).toHaveProperty('questionAnalysis');
      expect(review).toHaveProperty('overallFeedback');

      expect(review.overallScore).toBeGreaterThanOrEqual(60);
      expect(review.overallScore).toBeLessThanOrEqual(100);
    });

    it('should have proper decision mapping', () => {
      const excellentReview = getMockInterviewReview(
        'Frontend',
        'intermediate',
        'excellent'
      );
      const goodReview = getMockInterviewReview(
        'Frontend',
        'intermediate',
        'good'
      );
      const averageReview = getMockInterviewReview(
        'Frontend',
        'intermediate',
        'average'
      );

      // Excellent should recommend
      expect(excellentReview.overallFeedback.decision).toMatch(
        /RECOMMEND|MAYBE/
      );

      // Reviews should have proper structure
      expect(excellentReview.scores).toHaveProperty('technicalKnowledge');
      expect(excellentReview.scores).toHaveProperty('communicationSkills');
      expect(excellentReview.scores).toHaveProperty('problemSolving');
      expect(excellentReview.scores).toHaveProperty('professionalism');
      expect(excellentReview.scores).toHaveProperty('overallFit');
    });

    it('should include question analysis', () => {
      const review = getMockInterviewReview('Backend', 'intermediate', 'good');

      expect(review.questionAnalysis).toBeInstanceOf(Array);
      expect(review.questionAnalysis.length).toBeGreaterThan(0);

      const firstQuestion = review.questionAnalysis[0];
      expect(firstQuestion).toHaveProperty('questionIndex');
      expect(firstQuestion).toHaveProperty('score');
      expect(firstQuestion).toHaveProperty('strengths');
      expect(firstQuestion).toHaveProperty('weaknesses');
      expect(firstQuestion).toHaveProperty('feedback');
    });
  });

  describe('Configuration and Utilities', () => {
    it('should have proper mock configuration', () => {
      expect(INTERVIEW_MOCK_CONFIG).toHaveProperty('USE_MOCK_DATA');
      expect(INTERVIEW_MOCK_CONFIG).toHaveProperty('MOCK_GENERATION_DELAY');
      expect(INTERVIEW_MOCK_CONFIG).toHaveProperty('MOCK_ANALYSIS_DELAY');
      expect(INTERVIEW_MOCK_CONFIG).toHaveProperty('MOCK_REVIEW_DELAY');

      expect(typeof INTERVIEW_MOCK_CONFIG.USE_MOCK_DATA).toBe('boolean');
      expect(typeof INTERVIEW_MOCK_CONFIG.MOCK_GENERATION_DELAY).toBe('number');
    });

    it('should simulate delay correctly', async () => {
      const startTime = Date.now();
      await simulateDelay(100);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some variance
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Data Quality', () => {
    it('should have diverse question categories', () => {
      const frontendQuestions = getMockQuestionsByRole(
        'Frontend Developer',
        'Beginner',
        10
      );
      const categories = [
        ...new Set(frontendQuestions.map((q: any) => q.category)),
      ];

      expect(categories.length).toBeGreaterThan(1);
      expect(categories).toContain('Technical');
    });

    it('should have meaningful expected topics', () => {
      const questions = getMockQuestionsByRole(
        'Frontend Developer',
        'Beginner',
        5
      );

      questions.forEach((question: any) => {
        expect(question.expectedTopics).toBeInstanceOf(Array);
        expect(question.expectedTopics.length).toBeGreaterThan(0);
        expect(question.expectedTopics[0]).toBeTruthy();
      });
    });

    it('should have realistic feedback content', () => {
      const analysis = getMockAnswerAnalysis('fe-bg-001');

      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.weaknesses.length).toBeGreaterThan(0);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
      expect(analysis.feedback.length).toBeGreaterThan(10);
    });
  });
});
