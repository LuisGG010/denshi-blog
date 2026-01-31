import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CommentForm from "@/app/CommentForm"; // ... tus otros imports ...
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  // 1. AHORA ESPERAMOS A PARAMS (Igual que abajo)
  const { id } = await params; 

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }

  return {
    title: post.title,
    description: post.content?.slice(0, 100) + '...',
    openGraph: {
      title: post.title,
      description: post.content?.slice(0, 100) + '...',
      images: [
        {
          url: post.image_url || 'https://tu-web.com/imagen-por-defecto.png',
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function PostPage({ params }) {
  const { id } = await params;

  // 1. Pedimos el POST
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();

  // 2. Pedimos los COMENTARIOS (Aquí ya viene el campo 'author' de la base de datos)
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true }); // Comentarios viejos arriba, nuevos abajo

  if (!post) return <div className="text-white text-center mt-20">Post no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-white">
      <Link href="/blog" className="text-gray-500 hover:text-white mb-6 block transition">
        &larr; Volver al muro
      </Link>

      {/* --- EL POST --- */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
          {post.title}
      </h1>

      <article className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg mb-10">
        {/* AHORA ES ASÍ (MARKDOWN INTELIGENTE): */}
        <div className="text-xl text-white leading-relaxed markdown-content">
          <ReactMarkdown
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={dracula} // Estilo oscuro tipo hacker
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`${className} bg-gray-800 rounded px-1`} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {post.image_url && (
          <div className="mb-6 rounded-lg overflow-hidden flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.image_url} 
              alt="Imagen del post" 
              className="w-auto max-h-[500px] object-contain"
            />
          </div>
        )}

        <div className="mt-4 text-gray-500 text-sm">
            Publicado el: {new Date(post.created_at).toLocaleString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
        </div>
      </article>

      {/* --- LOS COMENTARIOS --- */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-2xl font-bold text-blue-500 mb-6">
            Comentarios ({comments?.length || 0})
        </h3>

        <div className="space-y-4 mb-10">
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-black p-4 rounded-lg border border-gray-800">
            
            <div className="flex gap-4 items-start">

              {/* FOTO (Si hay) */}
              {comment.image_url ? (
                <div className="shrink-0">
                  <a href={comment.image_url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                      src={comment.image_url}
                      alt="Adjunto"
                      className="rounded border border-gray-800 w-16 h-16 sm:w-20 sm:h-20 object-cover hover:opacity-80 transition"
                      />
                  </a>
                </div>
              ) : (
                /* SI NO HAY FOTO, PONEMOS UN CIRCULO CON LA INICIAL DEL NOMBRE */
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-800 text-blue-300 font-bold">
                    {(comment.author || 'A')[0].toUpperCase()}
                </div>
              )}

              {/* TEXTO */}
              <div className="flex-1 min-w-0">
                
                {/* --- AQUÍ MOSTRAMOS EL NOMBRE DEL AUTOR --- */}
                <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-blue-400 text-sm md:text-base">
                        {comment.author || 'Anónimo'}
                    </span>
                    <span className="text-[10px] text-gray-600">
                        {new Date(comment.created_at).toLocaleString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                    </span>
                </div>
                {/* ------------------------------------------ */}

                <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                
              </div>
            </div>
          </div>
        ))}

        {comments?.length === 0 && (
          <p className="text-gray-600 italic">Sé el primero en comentar.</p>
        )}
        </div>

        {/* EL FORMULARIO */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <CommentForm postId={id} />
        </div>
      </div>
    </div>
  );
}