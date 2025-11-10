import type { InterviewResult, InterviewSession } from '../types';
import type { InterviewFeedback } from '../services/ai/interview-ai-service';

/**
 * Transforms AI-generated review to InterviewResult format
 * Used after calling useGenerateInterviewReviewMutation
 */
export function transformAIReviewToResult(
  aiReview: InterviewFeedback,
  currentSession: InterviewSession
): InterviewResult {
  const result: InterviewResult = {
    questions: currentSession.questions.map((q, index) => {
      const analysis = aiReview.questionAnalysis.find(
        (qa: { questionIndex: number }) => qa.questionIndex === index
      );
      const recording = currentSession.recordings.find(
        (r) => r.questionId === q.id
      );
      return {
        questionId: q.id,
        question: q.question,
        response: recording ? 'Audio response recorded' : 'No response',
        grammar: null, // AI service doesn't provide detailed grammar breakdown
        contentRelevancy: {
          score: analysis?.score || 0,
          improvement: analysis?.weaknesses || [],
          reason: analysis?.feedback || 'No detailed feedback available',
        },
      };
    }),
    scores: {
      grammarScore: aiReview.scores.communicationSkills,
      communicationScore: aiReview.scores.communicationSkills,
      totalRelevancyScore: aiReview.scores.technicalKnowledge,
      overallInterviewScore: aiReview.overallScore,
      professionalismScore: aiReview.scores.professionalism,
      sociabilityScore: aiReview.scores.overallFit,
      energyLevelScore: Math.round(
        (aiReview.scores.communicationSkills +
          aiReview.scores.professionalism) /
          2
      ),
    },
    communication_breakdown: [
      {
        name: 'Technical Knowledge',
        definition: 'Assessment of technical understanding and accuracy',
        score: aiReview.scores.technicalKnowledge,
        reasoning:
          'Evaluation based on depth and correctness of technical responses',
      },
      {
        name: 'Communication Skills',
        definition: 'Clarity, structure, and articulation of responses',
        score: aiReview.scores.communicationSkills,
        reasoning: 'Assessment of how effectively ideas were communicated',
      },
      {
        name: 'Problem Solving',
        definition: 'Analytical thinking and approach to challenges',
        score: aiReview.scores.problemSolving,
        reasoning: 'Evaluation of logical reasoning and solution approach',
      },
    ],
    relevancy_score_breakdown: currentSession.questions.map((q, index) => {
      const analysis = aiReview.questionAnalysis.find(
        (qa: { questionIndex: number }) => qa.questionIndex === index
      );
      return {
        questionId: q.id,
        question: q.question,
        answer: 'Audio response',
        relevancy_score: analysis?.score || 0,
        relevancy_type: q.category,
        reason: analysis?.feedback || 'No detailed feedback available',
        improvements: analysis?.weaknesses || [],
        extracted_ideal_answer: q.expectedTopics.join(', '),
        strengths: analysis?.strengths || [],
      };
    }),
    grammar_score_breakdown: [], // AI service doesn't provide specific grammar breakdown
    overallSummary: {
      overall_summary: aiReview.overallFeedback.summary,
      transcript_summary:
        'Interview completed with audio responses analyzed by AI',
      strengths: aiReview.overallFeedback.strengths,
      weaknesses: aiReview.overallFeedback.weaknesses,
      key_insights: aiReview.overallFeedback.recommendations,
      recommendation:
        aiReview.overallFeedback.decision === 'RECOMMEND'
          ? 'YES - Strong candidate'
          : aiReview.overallFeedback.decision === 'MAYBE'
            ? 'MAYBE - Conditional recommendation'
            : 'NO - Additional development needed',
    },
  };

  return result;
}

/**
 * Prepares interview answers for AI review
 * Used before calling useGenerateInterviewReviewMutation
 */
export function prepareAnswersForReview(currentSession: InterviewSession) {
  return currentSession.recordings.map((recording, index) => {
    const question = currentSession.questions.find(
      (q) => q.id === recording.questionId
    );
    return {
      questionId: recording.questionId,
      questionIndex: index,
      question: question?.question || '',
      expectedTopics: question?.expectedTopics || [],
      audioBlob: recording.audioBlob,
      duration: recording.duration,
      recordedAt: recording.timestamp.toISOString(),
      metadata: {
        category: question?.category || 'General',
        difficulty: question?.difficulty || 'intermediate',
      },
    };
  });
}
