'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewPostForm() {
  const [title, setTitle] = useState(''); // <--- NUEVO
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('posts')
      .insert({ 
        title: title, // <--- GUARDAMOS EL TÍTULO
        content: content, 
        image_url: imageUrl || null
      });

    if (error) {
      alert("Error guardando el post");
    } else {
      setTitle(''); // Limpiamos
      setContent('');
      setImageUrl('');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className='bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl'>
      
      {/* INPUT DE TÍTULO (NUEVO) */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1 font-bold">Título:</label>
        <input 
          type="text" 
          placeholder="Un título pegajoso..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-black text-white border border-gray-700 rounded focus:border-blue-500 focus:outline-none text-lg font-bold"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Contenido:</label>
        <textarea
          className='w-full p-3 bg-black text-white border border-gray-700 rounded focus:border-blue-500 focus:outline-none'
          placeholder="¿Qué estás pensando hoy?"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Link de imagen (Opcional):</label>
        <input 
          type="text" 
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 bg-black text-blue-400 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {imageUrl && (
        <div className="mb-4 p-2 border border-gray-700 rounded bg-black flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt="Vista previa" 
            className="max-h-40 rounded object-contain"
            onError={(e) => e.target.style.display = 'none'} 
          />
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50'
      >
        {loading ? 'Publicando...' : 'Publicar Post'}
      </button>
    </form>
  );
}