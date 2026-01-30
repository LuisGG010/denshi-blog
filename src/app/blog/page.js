'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAMOS LOS POSTS (Igual que siempre)
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false }); // Los más nuevos primero
      
      if (error) console.log('Error:', error);
      else setPosts(data || []);
      
      setLoading(false);
    };

    fetchPosts();
  }, []);

  // 2. LÓGICA DE AGRUPACIÓN (La Magia ✨)
  // Convertimos la lista plana de posts en un objeto: { "2026": [...], "2025": [...] }
  const groupedPosts = posts.reduce((grupos, post) => {
    const year = new Date(post.created_at).getFullYear();
    if (!grupos[year]) {
      grupos[year] = [];
    }
    grupos[year].push(post);
    return grupos;
  }, {});

  // Obtenemos los años ordenados (Del más reciente al más antiguo)
  const years = Object.keys(groupedPosts).sort((a, b) => b - a);

  if (loading) return <div className="text-white p-10 animate-pulse">Cargando la historia...</div>;

  return (
    <div className="max-w-4xl mx-auto pt-6">
      
      <h1 className="text-4xl font-bold text-white mb-2 border-b border-gray-800 pb-4">
        📚 Archivo del Blog
      </h1>
      <p className="text-gray-400 mb-10">Explorando mis ideas a través del tiempo.</p>

      {/* 3. RENDERIZADO POR AÑOS */}
      <div className="space-y-12">
        
        {years.map((year) => (
          <div key={year} className="relative">
            
            {/* EL AÑO (Sticky Header) - Se queda pegado arriba al hacer scroll */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm py-4 border-b border-blue-900/50 mb-6">
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gray-800">
                {year}
              </h2>
            </div>

            {/* LISTA DE POSTS DE ESE AÑO */}
            <div className="grid gap-6 pl-4 border-l-2 border-gray-800 ml-4">
              
              {groupedPosts[year].map((post) => (
                <article 
                  key={post.id} 
                  className="group relative bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition hover:bg-gray-900"
                >
                  {/* Puntito de la línea de tiempo */}
                  <div className="absolute -left-[25px] top-8 w-4 h-4 rounded-full bg-gray-800 border-2 border-black group-hover:bg-blue-500 transition"></div>

                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* IMAGEN (Si tiene) */}
                    {post.image_url && (
                      <div className="shrink-0 w-full md:w-48 h-32 overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                    )}

                    {/* TEXTO */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        {/* Título con Link */}
                        <Link href={`/blog/${post.id}`}>
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                            {post.title || "Post sin título"}
                          </h3>
                        </Link>
                        
                        {/* Fecha corta (ej: 24 Ene) */}
                        <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded border border-gray-800">
                          {new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 line-clamp-2 text-sm">
                        {post.content}
                      </p>

                      <Link href={`/blog/${post.id}`} className="inline-block mt-3 text-sm text-blue-500 hover:text-white transition">
                        Leer más →
                      </Link>
                    </div>

                  </div>
                </article>
              ))}

            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 bg-gray-900 rounded-xl border border-dashed border-gray-700">
            <p className="text-xl text-gray-500">Aún no has escrito historia.</p>
            <p className="text-sm text-gray-600">Ve al admin y crea tu primer post.</p>
          </div>
        )}

      </div>
    </div>
  );
}