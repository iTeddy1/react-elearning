import { GoogleGenAI } from '@google/genai';

export interface AIConfig {
  client: GoogleGenAI;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  finishReason?: string;
}

export class BaseAIService {
  protected client: GoogleGenAI;
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;

  constructor(config: AIConfig) {
    this.client = config.client;
    this.model = config.model || 'gemini-2.5-flash';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 2048;
  }

  /**
   * Extract JSON from markdown code blocks or direct JSON
   */
  protected extractJSONFromResponse(responseText: string): string {
    // Look for JSON code block pattern: ```json ... ```
    const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
    const match = responseText.match(jsonCodeBlockRegex);

    if (match && match[1]) {
      return this.cleanJsonString(match[1].trim());
    }

    // If no code block found, try to find JSON directly
    const jsonRegex = /\{[\s\S]*\}/;
    const directMatch = responseText.match(jsonRegex);

    if (directMatch) {
      return this.cleanJsonString(directMatch[0]);
    }

    // Return original text as fallback
    return this.cleanJsonString(responseText);
  }

  /**
   * Clean JSON string to handle common AI response issues
   */
  private cleanJsonString(jsonString: string): string {
    return (
      jsonString
        // Remove any trailing commas before closing brackets/braces
        .replace(/,\s*([\]}])/g, '$1')
        // Fix escaped quotes that might cause issues
        .replace(/\\'/g, "'")
        // Remove any non-printable characters (using Unicode escape)
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        // Trim whitespace
        .trim()
    );
  }

  /**
   * Generate content using the AI model
   */
  protected async generateContent(prompt: string): Promise<string> {
    // console.log(prompt)
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      console.log('AI response:', response);
      console.log('AI response text:', response.text);

      if (!response.text) {
        throw new Error('Empty response from AI');
      }

      return response.text;
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw new Error('Failed to generate AI content');
    }
  }

  /**
   * Parse JSON response with error handling
   */
  protected parseJSONResponse<T>(responseText: string): T {
    try {
      const jsonString = this.extractJSONFromResponse(responseText);
      console.log('Extracted JSON:', jsonString);

      // Try parsing the cleaned JSON
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Original response:', responseText);
      console.error(
        'Extracted JSON string:',
        this.extractJSONFromResponse(responseText)
      );

      // Try one more time with additional cleaning
      try {
        const fallbackJson = this.extractJSONFromResponse(responseText)
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"');
        return JSON.parse(fallbackJson) as T;
      } catch {
        throw new Error(
          `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Generate content and parse as JSON
   */
  protected async generateJSONContent<T>(prompt: string): Promise<T> {
    const responseText = await this.generateContent(prompt);
    return this.parseJSONResponse<T>(responseText);
  }

  /**
   * Generate content with audio parts  Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>
   *
   */
  protected async generateContentWithAudio(
    parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }>
  ): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: parts,
      });
      console.log('AI response with audio:', response);
      if (!response.text) {
        throw new Error('Empty response from AI');
      }
      return response.text;
    } catch (error) {
      console.error('Error generating AI content with audio:', error);
      throw new Error('Failed to generate AI content with audio');
    }
  }
}
