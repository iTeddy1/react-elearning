import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { queryClient } from './lib/react-query';
import { BrowserRouter } from 'react-router';
import { ServiceProvider } from './app/providers/ServiceProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ServiceProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ServiceProvider>
  );
}
