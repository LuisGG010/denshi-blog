'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId, postTitle }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  // Cooldown visual
  useEffect(() => {
    const lastComment = localStorage.getItem('last_comment_ts');
    if (lastComment) {
      const diff = Math.floor((Date.now() - parseInt(lastComment)) / 1000);
      if (diff < 60) setTimeLeft(60 - diff);
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || timeLeft > 0) return;
    
    setLoading(true);

    try {
      // 🚀 Enviamos a nuestra API (src/app/api/comment/route.js)
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          postTitle,
          content,
          author: author || 'Anónimo',
          imageUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error enviando comentario");
        if (res.status === 429) {
          setTimeLeft(60);
          localStorage.setItem('last_comment_ts', Date.now().toString());
        }
      } else {
        // Éxito: Guardamos marca de tiempo local
        localStorage.setItem('last_comment_ts', Date.now().toString());
        setTimeLeft(60);
        setContent('');
        setAuthor('');
        setImageUrl('');
        router.refresh();
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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

      <input 
        type="text" 
        placeholder="Link de imagen (opcional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full p-2 bg-black text-gray-400 text-sm border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
      />

      <button 
        type="submit" 
        disabled={loading || timeLeft > 0}
        className={`font-bold py-2 px-4 rounded transition mt-2 text-white ${
          timeLeft > 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Enviando...' : timeLeft > 0 ? `Espera ${timeLeft}s ⏳` : 'Enviar Comentario 🚀'}
      </button>
    </form>
  );
}