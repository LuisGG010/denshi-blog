'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function PostList({ posts }) {
  const [searchTerm, setSearchTerm] = useState('');

  // --- CORRECCIÓN AQUÍ ---
  const filteredPosts = posts.filter(post => {
    // 1. Guardamos el título y contenido, si no existen ponemos texto vacío ('')
    const title = post.title ? post.title.toLowerCase() : '';
    const content = post.content ? post.content.toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    // 2. Comparamos de forma segura
    return title.includes(search) || content.includes(search);
  });
  // -----------------------

  return (
    <div>
      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="mb-8 relative">
        <input 
            type="text" 
            placeholder="🔍 Buscar en mis memorias..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition shadow-lg"
        />
        {searchTerm && (
            <span className="absolute right-4 top-4 text-gray-500 text-sm">
                {filteredPosts.length} resultados
            </span>
        )}
      </div>

      {/* --- LISTA DE POSTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <Link href={`/blog/${post.id}`} key={post.id} className="group block">
            <article className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition duration-300 shadow-lg h-full flex flex-col">
              
              {post.image_url && (
                <div className="h-48 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={post.image_url} 
                        alt={post.title || 'Sin título'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                  {post.title || 'Sin Título'} {/* Protección extra aquí también */}
                </h2>
                <div className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                   {post.content || ''} 
                </div>
                <div className="text-xs text-gray-600 border-t border-gray-800 pt-4 flex justify-between">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="text-blue-500 font-bold">Leer más &rarr;</span>
                </div>
              </div>
            </article>
          </Link>
        ))}

        {filteredPosts.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
                <p className="text-xl">No encontré nada {searchTerm ? `con "${searchTerm}"` : ''} 🕵️‍♂️</p>
                <button onClick={() => setSearchTerm('')} className="text-blue-400 mt-2 hover:underline">
                    Limpiar búsqueda
                </button>
            </div>
        )}
      </div>
    </div>
  );
}