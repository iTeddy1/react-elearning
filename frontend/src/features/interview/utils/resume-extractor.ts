/**
 * Resume Text Extractor Utility
 * 
 * Extracts text content from various resume file formats.
 * Supports: PDF, TXT, DOC, DOCX
 * 
 * Note: For production use, consider using proper parsing libraries:
 * - PDF: pdfjs-dist or pdf-parse
 * - DOCX: mammoth.js
 */

export interface ResumeExtractionResult {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    extractedAt: Date;
    characterCount: number;
    wordCount: number;
  };
}

/**
 * Supported resume file types
 */
export const SUPPORTED_RESUME_TYPES = {
  PDF: 'application/pdf',
  TXT: 'text/plain',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_RESUME_SIZE = 5 * 1024 * 1024;

/**
 * Maximum characters to extract from resume
 */
export const MAX_RESUME_CHARACTERS = 15000;

/**
 * Validates resume file
 */
export const validateResumeFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_RESUME_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum of 5MB`,
    };
  }

  // Check file type
  const supportedTypes = Object.values(SUPPORTED_RESUME_TYPES);
  if (!supportedTypes.includes(file.type as typeof SUPPORTED_RESUME_TYPES[keyof typeof SUPPORTED_RESUME_TYPES])) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please upload PDF, TXT, DOC, or DOCX`,
    };
  }

  return { valid: true };
};

/**
 * Extracts text from plain text files
 */
const extractTextFromPlainText = async (file: File): Promise<string> => {
  const text = await file.text();
  return text.substring(0, MAX_RESUME_CHARACTERS);
};

/**
 * Extracts text from PDF files (basic extraction)
 * 
 * Note: This is a basic implementation. For production, use a proper PDF library
 * like pdfjs-dist for accurate text extraction with proper layout preservation.
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const text = new TextDecoder('utf-8').decode(uint8Array);

  // Basic PDF text extraction - remove binary content
  const cleanText = text
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
    .replace(/[^\x20-\x7E\s]/g, '') // Keep only printable ASCII and whitespace
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return cleanText.substring(0, MAX_RESUME_CHARACTERS);
};

/**
 * Extracts text from Word documents (basic extraction)
 * 
 * Note: This is a basic implementation. For production, use mammoth.js
 * for proper DOCX parsing with formatting preservation.
 */
const extractTextFromWord = async (file: File): Promise<string> => {
  // For .docx files, we can try to extract text from the XML structure
  if (file.type === SUPPORTED_RESUME_TYPES.DOCX) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('utf-8').decode(uint8Array);

      // Try to extract text between XML tags (very basic)
      const xmlTextMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (xmlTextMatches) {
        const extractedText = xmlTextMatches
          .map((match) => match.replace(/<[^>]*>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return extractedText.substring(0, MAX_RESUME_CHARACTERS);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.warn('Failed to extract DOCX text, falling back to raw text');
    }
  }

  // Fallback: Read as plain text
  const text = await file.text();
  const cleanText = text
    .replace(/[^\x20-\x7E\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText.substring(0, MAX_RESUME_CHARACTERS);
};

/**
 * Main function to extract text from resume file
 */
export const extractResumeText = async (
  file: File
): Promise<ResumeExtractionResult> => {
  // Validate file
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let extractedText: string;

  try {
    // Extract text based on file type
    switch (file.type) {
      case SUPPORTED_RESUME_TYPES.TXT:
        extractedText = await extractTextFromPlainText(file);
        break;

      case SUPPORTED_RESUME_TYPES.PDF:
        extractedText = await extractTextFromPDF(file);
        break;

      case SUPPORTED_RESUME_TYPES.DOC:
      case SUPPORTED_RESUME_TYPES.DOCX:
        extractedText = await extractTextFromWord(file);
        break;

      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Calculate metadata
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    return {
      text: extractedText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedAt: new Date(),
        characterCount: extractedText.length,
        wordCount,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from resume: ${errorMessage}`);
  }
};

/**
 * Formats resume text for AI consumption
 * Cleans up and structures the text for better AI understanding
 */
export const formatResumeForAI = (resumeText: string): string => {
  return resumeText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
};

/**
 * Extracts key information from resume text (basic implementation)
 * Returns structured data that can be used for better question generation
 */
export const extractResumeMetadata = (resumeText: string): {
  skills: string[];
  experience: string[];
  education: string[];
} => {
  const skills: string[] = [];
  const experience: string[] = [];
  const education: string[] = [];

  const lines = resumeText.split('\n');

  // Basic keyword matching for sections
  let currentSection: 'skills' | 'experience' | 'education' | null = null;

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();

    // Detect sections
    if (
      lowerLine.includes('skill') ||
      lowerLine.includes('technical') ||
      lowerLine.includes('expertise')
    ) {
      currentSection = 'skills';
    } else if (
      lowerLine.includes('experience') ||
      lowerLine.includes('work history') ||
      lowerLine.includes('employment')
    ) {
      currentSection = 'experience';
    } else if (
      lowerLine.includes('education') ||
      lowerLine.includes('qualification') ||
      lowerLine.includes('degree')
    ) {
      currentSection = 'education';
    }

    // Extract content based on current section
    if (currentSection && line.length > 3 && line.length < 200) {
      switch (currentSection) {
        case 'skills':
          if (!lowerLine.includes('skill')) {
            skills.push(line.trim());
          }
          break;
        case 'experience':
          if (!lowerLine.includes('experience')) {
            experience.push(line.trim());
          }
          break;
        case 'education':
          if (!lowerLine.includes('education')) {
            education.push(line.trim());
          }
          break;
      }
    }
  });

  return {
    skills: skills.slice(0, 10), // Limit to 10 items
    experience: experience.slice(0, 5),
    education: education.slice(0, 3),
  };
};
