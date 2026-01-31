'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(''); // <--- NUEVO ESTADO PARA EL NOMBRE
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content: content,
        author: author || 'Anónimo', // <--- ENVIAMOS EL NOMBRE
        image_url: imageUrl || null
      });

    if (error) {
      alert("Error enviando comentario");
    } else {
      setContent('');
      setAuthor(''); // Limpiamos nombre
      setImageUrl('');
      router.refresh(); // Recargamos la página para ver el comentario nuevo
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      
      {/* INPUT PARA EL NOMBRE */}
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-1 ml-1">Tu Nombre</label>
        <input
            type="text"
            placeholder="Anónimo"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-3 bg-black text-white border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
            maxLength={25}
        />
      </div>

      {/* INPUT PARA EL COMENTARIO */}
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-1 ml-1">Comentario</label>
        <textarea
            placeholder="¿Qué opinas?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 bg-black text-white border border-gray-700 rounded focus:border-blue-500 focus:outline-none h-24"
            required
        />
      </div>

      {/* INPUT PARA IMAGEN (Opcional) */}
      <input 
        type="text" 
        placeholder="Link de imagen (https://...)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full p-2 bg-black text-gray-400 text-sm border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
      />

      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 mt-2"
      >
        {loading ? 'Enviando...' : 'Enviar Comentario 🚀'}
      </button>

    </form>
  );
}