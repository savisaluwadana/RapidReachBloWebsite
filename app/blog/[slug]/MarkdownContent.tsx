'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold text-white mb-6 mt-10">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold text-white mb-4 mt-8">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold text-white mb-3 mt-6">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold text-white mb-2 mt-4">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-electric-cyan hover:text-cyber-lime transition-colors underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2 ml-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2 ml-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-300">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-electric-cyan pl-4 py-2 my-4 bg-white/5 rounded-r-lg">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className
          if (isInline) {
            return (
              <code className="bg-white/10 text-cyber-lime px-2 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          }
          return (
            <code className={`block bg-black/50 rounded-xl p-4 overflow-x-auto text-sm font-mono text-gray-300 my-4 ${className || ''}`} {...props}>
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="bg-black/50 rounded-xl p-4 overflow-x-auto my-4 border border-white/10">
            {children}
          </pre>
        ),
        hr: () => (
          <hr className="border-white/10 my-8" />
        ),
        strong: ({ children }) => (
          <strong className="text-white font-bold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-gray-200 italic">{children}</em>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-white/10">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-white/10 px-4 py-2 bg-white/5 text-white font-semibold text-left">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-white/10 px-4 py-2 text-gray-300">{children}</td>
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt || ''} className="rounded-xl my-4 max-w-full" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
