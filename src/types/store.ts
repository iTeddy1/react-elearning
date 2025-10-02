// Store-related types
import { StateCreator } from 'zustand';

// Generic store slice type
export type StoreSlice<T> = StateCreator<T, [], [], T>;

// Store persistence options
export interface PersistOptions<T = unknown> {
  name: string;
  partialize?: (state: T) => Partial<T>;
}

// Devtools options
export interface DevtoolsOptions {
  name: string;
  enabled?: boolean;
}
