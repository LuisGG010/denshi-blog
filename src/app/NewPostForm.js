'use client' // Clave para componentes con estado

import { use, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewPostForm(){
  const [content, setContent] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la pagina se recargue a lo antiguo
    if (!content.trim()) return; // No enviar si el contenido está vacío

    setEnviando(true);

    const { error } = await supabase
    .from('posts')
    .insert([{ content: content }]);

    if (error) {
      console.error(error);
      alert("Error al enviar");
    } else {
      // 2. Si todo salió bien, limpiamos el campo
      setContent('');
      // 3. Recargamos la página suavemente para ver el mensaje nuevo
      router.refresh();
    }

    setEnviando(false);
  };

  return (
    <form onSubmit={handleSubmit} className='mb-10 p-4 bg-gray-900 rounded-lg border border-gray-800'>
      <input
        type="text"
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={enviando}
        className='w-full p-3 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 disabled:opacity-50'
        />

        <button
          type="submit"
          disabled={enviando}
          className='mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-bold'
        >
          {enviando ? 'Enviando...' : 'Publicar'}
        </button>
    </form>
  );
}