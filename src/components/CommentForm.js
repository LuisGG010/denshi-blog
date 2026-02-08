'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// 1. AÑADIMOS 'postTitle' AQUÍ 👇
export default function CommentForm({ postId, postTitle }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);

    // Guardar en Supabase (Base de datos)
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content: content,
        author: author || 'Anónimo',
        image_url: imageUrl || null
      });

    if (error) {
      alert("Error enviando comentario");
    } else {
      
      // --- AVISAR A DISCORD ---
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            author: author || 'Anónimo',
            content: content,
            // 2. ENVIAMOS EL TÍTULO REAL AQUÍ 👇
            postTitle: postTitle || 'Sin título' 
        })
      });
      // ------------------------

      setContent('');
      setAuthor('');
      setImageUrl('');
      router.refresh();
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