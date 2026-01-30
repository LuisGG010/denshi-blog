import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Esto hace que la página no se guarde en caché y siempre muestre lo nuevo
export const revalidate = 0;

export default async function Home() {
  // Pedimos los posts a Supabase
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className='max-w-2xl mx-auto py-10 text-white'>
      <header className='mb-12 text-center'>
        <h1 className="text-4xl font-bold text-blue-500 mb-2">Diario de Denshi</h1>
        <p className="text-gray-400">Mis actualizaciones y proyectos.</p>
      </header>

      <div className='space-y-6'>
        {posts?.map((post) => (
          <article
            key={post.id}
            className='p-6 border border-gray-800 rounded-lg bg-gray-900 hover:border-blue-500 transition overflow-hidden'
          >
            
            {/* --- TÍTULO (NUEVO) --- */}
            {post.title && (
              <h2 className="text-2xl font-bold text-white mb-4 hover:text-blue-400 transition">
                <Link href={`/blog/${post.id}`}>
                  {post.title}
                </Link>
              </h2>
            )}
            {/* ---------------------- */}

            {/* IMAGEN */}
            {post.image_url && (
              <div className="mb-4 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image_url} 
                  alt="Imagen del post" 
                  className="rounded-lg border border-gray-800 max-h-96 w-auto object-contain"
                />
              </div>
            )}

            
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                
                <Link 
                    href={`/blog/${post.id}`}
                    className="text-blue-400 hover:text-white font-semibold"
                >
                    Comentar / Ver detalle &rarr;
                </Link>
            </div>
          </article>
        ))}

        {posts?.length === 0 && (
            <p className="text-center text-gray-500">No hay nada escrito aún.</p>
        )}
      </div>
    </div>
  );
}