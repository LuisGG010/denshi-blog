'use client'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function MarkdownView({ content }) {
  return (
    <div className="markdown-content text-gray-300 leading-relaxed space-y-4">
      <ReactMarkdown
        components={{
          // Títulos
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-green-400 mt-8 mb-4 border-b border-gray-800 pb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-green-300 mt-6 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
          
          // Párrafos y Listas
          p: ({node, ...props}) => <p className="mb-4 text-lg" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside ml-4 mb-4 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-gray-300" {...props} />,

          // 👇 AQUÍ ESTÁ TU TRUCO DE COLORES 🎨
          a: ({ node, href, children, ...props }) => {
            // 1. Limpiamos la URL por si acaso
            const linkUrl = href || '';

            // 2. ¿Es tu código secreto de color? Ej: #color=#7accff
            if (linkUrl.startsWith('#color=')) {
                const colorHex = linkUrl.replace('#color=', '');
                return (
                    <span style={{ color: colorHex, fontWeight: 'bold' }}>
                        {children}
                    </span>
                );
            }

            // 3. Si no es color, es un enlace normal y corriente
            return (
                <a 
                    href={linkUrl} 
                    className="text-blue-400 hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    {...props}
                >
                    {children}
                </a>
            );
          },

          // Bloques de Código
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                className="rounded-lg shadow-lg border border-gray-700 my-6 !bg-[#111]"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-800 text-green-300 px-1 py-0.5 rounded font-mono text-sm" {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}