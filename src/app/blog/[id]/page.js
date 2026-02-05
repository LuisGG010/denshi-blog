import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CommentForm from "@/app/CommentForm"; 
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { id } = await params; 
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
  if (!post) return { title: 'Post no encontrado' };
  return {
    title: post.title,
    description: post.content?.slice(0, 100) + '...',
  };
}

export default async function PostPage({ params }) {
  const { id } = await params;

  // 1. Pedimos el POST
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();

  // 2. Pedimos los COMENTARIOS
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: false });

  if (!post) return <div className="bg-black/40 text-white text-center mt-20">Post no encontrado</div>;

  const themeColor = post.color || '#3b82f6';
  const content = post.content; 

  return (
    <div className="min-h-screen bg-black/40">
      <div className="max-w-3xl mx-auto py-12 px-6 text-white">
        <Link href="/blog" className="text-gray-500 hover:text-white mb-6 block transition">
          &larr; Volver al muro
        </Link>

        <h1 
          className="text-3xl md:text-4xl font-bold mb-6 border-b border-gray-800 pb-4 break-words"
          style={{ color: themeColor }}
        >
            {post.title}
        </h1>

        <article 
          className="bg-gray-900 border rounded-xl p-8 shadow-lg mb-10 overflow-hidden"
          style={{ borderColor: themeColor, boxShadow: `0 0 20px ${themeColor}20` }}
        >
          <div className="text-xl text-white leading-relaxed markdown-content break-words">
            
            <ReactMarkdown
              components={{
                // ✅ 1. SOLUCIÓN PARA ENTERS (CSS)
                p: ({node, children, ...props}) => (
                  <p className="mb-4 whitespace-pre-wrap" {...props}>
                      {children}
                  </p>
                ),

                // ✅ 2. CÓDIGO (HACKER STYLE)
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${className} bg-gray-800 rounded px-1`} {...props}>{children}</code>
                  )
                },

                // ✅ 3. EL SUPER DETECTOR (Soporta Color + Tamaño)
                // Lee códigos como: [Texto](#color=red&size=40px)
                a: ({ node, href, children, ...props }) => {
                  const decodedHref = decodeURIComponent(href || '');

                  const hasColor = decodedHref.includes('color=');
                  const hasSize = decodedHref.includes('size=');

                  // Si tiene color o tamaño, aplicamos estilos personalizados
                  if (hasColor || hasSize) {
                    let customStyle = { fontWeight: 'bold' }; 

                    // Extraer Color
                    if (hasColor) {
                      // Rompemos el string para sacar el valor entre "color=" y el siguiente "&"
                      const parts = decodedHref.split('color=')[1].split('&')[0];
                      customStyle.color = parts;
                    }

                    // Extraer Tamaño
                    if (hasSize) {
                      const parts = decodedHref.split('size=')[1].split('&')[0];
                      // Si el usuario puso solo número, agregamos "px"
                      customStyle.fontSize = isNaN(parts) ? parts : `${parts}px`;
                      customStyle.lineHeight = '1.2'; 
                    }

                    return <span style={customStyle}>{children}</span>;
                  }

                  // Si es un link normal, lo pintamos azul
                  return (
                      <a href={href} {...props} className="text-blue-400 hover:underline" target="_blank">
                          {children}
                      </a>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {post.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden flex justify-center mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.image_url} 
                alt="Imagen del post" 
                className="w-auto max-h-[500px] object-contain"
              />
            </div>
          )}

          <div className="mt-4 text-gray-500 text-sm flex justify-between items-center border-t border-gray-800 pt-4">
              <span>
                  {new Date(post.created_at).toLocaleString()}
              </span>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }}></span>
          </div>
        </article>

        {/* --- COMENTARIOS --- */}
        <div className="border-t border-gray-800 pt-10">
          <h3 className="text-2xl font-bold mb-6" style={{ color: themeColor }}>
              Comentarios ({comments?.length || 0})
          </h3>

          <div className="space-y-4 mb-10">
          {comments?.map((comment) => (
            <div key={comment.id} className="bg-black p-4 rounded-lg border border-gray-800 break-words">
              <div className="flex gap-4 items-start">
                  {/* AVATAR */}
                  {comment.image_url ? (
                    <div className="shrink-0">
                      <a href={comment.image_url} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={comment.image_url} alt="Adjunto" className="rounded border border-gray-800 w-16 h-16 object-cover hover:opacity-80 transition" />
                      </a>
                    </div>
                  ) : (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-700 text-gray-400 font-bold">
                        {(comment.author || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-sm md:text-base mr-2" style={{ color: themeColor }}>
                              {comment.author || 'Anónimo'}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                      </div>

                      {/* ✅ ENTERS EN COMENTARIOS */}
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                  </div>
              </div>
            </div>
          ))}
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <CommentForm postId={id} postTitle={post.title} />
          </div>
        </div>
      </div>
    </div>
  );
}