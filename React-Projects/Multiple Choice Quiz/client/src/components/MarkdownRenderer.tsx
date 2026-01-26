import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with syntax-highlighted code blocks.
 * Supports all common programming languages.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme();
  
  // Determine if we should use dark theme
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        components={{
        // Code blocks with syntax highlighting
        code({ node, inline, className: codeClassName, children, ...props }: any) {
          const match = /language-(\w+)/.exec(codeClassName || '');
          const language = match ? match[1] : '';
          
          if (!inline && language) {
            return (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={language}
                PreTag="div"
                className="rounded-md my-2 text-sm"
                customStyle={{
                  margin: '0.5rem 0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }
          
          // Inline code
          return (
            <code
              className={cn(
                'px-1.5 py-0.5 rounded-md text-sm font-mono',
                'bg-muted text-foreground',
                codeClassName
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        // Paragraphs
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        // Lists
        ul({ children }) {
          return <ul className="list-disc pl-6 mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-6 mb-2 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        // Headings
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-1">{children}</h3>;
        },
        // Blockquotes
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-2">
              {children}
            </blockquote>
          );
        },
        // Tables
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-border px-3 py-2 bg-muted font-medium text-left">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-border px-3 py-2">{children}</td>
          );
        },
        // Links
        a({ href, children }) {
          return (
            <a
              href={href}
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        // Bold and italic
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
        // Horizontal rule
        hr() {
          return <hr className="my-4 border-border" />;
        },
        // Pre (for code blocks without language)
        pre({ children }) {
          return (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto my-2 text-sm">
              {children}
            </pre>
          );
        },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Supported languages for syntax highlighting:
 * - javascript, typescript, jsx, tsx
 * - python
 * - java
 * - csharp (c#)
 * - cpp (c++)
 * - c
 * - go
 * - rust
 * - ruby
 * - php
 * - swift
 * - kotlin
 * - sql
 * - html, css, scss
 * - json, yaml
 * - bash, shell
 * - markdown
 * - and many more...
 * 
 * Usage in question text:
 * ```javascript
 * const greeting = "Hello, World!";
 * console.log(greeting);
 * ```
 */
