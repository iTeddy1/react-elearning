import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { queryClient } from './lib/react-query';
import { BrowserRouter } from 'react-router';
import { AIServiceProvider } from './providers/AIServiceProvider';
import { TooltipProvider } from './components/ui/tooltip';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AIServiceProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AIServiceProvider>
  );
}
