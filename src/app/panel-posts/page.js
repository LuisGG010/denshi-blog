import Link from 'next/link';
import NewPostForm from '../NewPostForm';
import { createClient } from "@/lib/supabase-server"; // Usamos el cliente de servidor
import { deletePost } from '@/app/actions/delete-post';

// Esta linea asegura que la página no se guarde en caché y siempre muestre datos frescos
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Obtener Posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, created_at') // Traemos el content para mostrar un resumen
    .order('created_at', { ascending: false });

  return (
    <div className='min-h-screen p-10 flex flex-col items-center bg-black text-white'>
      <h1 className='text-3xl font-bold text-red-500 mb-6'>Zona de Administrador</h1>
      <p className='mb-8 text-gray-400'>Gestión de contenido</p>

      {/* Formulario de Crear (Reutilizamos tu componente) */}
      <div className='w-full max-w-2xl mb-12'>
        <NewPostForm />
      </div>

      {/* Lista de Publicaciones */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold text-blue-500 mb-4 border-b border-gray-800 pb-2">
          Posts Publicados ({posts?.length || 0})
        </h2>

        <div className="space-y-4">
          {posts?.map((post) => (
            <div key={post.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex justify-between items-center group hover:border-gray-600 transition">
              
              {/* Info del Post */}
              <div className="flex-1 pr-4">
                <p className="text-gray-300 line-clamp-1">{post.content}</p>
                <span className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <Link href={`/blog/${post.id}`} className="ml-3 text-xs text-blue-400 hover:underline">
                  Ver en vivo
                </Link>
              </div>

              {/* Botón de Eliminar */}
              <form action={async () => {
                'use server'
                await deletePost(post.id)
              }}>
                <button 
                  type="submit"
                  className="bg-red-900/30 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-600 hover:text-white transition border border-red-900/50"
                >
                  Eliminar
                </button>
              </form>
            </div>
          ))}

          {posts?.length === 0 && (
            <p className="text-gray-500 text-center">No hay posts todavía.</p>
          )}
        </div>
      </div>

      <Link href="/" className='mt-12 text-gray-500 hover:text-white transition'>
        &larr; Volver al blog público
      </Link>
    </div>
  );
}