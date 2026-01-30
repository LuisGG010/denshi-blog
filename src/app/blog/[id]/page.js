import { supabase } from "@/lib/supabase"; // 1. Traemos la conexión
import Link from "next/link";
import { notFound } from "next/navigation"; // Para mostrar error 404 si no existe
import CommentForm from "@/app/CommentForm";

export const revalidate = 0; // No cachear esta página

// Esta función recibe "params", que son los datos de la URL (ej: el ID)
export default async function PostPage({ params }) {
  
  // A. CAPTURAR EL ID
  // Si la URL es /blog/14, entonces id será "14"
  const { id } = await params;

  // B. PREGUNTAR A LA BASE DE DATOS
  // Le decimos: "Supabase, de la tabla 'posts', dame la fila donde el id sea igual a este número"
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)     // .eq significa "equal" (igual a)
    .single();        // .single significa "solo dame uno, no una lista"


  const {data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id) // Filtrar por post_id
    .order('created_at', { ascending: true }); // Ordenar por fecha ascendente

  // C. SEGURIDAD (Si no existe el post)
  if (error || !post) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-red-500">404</h1>
            <p className="text-gray-400 mt-2">Este post no existe o fue borrado.</p>
            <Link href="/" className="mt-6 text-blue-500 hover:underline">Volver al inicio</Link>
        </div>
    );
  }

  // D. MOSTRAR EL POST (Si todo salió bien)
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      {/* Botón de volver */}
      <Link href="/" className="text-gray-500 hover:text-white mb-6 block transition">
        &larr; Volver al muro
      </Link>

      {/* El contenido del Post */}
      <article className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg">
        <p className="text-2xl text-white leading-relaxed">
            {post.content}
        </p>
        
        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center text-gray-500 text-sm">
            <span>Publicado el: {new Date(post.created_at).toLocaleString()}</span>
        </div>
      </article>

      {/* ZONA DE COMENTARIOS (Aquí irá la siguiente fase) */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-2xl font-bold text-blue-500 mb-6">Comentarios ({comments?.length || 0})</h3> {/* Formulario para nuevo comentario */}

        {/*Lista de comentarios existentes */}
        <div className="space-y-6 mb-10">
          {comments?.map((comment) => (
            <div key={comment.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <p className="text-gray-300">{comment.content}</p>
              <span className="text-xd text-gray-600 mt-2 block">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          
          {comments?.length === 0 && (
            <p className="text-gray-600 italic">Sé el primero en comentar...</p>
          )}
        </div>

        {/* El formulario para agregar uno nuevo */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h4 className="text-white font-bold mb-4">Deja tu opinión:</h4>
          <CommentForm postId={id}></CommentForm>
        </div>

      </div>
    </div>
  );
}