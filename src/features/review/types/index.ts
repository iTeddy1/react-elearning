export interface QuestionMetadata {
  slug: string;
  title: string;
  category: string;
  path: string;
}

export interface QuestionsByCategory {
  [category: string]: QuestionMetadata[];
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
