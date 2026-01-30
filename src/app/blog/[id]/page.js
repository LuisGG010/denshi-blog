import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CommentForm from "@/app/CommentForm"; // Asegúrate de tener este componente

export const revalidate = 0;

export default async function PostPage({ params }) {
  // Esperamos a tener el ID de la URL
  const { id } = await params;

  // 1. Pedimos el POST
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Pedimos los COMENTARIOS de este post
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  // Si no existe el post, mostramos error
  if (!post) {
    return <div className="text-white text-center mt-20">Post no encontrado</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-white">
      <Link href="/" className="text-gray-500 hover:text-white mb-6 block transition">
        &larr; Volver al muro
      </Link>

      {/* --- TÍTULO GIGANTE (NUEVO) --- */}
      {post.title && (
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
          {post.title}
        </h1>
      )}
      {/* ----------------------------- */}

      {/* EL POST */}
      <article className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg mb-10">
        <p className="text-2xl text-white leading-relaxed whitespace-pre-wrap">{post.content}</p>



        {/* --- BLOQUE DE IMAGEN (NUEVO) --- */}
        {post.image_url && (
          <div className="mb-6 rounded-lg overflow-hidden  border-gray-800 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.image_url} 
              alt="Imagen del post" 
              className="w-auto max-h-[500px] object-contain" // Le puse un poco más de altura (500px) para que luzca
            />
          </div>
        )}
        {/* -------------------------------- */}

        <div className="mt-4 text-gray-500 text-sm">
            {new Date(post.created_at).toLocaleString()}
        </div>
      </article>

      {/* LOS COMENTARIOS */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-2xl font-bold text-blue-500 mb-6">
            Comentarios ({comments?.length || 0})
        </h3>

        <div className="space-y-4 mb-10">
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-black p-4 rounded-lg border border-gray-800">
            
            {/* --- NUEVO CONTENEDOR FLEX (Lado a Lado) --- */}
            <div className="flex gap-4 items-start">

              {/* 1. IMAGEN A LA IZQUIERDA (Tamaño limitado) */}
              {comment.image_url && (
                // 'shrink-0' es vital: impide que el texto aplaste la imagen si es muy largo.
                <div className="shrink-0">
                  <a href={comment.image_url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                      src={comment.image_url}
                      alt="Imagen en comentario"
                      // CLASES CLAVE:
                      // w-24 h-24 sm:w-32 sm:h-32 -> Define un tamaño cuadrado fijo (96px en móvil, 128px en PC).
                      // object-cover -> "Recorta" la imagen para llenar el cuadrado sin deformarla.
                      // Si prefieres que se vea entera aunque queden bordes negros, usa 'object-contain'.
                      className="rounded border border-gray-800 w-24 h-24 sm:w-32 sm:h-32 object-cover hover:opacity-80 transition"
                      />
                  </a>
                </div>
              )}

              {/* 2. TEXTO A LA DERECHA (Ocupa el resto) */}
              <div className="flex-1 min-w-0">
                {/* Agregué 'break-words' por si alguien pega un link gigante sin espacios, para que no rompa el diseño */}
                <p className="text-gray-300 mb-2 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                
                <span className="text-xs text-gray-600 block text-right mt-2">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>

            </div>
            {/* ------------------------------------------- */}

          </div>
        ))}

        {comments?.length === 0 && (
          <p className="text-gray-600 italic">Nadie ha comentado aún.</p>
        )}
      </div>

        {/* EL FORMULARIO PARA COMENTAR */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h4 className="text-white font-bold mb-4">Deja tu comentario:</h4>
          {/* Le pasamos el ID del post al formulario para que sepa dónde guardar */}
          <CommentForm postId={id} />
        </div>
      </div>
    </div>
  );
}