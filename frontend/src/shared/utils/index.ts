/**
 * Shared utility functions
 */

/**
 * Extract JSON from text that might contain markdown code blocks
 */
export const extractJSONFromText = (text: string): string => {
  // Look for JSON code block pattern: ```json ... ```
  const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = text.match(jsonCodeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no code block found, try to find JSON directly
  const jsonRegex = /\{[\s\S]*\}/;
  const directMatch = text.match(jsonRegex);

  if (directMatch) {
    return directMatch[0];
  }

  // Return original text as fallback
  return text;
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Delay function for async operations
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, i);
        await delay(delayTime);
      }
    }
  }

  throw lastError!;
};
