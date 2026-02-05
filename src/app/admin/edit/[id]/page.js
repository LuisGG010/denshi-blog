'use client'

import { useState, useEffect, useRef, use } from 'react'; 
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditPostPage({ params }) {
  const { id } = use(params); 
  const router = useRouter();
  const textareaRef = useRef(null); // Para la herramienta de texto
  
  // --- ESTADOS ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [accentColor, setAccentColor] = useState('#3b82f6'); // <--- NUEVO: Color del Post
  const [textColor, setTextColor] = useState('#ff0000'); // <--- NUEVO: Color para la herramienta de texto
  
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
        setAccentColor(postData.color || '#3b82f6'); // <--- CARGAMOS EL COLOR GUARDADO
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

  // FUNCIÓN PARA INSERTAR COLOR EN EL TEXTO (Igual que en crear post)
  const insertColorTag = () => {
    const tag = `[Escribe aquí](#color=${textColor})`;
    const textarea = textareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end, content.length);
        const selectedText = content.substring(start, end);
        const finalTag = selectedText ? `[${selectedText}](#color=${textColor})` : tag;
        setContent(textBefore + finalTag + textAfter);
    } else {
        setContent(content + tag);
    }
  };

  // 2. GUARDAR CAMBIOS DEL POST
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // LLAMAMOS AL ROBOT
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_post',
        id: id,
        data: { // Estos son los datos nuevos
          title: title,
          content: content,
          image_url: imageUrl || null,
          color: accentColor
        }
      })
    });

    const responseData = await res.json();

    if (!res.ok) alert('Error: ' + responseData.error);
    else {
      router.push('/admin');
      router.refresh();
    }
  };

  // 3. BORRAR COMENTARIO
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Borrar este comentario?")) return;

    // LLAMAMOS AL ROBOT PARA BORRAR EL COMENTARIO
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_comment',
        id: commentId
      })
    });

    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId));
    } else {
      alert("Error al borrar comentario");
    }
  };

  if (loading) return <div className="text-white p-10">Cargando datos...</div>;

  return (
    <div className='min-h-screen p-10 flex flex-col items-center bg-black text-white'>
      <h1 className='text-2xl font-bold mb-6' style={{ color: accentColor }}>
        Editar Post & Moderar
      </h1>

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
                className='w-full p-3 bg-gray-900 border border-gray-700 rounded text-lg font-bold focus:outline-none'
                style={{ color: accentColor, borderColor: accentColor }} // Preview en vivo
            />
        </div>

        {/* SELECTOR DE COLOR DEL TEMA */}
        <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
            <div>
                <label className="text-gray-400 text-sm font-bold block mb-1">Color del Tema:</label>
                <div className="flex items-center gap-3">
                    <input 
                        type="color" 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs text-gray-500 font-mono">{accentColor}</span>
                </div>
            </div>
        </div>

        {/* BARRA DE HERRAMIENTAS DE TEXTO */}
        <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-t-lg border border-gray-700 border-b-0">
             <span className="text-xs text-gray-400 font-bold mr-2">Herramientas:</span>
             <div className="flex items-center gap-2 bg-black px-2 py-1 rounded border border-gray-600">
                <input 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 bg-transparent border-none cursor-pointer"
                />
                <button 
                    type="button"
                    onClick={insertColorTag}
                    className="text-xs font-bold text-white hover:text-blue-400 transition"
                >
                    Agregar Color
                </button>
             </div>
        </div>

        {/* CONTENIDO */}
        <div>
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className='w-full p-4 bg-gray-900 border border-gray-700 rounded-b-lg text-white h-60 focus:outline-none focus:border-blue-500'
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

        <div className="flex gap-4 mt-2">
          <Link href="/admin" className='flex-1 py-3 text-center bg-gray-800 rounded hover:bg-gray-700 transition'>
            Cancelar
          </Link>
          <button 
            type="submit" 
            className='flex-1 py-3 text-white rounded font-bold transition shadow-lg'
            style={{ backgroundColor: accentColor }} // Botón del color del tema
          >
            Guardar Cambios
          </button>
        </div>
      </form>

      {/* --- ZONA DE MODERACIÓN --- */}
      <div className='w-full max-w-md'>
        <h3 className='text-xl font-bold mb-4' style={{ color: accentColor }}>
          Moderar Comentarios ({comments.length})
        </h3>

        <div className='space-y-3'>
          {comments.map((comment) => (
            <div key={comment.id} className='bg-gray-900/50 p-3 rounded border border-gray-800 flex gap-4 items-start group'>
              
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

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="pr-2">
                        <span className="font-bold text-xs block mb-1" style={{ color: accentColor }}>
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