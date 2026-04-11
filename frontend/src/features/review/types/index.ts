export interface QuestionMetadata {
  slug: string;
  title: string;
  category: string;
  path: string;
  metadata?: {
    topics?: string[];
    importance?: 'low' | 'medium' | 'high';
    ranking?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    duration?: number;
    level?: string;
    featured?: boolean;
  };
}

export interface QuestionsByCategory {
  [category: string]: QuestionMetadata[];
}

export interface FilterOptions {
  topics: string[];
  importance: ('low' | 'medium' | 'high')[];
  difficulty: ('easy' | 'medium' | 'hard')[];
  rankingRange: [number, number];
}

export interface GuideMetadata {
  slug: string;
  title: string;
  description?: string;
  category: string;
  path: string;
}

export interface GuidesByCategory {
  [category: string]: GuideMetadata[];
}

export type ContentType = 'question' | 'guide';

export interface ContentMetadata {
  slug: string;
  title: string;
  description?: string;
  category: string;
  path: string;
  type: ContentType;
}
