'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // FUNCIÓN DE LIMPIEZA DE TEXTO
  const getPlainText = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') 
      .replace(/!\[.*?\]\(.*?\)/g, '') 
      .replace(/(\*\*|__|\*|_|`)/g, '') 
      .replace(/^#+\s+/gm, '') 
      .replace(/\n/g, ' ') 
      .trim();
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, comments(count)') 
        .order('created_at', { ascending: false });
      
      if (error) console.log('Error:', error);
      else setPosts(data || []);
      
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const term = searchTerm.toLowerCase();
    const title = (post.title || '').toLowerCase();
    const content = (post.content || '').toLowerCase();
    return title.includes(term) || content.includes(term);
  });

  const groupedPosts = filteredPosts.reduce((grupos, post) => {
    const year = new Date(post.created_at).getFullYear();
    if (!grupos[year]) grupos[year] = [];
    grupos[year].push(post);
    return grupos;
  }, {});

  const years = Object.keys(groupedPosts).sort((a, b) => b - a);

  if (loading) return <div className="bg-black/40 text-white p-10 animate-pulse">Cargando la historia...</div>;

  return (
    <div className="min-h-screen bg-black/40"> 
      
      {/* --- 2. CAPA CONTENIDO (z-10) --- */}
      <div className="relative z-10 max-w-4xl mx-auto pt-24 px-4 pb-20"> 
        
        <h1 className="text-4xl font-bold text-white mb-2 border-b border-gray-800 pb-4">
          📚 Archivo del Blog
        </h1>
        <p className="text-gray-400 mb-8">Explorando mis ideas a través del tiempo.</p>

        {/* BARRA DE BÚSQUEDA */}
        <div className="mb-12 relative group">
          <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-xl">🔍</span>
          </div>
          <input 
              type="text" 
              placeholder="Buscar memoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition shadow-lg placeholder-gray-600"
          />
          {searchTerm && (
              <div className="text-right mt-2 text-sm text-gray-500">
                  {filteredPosts.length} resultados encontrados
              </div>
          )}
        </div>

        <div className="space-y-12">
          {years.map((year) => (
            <div key={year} className="relative">
              
              {/* AÑO STICKY (Con backdrop-blur para que se vea genial sobre el video) */}
              <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md py-4 border-b border-blue-900/50 mb-6">
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gray-800">
                  {year}
                </h2>
              </div>

              {/* LISTA DE POSTS */}
              <div className="grid gap-6 pl-4 border-l-2 border-gray-800 ml-4">
                
                {groupedPosts[year].map((post) => (
                  <article 
                    key={post.id} 
                    className="group relative bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition hover:bg-gray-900/80"
                  >
                    <div className="absolute -left-[25px] top-8 w-4 h-4 rounded-full bg-gray-800 border-2 border-black group-hover:bg-blue-500 transition"></div>

                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* IMAGEN */}
                      {post.image_url && (
                        <div className="shrink-0 w-full md:w-48 h-32 overflow-hidden rounded-lg border border-gray-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={post.image_url} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        </div>
                      )}

                      {/* CONTENIDO */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/blog/${post.id}`}>
                            <h3 
                              className="text-xl font-bold text-white group-hover:opacity-80 transition"
                              style={{ color: post.color || 'white' }} 
                            >
                              {post.title || "Post sin título"}
                            </h3>
                          </Link>
                          
                          <span className="text-xs font-mono text-gray-500 bg-black/50 px-2 py-1 rounded border border-gray-800 shrink-0 ml-2">
                            {new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 line-clamp-2 text-sm mb-4">
                          {getPlainText(post.content)}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <Link href={`/blog/${post.id}`} className="text-blue-500 hover:text-white transition font-bold">
                            Leer más →
                          </Link>

                          <div className="flex items-center gap-1 text-gray-500 group-hover:text-gray-300 transition" title="Comentarios">
                              <span>💬</span>
                              <span>{post.comments && post.comments[0] ? post.comments[0].count : 0}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </article>
                ))}

              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
              <p className="text-xl text-gray-500">
                  {searchTerm ? `No hay nada sobre "${searchTerm}" en los archivos.` : 'Aún no has escrito historia.'}
              </p>
              {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-blue-400 mt-2 hover:underline">
                      Borrar búsqueda
                  </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}