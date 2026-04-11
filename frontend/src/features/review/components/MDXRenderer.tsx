import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MDXRendererProps {
  content: string;
}

export const MDXRenderer: React.FC<MDXRendererProps> = ({ content }) => {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(
      /^---\s*\n[\s\S]*?\n---\s*\n/,
      ''
    );
    setProcessedContent(contentWithoutFrontmatter);
  }, [content]);

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom component rendering with enhanced typography
          h1: ({ children, ...props }) => (
            <h1
              className="text-4xl font-extrabold mb-6 text-gray-900 tracking-tight leading-tight border-b-2 border-gray-200 pb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-3xl font-bold mt-12 mb-5 text-gray-800 tracking-tight leading-snug"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-2xl font-semibold mt-8 mb-4 text-gray-800 tracking-tight"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            >
              {children}
            </h3>
          ),

          h4: ({ children, ...props }) => (
            <h4
              className="text-xl font-semibold mt-6 mb-3 text-gray-700"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            >
              {children}
            </h4>
          ),

          p: ({ ...props }) => (
            <p
              className="mb-5 text-gray-700 leading-[1.8] text-[17px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            />
          ),
          code: ({ inline, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="bg-pink-50 text-pink-700 px-2 py-1 rounded-md text-[15px] font-medium border border-pink-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  {...props}
                />
              );
            }
            return <code className="text-[15px]" {...props} />;
          },
          pre: ({ ...props }) => (
            <pre
              className="bg-[#0d1117] text-gray-100 p-6 rounded-xl overflow-x-auto my-6 shadow-xl border border-gray-800"
              style={{
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
              }}
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc ml-6 mb-6 space-y-2.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal ml-6 mb-6 space-y-2.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li
              className="text-gray-700 leading-[1.8] text-[17px] pl-2"
              {...props}
            />
          ),
          a: ({ children, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 font-medium transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 bg-blue-50 pl-6 pr-4 py-4 italic my-6 text-gray-700 rounded-r-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-10 border-t-2 border-gray-200" {...props} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm">
              <table
                className="min-w-full divide-y divide-gray-200"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-gray-50" {...props} />,
          tbody: ({ ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr className="hover:bg-gray-50 transition-colors" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="px-6 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="px-6 py-4 text-[16px] text-gray-700"
              style={{ fontFamily: 'Inter, sans-serif' }}
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
