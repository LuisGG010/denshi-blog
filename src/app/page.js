import { supabase } from '@/lib/supabase';
import Link from 'next/link'; // <--- Importamos Link para los botones

export const revalidate = 0;

export default async function Home() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error("Error cargando posts:", error);

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <header className='mb-12 text-center'>
        <h1 className="text-4xl font-bold text-blue-500 mb-2">Diario de Denshi</h1>
        <p className="text-gray-400">Mis actualizaciones y proyectos.</p>
      </header>

      {/* YA NO HAY FORMULARIO AQUÍ. ES SOLO LECTURA. */}

      <div className='space-y-6'>
        {posts?.map((post) => (
          <article
            key={post.id}
            className='p-6 border border-gray-800 rounded-lg bg-gray-900 hover:border-blue-500 transition'
          >
            <p className='text-xl text-gray-200 mb-4'>{post.content}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                
                {/* Botón para ir a comentar */}
                <Link 
                    href={`/blog/${post.id}`}
                    className="text-blue-400 hover:text-white font-semibold"
                >
                    Comentar / Ver detalle &rarr;
                </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}