import React, { createContext, useContext, type ReactNode } from 'react';
import { PracticeAIService } from '../../features/practice/services/ai/practice-ai-service';
import { InterviewAIService } from '../../features/interview/services/ai/interview-ai-service';
import { envSchema } from '../../shared/config/env';

// ================================
// SERVICE CONFIGURATION
// ================================

interface ServiceConfig {
  googleAI: {
    apiKey: string;
    model: string;
  };
}

const createServiceConfig = (): ServiceConfig => {
  const env = envSchema.parse({
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_GOOGLE_GENAI_API_KEY: import.meta.env.VITE_GOOGLE_GENAI_API_KEY,
  });

  return {
    googleAI: {
      apiKey: env.VITE_GOOGLE_GENAI_API_KEY,
      model: 'gemini-2.5-flash',
    },
  };
};

// ================================
// SERVICE INSTANCES
// ================================

interface Services {
  practiceAI: PracticeAIService;
  interviewAI: InterviewAIService;
}

const createServices = (config: ServiceConfig): Services => {
  const practiceAI = new PracticeAIService(config.googleAI);
  const interviewAI = new InterviewAIService(config.googleAI);

  return {
    practiceAI,
    interviewAI,
  };
};

// ================================
// SERVICE CONTEXT
// ================================

const ServicesContext = createContext<Services | null>(null);

export interface ServiceProviderProps {
  children: ReactNode;
  config?: Partial<ServiceConfig>;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  config: customConfig,
}) => {
  const services = React.useMemo(() => {
    const defaultConfig = createServiceConfig();
    const finalConfig = customConfig
      ? { ...defaultConfig, ...customConfig }
      : defaultConfig;

    return createServices(finalConfig);
  }, [customConfig]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

// ================================
// SERVICE HOOKS
// ================================

/**
 * Get all services instance
 * Used internally by React Query hooks
 */
export const useServices = (): Services => {
  const services = useContext(ServicesContext);

  if (!services) {
    throw new Error(
      'useServices must be used within a ServiceProvider. ' +
        'Make sure to wrap your app with ServiceProvider.'
    );
  }

  return services;
};

/**
 * Get Practice AI Service
 * Should only be used by React Query hooks, not directly in components
 */
export const usePracticeAIService = (): PracticeAIService => {
  const { practiceAI } = useServices();
  return practiceAI;
};

/**
 * Get Interview AI Service
 * Should only be used by React Query hooks, not directly in components
 */
export const useInterviewAIService = (): InterviewAIService => {
  const { interviewAI } = useServices();
  return interviewAI;
};

// ================================
// TYPE EXPORTS
// ================================

export type { Services, ServiceConfig };
