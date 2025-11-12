import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useInterviewSessionStore } from '../store/interview-session-store';
import { useGenerateInterviewQuestionsMutation } from '../hooks/use-interview-queries';
import { GenerateQuestionsRequest } from '../types';
import { MicrophoneTest } from '../components/MicrophoneTest';
import { MicrophoneTestResult } from '../utils/microphone-test';
import { FeaturesSection } from '../components/setup/FeaturesSection';
import { InstructionsSection } from '../components/setup/InstructionsSection';
import { InterviewHeader } from '../components/setup/InterviewHeader';
import {
  InterviewConfigForm,
  FormValues,
} from '../components/setup/InterviewConfigForm';
import {
  getMockInterviewQuestions,
  simulateDelay,
} from '../mocks/interview-mock-data';

const formSchema = z.object({
  jobRole: z.string().min(2, {
    message: 'Job role must be at least 2 characters.',
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  roundType: z.enum(['technical', 'behavioral', 'system-design']),
  questionCount: z.number().min(1).max(10),
  language: z.enum(['en', 'vi']),
  testMode: z.boolean().optional(),
});

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, setError, startSession } = useInterviewSessionStore();
  const generateQuestionsMutation = useGenerateInterviewQuestionsMutation();
  const [micTestResult, setMicTestResult] =
    useState<MicrophoneTestResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: 'Frontend Developer Intern',
      difficulty: 'intermediate',
      roundType: 'behavioral',
      questionCount: 5,
      language: 'en',
      testMode: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);

      // Check if test mode is enabled
      if (data.testMode) {
        // Use mock data instead of AI
        toast.info('Test Mode: Using mock questions (no AI calls)');
        
        // Simulate API delay
        await simulateDelay(1500);

        // Get mock questions
        const mockQuestions = getMockInterviewQuestions(
          data.jobRole,
          data.difficulty,
          data.questionCount
        );

        // Start the interview session with mock questions
        startSession({
          jobRole: data.jobRole,
          difficulty: data.difficulty,
          questions: mockQuestions,
          testMode: true,
        });

        toast.success('Mock interview started successfully!');
        
        // Navigate to interview page
        void navigate('/interview');
        return;
      }

      // Normal flow: Generate questions via AI
      const request: GenerateQuestionsRequest = {
        jobRole: data.jobRole,
        difficulty: data.difficulty,
        roundType: data.roundType,
        questionCount: data.questionCount,
        language: data.language,
      };

      // Generate questions via AI
      const questions = await generateQuestionsMutation.mutateAsync(request);

      // Start the interview session with generated questions
      startSession({
        jobRole: data.jobRole,
        difficulty: data.difficulty,
        questions,
      });

      // Navigate to interview page
      void navigate('/interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
      // Error is handled by the mutation and displayed via toast
    }
  };

  const handleMicTestComplete = (result: MicrophoneTestResult) => {
    setMicTestResult(result);
    if (result.error) {
      setError(null); // Clear any previous errors when mic test is run
    }
  };

  const handleCancel = () => {
    void navigate('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <InterviewHeader />

        {/* Features */}
        <FeaturesSection />

        {/* Microphone Test */}
        <MicrophoneTest
          onTestComplete={handleMicTestComplete}
          className="mb-6"
        />

        {/* Setup Form */}
        <InterviewConfigForm
          form={form}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          isProcessing={generateQuestionsMutation.isPending}
          error={error}
          micTestResult={micTestResult}
        />

        {/* Instructions */}
        <InstructionsSection />
      </div>
    </div>
  );
};
