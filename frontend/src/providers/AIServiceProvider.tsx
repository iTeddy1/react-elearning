import React, { createContext, useContext, useMemo } from 'react';
import { PracticeAIService } from '@/features/practice/services/ai/practice-ai-service';
import { InterviewAIService } from '@/features/interview/services/ai/interview-ai-service';
import { practiceConfig } from '@/features/practice/config';
import { interviewConfig } from '@/features/interview/config';

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
    const practiceAI = new PracticeAIService({
      baseUrl: practiceConfig.AI_BACKEND_BASE_URL,
      timeoutMs: 30000,
    });

    const interviewAI = new InterviewAIService({
      baseUrl: interviewConfig.AI_BACKEND_BASE_URL,
      timeoutMs: 30000,
    });

    return {
      practiceAI,
      interviewAI,
      isInitialized: true,
    };
  }, []);

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
