'use client'

import { useState, useEffect, use } from 'react'; 
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditPostPage({ params }) {
  const { id } = use(params); 
  const router = useRouter();
  
  // --- ESTADOS ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS
  useEffect(() => {
    const fetchData = async () => {
      // A. Pedimos el Post
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postData) {
        setTitle(postData.title || '');
        setContent(postData.content);
        setImageUrl(postData.image_url || ''); 
      }

      // B. Pedimos los Comentarios
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (commentsData) {
        setComments(commentsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 2. GUARDAR CAMBIOS DEL POST
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('posts')
      .update({ 
        title: title,
        content: content, 
        image_url: imageUrl || null 
      })
      .eq('id', id);

    if (error) alert('Error: ' + error.message);
    else {
      router.push('/admin');
      router.refresh();
    }
  };

  // 3. BORRAR COMENTARIO
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Borrar este comentario?")) return;
    
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  if (loading) return <div className="text-white p-10">Cargando datos...</div>;

  return (
    <div className='min-h-screen p-10 flex flex-col items-center bg-black text-white'>
      <h1 className='text-2xl font-bold text-blue-500 mb-6'>Editar Post & Moderar</h1>

      {/* --- FORMULARIO DE EDICIÓN DEL POST --- */}
      <form onSubmit={handleUpdate} className='w-full max-w-md flex flex-col gap-4 mb-12 border-b border-gray-800 pb-10'>
        
        {/* PREVIEW IMAGEN */}
        {imageUrl && (
            <div className="flex justify-center p-2 border border-gray-800 rounded bg-gray-900/30 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-48 rounded object-contain"
                />
            </div>
        )}

        {/* TÍTULO */}
        <div>
            <label className='text-gray-400 text-sm font-bold block mb-2'>Título:</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='w-full p-3 bg-gray-900 border border-gray-700 rounded text-white text-lg font-bold focus:outline-none focus:border-blue-500'
            />
        </div>

        {/* LINK IMAGEN */}
        <div>
            <label className='text-gray-400 text-sm font-bold block mb-2'>Link de Imagen:</label>
            <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            />
        </div>

        {/* CONTENIDO */}
        <div>
            <label className='text-gray-400 text-sm font-bold block mb-2'>Contenido:</label>
            <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='w-full p-4 bg-gray-900 border border-gray-700 rounded text-white h-40 focus:outline-none focus:border-blue-500'
            />
        </div>

        <div className="flex gap-4 mt-2">
          <Link href="/admin" className='flex-1 py-3 text-center bg-gray-800 rounded hover:bg-gray-700 transition'>
            Cancelar
          </Link>
          <button type="submit" className='flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold transition'>
            Guardar Cambios
          </button>
        </div>
      </form>

      {/* --- ZONA DE MODERACIÓN (AQUÍ ESTÁ EL CAMBIO) --- */}
      <div className='w-full max-w-md'>
        <h3 className='text-xl text-red-400 font-bold mb-4'>
          Moderar Comentarios ({comments.length})
        </h3>

        <div className='space-y-3'>
          {comments.map((comment) => (
            <div key={comment.id} className='bg-gray-900/50 p-3 rounded border border-gray-800 flex gap-4 items-start group'>
              
              {/* FOTO DEL USUARIO (Si puso imagen en el comentario) */}
              {comment.image_url && (
                 <div className="shrink-0">
                    <a href={comment.image_url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={comment.image_url} 
                            alt="Img Comentario" 
                            className="w-12 h-12 rounded object-cover border border-gray-700 hover:opacity-75"
                        />
                    </a>
                 </div>
              )}

              {/* DATOS DEL COMENTARIO */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    
                    <div className="pr-2">
                        {/* --- AQUÍ MOSTRAMOS EL AUTOR EN AZUL --- */}
                        <span className="text-blue-400 font-bold text-xs block mb-1">
                            {comment.author || 'Anónimo'}
                        </span>
                        
                        <p className='text-gray-300 text-sm break-words whitespace-pre-wrap line-clamp-4'>
                            {comment.content}
                        </p>
                    </div>
                    
                    <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className='text-red-500 hover:text-red-300 font-bold px-2 py-1 hover:bg-red-900/20 rounded transition'
                        title="Eliminar Definitivamente"
                    >
                        🗑️
                    </button>
                </div>
                <span className='text-[10px] text-gray-500 block mt-2 border-t border-gray-800 pt-1'>
                    {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>

            </div>
          ))}

          {comments.length === 0 && (
            <p className='text-gray-500 text-center italic py-4 border border-dashed border-gray-800 rounded'>
                No hay comentarios para moderar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}