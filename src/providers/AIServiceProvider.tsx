import React, { createContext, useContext, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PracticeAIService } from '@/features/practice/services/ai/practice-ai-service';
import { InterviewAIService } from '@/features/interview/services/ai/interview-ai-service';
import { practiceConfig } from '@/features/practice/config';

// ================================
// SERVICE CONTEXT
// ================================

interface AIServiceContextType {
  practiceAI: PracticeAIService;
  interviewAI: InterviewAIService;
  isInitialized: boolean;
}

const AIServiceContext = createContext<AIServiceContextType | null>(null);

// ================================
// SERVICE PROVIDER
// ================================

interface AIServiceProviderProps {
  children: React.ReactNode;
}

export const AIServiceProvider: React.FC<AIServiceProviderProps> = ({
  children,
}) => {
  // Create stable service instances (only once per app lifecycle)
  const services = useMemo(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.warn(
        '⚠️ Google GenAI API key not found. AI services will not function.'
      );
    }

    // Create shared Google GenAI client
    const client = new GoogleGenAI({ apiKey: apiKey || '' });

    // Initialize Practice AI Service
    const practiceAI = new PracticeAIService({
      client,
      apiKey: apiKey || '',
      model: practiceConfig.AI_MODEL,
      temperature: 0.7,
      maxTokens: 4096,
    });

    // Initialize Interview AI Service
    const interviewAI = new InterviewAIService({
      client,
      apiKey: apiKey || '',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 4096,
    });

    console.log('✅ AI Services initialized successfully');

    return {
      practiceAI,
      interviewAI,
      isInitialized: !!apiKey,
    };
  }, []); // Empty deps - only create once

  return (
    <AIServiceContext.Provider value={services}>
      {children}
    </AIServiceContext.Provider>
  );
};

// ================================
// SERVICE HOOKS
// ================================

/**
 * Hook to access all AI services
 */
export const useAIServices = (): AIServiceContextType => {
  const context = useContext(AIServiceContext);

  if (!context) {
    throw new Error('useAIServices must be used within AIServiceProvider');
  }

  return context;
};

/**
 * Hook to access Practice AI service
 */
export const usePracticeAI = (): PracticeAIService => {
  const { practiceAI, isInitialized } = useAIServices();

  if (!isInitialized) {
    console.warn('⚠️ Practice AI service accessed before initialization');
  }

  return practiceAI;
};

/**
 * Hook to access Interview AI service
 */
export const useInterviewAI = (): InterviewAIService => {
  const { interviewAI, isInitialized } = useAIServices();

  if (!isInitialized) {
    console.warn('⚠️ Interview AI service accessed before initialization');
  }

  return interviewAI;
};

/**
 * Hook to check if AI services are ready
 */
export const useAIServicesReady = (): boolean => {
  const { isInitialized } = useAIServices();
  return isInitialized;
};
