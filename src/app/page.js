import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// No almacenar en caché para ver cambios al instante
export const revalidate = 0; 

export default async function Home(){
  // Pedimos los datos en la nube
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('create_at', { ascending: false });

if (error){
  console.error('Error al obtener los posts:', error);
}

  return (
    <div className='max-w-2xl mx-auto'>
      <header className='mb-8 text-center'>
        <h1 className="text-3xl font-bold text-blue-500">Muro Social</h1>
        <p className="text-gray-400">Lo que voy aprendiendo día a día.</p>
      </header>

      <div className="mb-10 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <input
          type="text"
          placeholder="¿Qué estás pensando?"
          className='w-full p-3 bg-black border-gray-700 rounded text-white focus:outline-none focus:border-blue-500'
        />
      </div>
      <div className='space-y-4'>
        {posts?.map((post) => (
        <article
          key={post.id}
          className='p-5 border border-gray-800 rounded-lg bg-gray-900/50 hover:border-blue-500/50 transition'
          >
            <p className='text-lg text-gray-200'>{post.content}</p>
            <p className='text-gray-500 text-xs mt-3 black text-right'>
              {new Date(post.created_at).toLocaleString()}
            </p>
          </article>
          ))}

          {posts?.length === 0 && (
            <p className='text-center text-gray-500 py-10'>
              Nadie ah escrito nada aún...
            </p>
          )}
      </div>
    </div>
  );
}