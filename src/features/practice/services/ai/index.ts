import { GoogleGenAI } from '@google/genai';
import { GenerateInput } from './types';
import { buildGeneratePrompt } from './prompts/generate-quiz';
import { buildReviewPrompt } from './prompts/build-review';

// Create a single client object
export const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY as string,
});
export const MODEL = 'gemini-2.0-flash';

// Helper function to extract JSON from markdown code blocks
const extractJSONFromResponse = (responseText: string): string => {
  // Look for JSON code block pattern: ```json ... ```
  const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = responseText.match(jsonCodeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no code block found, try to find JSON directly
  const jsonRegex = /\{[\s\S]*\}/;
  const directMatch = responseText.match(jsonRegex);

  if (directMatch) {
    return directMatch[0];
  }

  // Return original text as fallback
  return responseText;
};

export const AIProvider = {
  constructor: () => ai,
  async generateQuiz(input: GenerateInput) {
    const prompt = buildGeneratePrompt(input);
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    console.log('AI response:', res);
    console.log('AI response text:', res.text);

    if (!res.text) {
      throw new Error('Empty response from AI');
    }

    // Extract JSON from the response text
    const jsonString = extractJSONFromResponse(res.text);
    console.log('Extracted JSON:', jsonString);

    return jsonString;
  },
  async generateReview(
    payloadJSON: string,
    answers: (0 | 1 | 2 | 3 | null)[],
    technology: string,
    language: 'vi' | 'en' = 'en'
  ) {
    const prompt = buildReviewPrompt({
      payloadJSON,
      answers,
      technology,
      language,
    });

    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    console.log('AI Review response:', res);
    console.log('AI Review response text:', res.text);

    if (!res.text) {
      throw new Error('Empty response from AI');
    }

    // Extract JSON from the response text
    const jsonString = extractJSONFromResponse(res.text);
    console.log('Extracted Review JSON:', jsonString);

    return jsonString;
  },
};
