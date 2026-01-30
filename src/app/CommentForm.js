'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }) {
  const [comment, setComment] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setEnviando(true);

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          content: comment,
          post_id: postId
        }
      ]);
    if (error) {
      console.error(error);
      alert("Error al enviar el comentario");
    } else {
      setComment('');
      router.refresh();
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
      <textarea
        placeholder='Escribe un comentario...'
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className='w-full p-3 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-green-500 h-24 resize-none'
        disabled={enviando}
        />
        <button
          type="submit"
          disabled={enviando || !comment}
          className='self-end px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold text-sm'
        >
          {enviando ? 'Enviando...' : 'Comentar'}
        </button>
    </form>
  );
}