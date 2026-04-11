import { GuideMetadata, GuidesByCategory } from '../types';

// Import all guide content
const reactGuidesContext = import.meta.glob(
  '/src/data/review/guides/react/*/en-US.mdx',
  { eager: true, as: 'raw' }
);

const behavioralGuidesContext = import.meta.glob(
  '/src/data/review/guides/behavioral/*/en-US.mdx',
  { eager: true, as: 'raw' }
);

const systemDesignGuidesContext = import.meta.glob(
  '/src/data/review/guides/system-design/*/en-US.mdx',
  { eager: true, as: 'raw' }
);

/**
 * Extract frontmatter from MDX content including description
 */
function extractGuideFrontmatter(content: string): {
  title: string;
  description?: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { title: 'Untitled Guide' };
  }

  const frontmatter = match[1];
  const titleMatch = frontmatter.match(/title:\s*['"]?(.+?)['"]?\s*$/m);
  const descriptionMatch = frontmatter.match(
    /description:\s*['"]?(.+?)['"]?\s*$/m
  );

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Untitled Guide',
    description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
  };
}

/**
 * Convert file path to slug
 */
function pathToSlug(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 2];
}

/**
 * Get all guides organized by category
 */
export function getAllGuides(): GuidesByCategory {
  const guides: GuidesByCategory = {
    react: [],
    behavioral: [],
    'system-design': [],
  };

  // Process React guides
  Object.entries(reactGuidesContext).forEach(([path, content]) => {
    const slug = pathToSlug(path);
    const frontmatter = extractGuideFrontmatter(content);

    guides.react.push({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      category: 'react',
      path: `/review/guides/react/${slug}`,
    });
  });

  // Process Behavioral guides
  Object.entries(behavioralGuidesContext).forEach(([path, content]) => {
    const slug = pathToSlug(path);
    const frontmatter = extractGuideFrontmatter(content);

    guides.behavioral.push({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      category: 'behavioral',
      path: `/review/guides/behavioral/${slug}`,
    });
  });

  // Process System Design guides
  Object.entries(systemDesignGuidesContext).forEach(([path, content]) => {
    const slug = pathToSlug(path);
    const frontmatter = extractGuideFrontmatter(content);

    guides['system-design'].push({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      category: 'system-design',
      path: `/review/guides/system-design/${slug}`,
    });
  });

  // Sort guides alphabetically by title
  Object.keys(guides).forEach((category) => {
    guides[category].sort((a, b) => a.title.localeCompare(b.title));
  });

  return guides;
}

/**
 * Get guide content by category and slug
 */
export async function getGuideContent(
  category: string,
  slug: string
): Promise<string | null> {
  try {
    const module = await import(
      `/src/data/review/guides/${category}/${slug}/en-US.mdx?raw`
    );
    return module.default;
  } catch (error) {
    console.error(`Failed to load guide: ${category}/${slug}`, error);
    return null;
  }
}

/**
 * Get next and previous guides
 */
export function getAdjacentGuides(
  category: string,
  currentSlug: string
): {
  previous: GuideMetadata | null;
  next: GuideMetadata | null;
} {
  const allGuides = getAllGuides();
  const categoryGuides = allGuides[category] || [];
  const currentIndex = categoryGuides.findIndex((g) => g.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? categoryGuides[currentIndex - 1] : null,
    next:
      currentIndex < categoryGuides.length - 1
        ? categoryGuides[currentIndex + 1]
        : null,
  };
}

/**
 * Get guide by category and slug
 */
export function getGuideBySlug(
  category: string,
  slug: string
): GuideMetadata | null {
  const allGuides = getAllGuides();
  const categoryGuides = allGuides[category] || [];
  return categoryGuides.find((g) => g.slug === slug) || null;
}
