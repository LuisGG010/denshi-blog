'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // <--- NUEVO: Estado para la imagen del comentario
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !imageUrl.trim()) return; // No enviar si está todo vacío

    setLoading(true);

    const { error } = await supabase
      .from('comments')
      .insert({ 
        post_id: postId,
        content: content,
        image_url: imageUrl || null // <--- GUARDAMOS EL LINK AQUÍ
      });

    if (error) {
      alert("Error al comentar: " + error.message);
    } else {
      setContent('');
      setImageUrl(''); // Limpiamos el campo
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      
      {/* ÁREA DE TEXTO */}
      <textarea
        className='w-full p-3 bg-black text-white border border-gray-700 rounded mb-2 focus:border-blue-500 focus:outline-none'
        placeholder="Escribe tu opinión..."
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* INPUT PARA LINK DE IMAGEN (NUEVO) */}
      <input 
        type="text" 
        placeholder="https://... (Link de imagen opcional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full p-2 mb-2 bg-black text-blue-400 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
      />

      {/* PREVISUALIZACIÓN (NUEVO) */}
      {imageUrl && (
        <div className="mb-2 p-2 border border-gray-700 rounded bg-black flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt="Vista previa comentario" 
            className="max-h-32 rounded object-contain"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading || (!content && !imageUrl)}
        className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition disabled:opacity-50 text-sm'
      >
        {loading ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  );
}