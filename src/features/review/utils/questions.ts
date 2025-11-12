import { QuestionMetadata, QuestionsByCategory } from '../types';

// Import all JavaScript questions
const javascriptContext = import.meta.glob(
  '/src/data/review/javascript/*/en-US.mdx',
  { eager: true, as: 'raw' }
);

// Import all CSS questions
const cssContext = import.meta.glob('/src/data/review/css/*/en-US.mdx', {
  eager: true,
  as: 'raw',
});

const reactContext = import.meta.glob('/src/data/review/react/*/en-US.mdx', {
  eager: true,
  as: 'raw',
});

/**
 * Extract frontmatter from MDX content
 */
function extractFrontmatter(content: string): { title: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { title: 'Untitled Question' };
  }

  const frontmatter = match[1];
  const titleMatch = frontmatter.match(/title:\s*(.+)/);

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Untitled Question',
  };
}

/**
 * Convert file path to slug
 * Example: /src/data/review/javascript/describe-event-capturing/en-US.mdx
 * -> describe-event-capturing
 */
function pathToSlug(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 2]; // Get the folder name
}

/**
 * Get all questions organized by category
 */
export function getAllQuestions(): QuestionsByCategory {
  const questions: QuestionsByCategory = {
    javascript: [],
    css: [],
  };

  // Process JavaScript questions
  Object.entries(javascriptContext).forEach(([path, content]) => {
    const slug = pathToSlug(path);
    const frontmatter = extractFrontmatter(content);

    questions.javascript.push({
      slug,
      title: frontmatter.title,
      category: 'javascript',
      path: `/review/javascript/${slug}`,
    });
  });

  // Process CSS questions
  Object.entries(cssContext).forEach(([path, content]) => {
    const slug = pathToSlug(path);
    const frontmatter = extractFrontmatter(content);

    questions.css.push({
      slug,
      title: frontmatter.title,
      category: 'css',
      path: `/review/css/${slug}`,
    });
  });

  // Process React questions
  Object.entries(reactContext).forEach(([path, content]) => {
    const slug = pathToSlug(path);
    const frontmatter = extractFrontmatter(content);
    if (!questions['react']) {
      questions['react'] = [];
    }
    questions['react'].push({
      slug,
      title: frontmatter.title,
      category: 'react',
      path: `/review/react/${slug}`,
    });
  });

  // Sort questions alphabetically by title
  questions.javascript.sort((a, b) => a.title.localeCompare(b.title));
  questions.css.sort((a, b) => a.title.localeCompare(b.title));

  return questions;
}

/**
 * Get question content by category and slug
 */
export async function getQuestionContent(
  category: string,
  slug: string
): Promise<string | null> {
  try {
    const module = await import(
      `/src/data/review/${category}/${slug}/en-US.mdx?raw`
    );
    return module.default;
  } catch (error) {
    console.error(`Failed to load question: ${category}/${slug}`, error);
    return null;
  }
}

/**
 * Get next and previous questions
 */
export function getAdjacentQuestions(
  category: string,
  currentSlug: string
): {
  previous: QuestionMetadata | null;
  next: QuestionMetadata | null;
} {
  const allQuestions = getAllQuestions();
  const categoryQuestions = allQuestions[category] || [];
  const currentIndex = categoryQuestions.findIndex(
    (q) => q.slug === currentSlug
  );

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? categoryQuestions[currentIndex - 1] : null,
    next:
      currentIndex < categoryQuestions.length - 1
        ? categoryQuestions[currentIndex + 1]
        : null,
  };
}
