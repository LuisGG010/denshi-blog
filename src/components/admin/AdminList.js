'use client'

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default function AdminList({ posts }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    const confirmacion = window.confirm("¿Seguro que quieres borrar este post?");
    if (!confirmacion) return;

    // 1. LLAMAMOS AL ROBOT (API) EN LUGAR DE A SUPABASE DIRECTO
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'delete_post', // Le decimos qué hacer
        id: id 
      }),
    });

    const data = await res.json();

    // 2. VERIFICAMOS SI SALIÓ BIEN
    if (!res.ok) alert("Error: " + data.error);
    else router.refresh();
  };

  return (
    <div className='w-full max-w-md mt-10 space-y-4'>
      <h2 className='text-xl text-blue-500 font-bold border-b border-gray-700 pb-2'>
        Gestionar Posts ({posts.length})
      </h2>

      {posts.map((post) => (
        <div key={post.id} className='bg-gray-900 p-4 rounded flex justify-between items-center border border-gray-800 gap-4'>
          
          {/* --- ZONA DE CONTENIDO (FOTO + TEXTO) --- */}
          <div className="flex items-center gap-3 overflow-hidden">
            
            {/* MINIATURA DE LA IMAGEN (NUEVO) */}
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt="Miniatura" 
                className="w-12 h-12 rounded object-cover border border-gray-700 shrink-0"
              />
            )}

            {/* TEXTO DEL POST */}
            <span className='text-gray-300 truncate'>
              {post.content}
            </span>
          </div>

          {/* --- ZONA DE BOTONES --- */}
          <div className='flex gap-2 shrink-0'>
            <Link 
              href={`/admin/edit/${post.id}`}
              className='bg-blue-900/50 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-600 hover:text-white transition border border-blue-900/50'
            >
              Editar
            </Link>

            <button
              onClick={() => handleDelete(post.id)}
              className='bg-red-900/50 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-600 hover:text-white transition border border-red-900/50'
            >
              X
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}