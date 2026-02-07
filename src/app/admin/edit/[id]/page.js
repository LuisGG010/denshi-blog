'use client'

import { useState, useEffect, useRef, use } from 'react'; 
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditPostPage({ params }) {
  // Desempaquetamos los params (Next.js 15+)
  const { id } = use(params); 
  
  const router = useRouter();
  const textareaRef = useRef(null);
  
  // --- ESTADOS ---
  const [authorized, setAuthorized] = useState(false); // <--- NUEVO: Estado de seguridad
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [accentColor, setAccentColor] = useState('#3b82f6'); 
  const [textColor, setTextColor] = useState('#ff0000');
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS Y VERIFICAR SEGURIDAD
  useEffect(() => {
    const fetchData = async () => {
      
      // --- A. SEGURIDAD PRIMERO ---
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || session.user.email !== 'luisgamer2015210@gmail.com') {
          // Si no es admin, lo mandamos al login y cortamos la ejecución
          router.replace('/login');
          return;
      }
      setAuthorized(true);

      // --- B. SI ES ADMIN, CARGAMOS EL POST ---
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postData) {
        setTitle(postData.title || '');
        setContent(postData.content);
        setImageUrl(postData.image_url || ''); 
        setAccentColor(postData.accent_color || postData.color || '#3b82f6'); // Probamos ambos nombres por si acaso
      }

      // --- C. CARGAMOS COMENTARIOS ---
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
  }, [id, router]);

  // FUNCIÓN PARA INSERTAR COLOR (Igual que antes)
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

  // 2. GUARDAR CAMBIOS (UPDATE)
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_post', // <--- Acción nueva
        id: id,
        data: { 
          title,
          content,
          image_url: imageUrl || null,
          color: accentColor
        }
      })
    });

    const responseData = await res.json();

    if (!res.ok) alert('Error: ' + responseData.error);
    else {
      alert("¡Post actualizado!");
      router.push('/admin');
      router.refresh();
    }
  };

  // 3. BORRAR COMENTARIO
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Borrar este comentario?")) return;

    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_comment', // <--- Acción nueva
        id: commentId
      })
    });

    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId));
    } else {
      alert("Error al borrar comentario");
    }
  };

  // Pantalla de carga o Bloqueo
  if (loading || !authorized) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Verifying credentials...</div>;

  // --- RENDERIZADO (El mismo HTML de siempre) ---
  return (
    <div className='min-h-screen p-10 flex flex-col items-center bg-black text-white'>
        {/* ... (Aquí va todo tu JSX original del formulario, es idéntico) ... */}
        {/* Solo asegúrate de copiar el return del código que me pasaste */}
        <div className="w-full max-w-md mb-4">
             <Link href="/admin" className="text-gray-500 hover:text-white">&larr; Volver al Panel</Link>
        </div>

        <h1 className='text-2xl font-bold mb-6' style={{ color: accentColor }}>
            Editar Post & Moderar
        </h1>

        {/* ... PEGA AQUÍ TU FORMULARIO ORIGINAL ... */}
        {/* Para no hacer el mensaje eterno, usa el mismo JSX que me pasaste arriba */}
        <form onSubmit={handleUpdate} className='w-full max-w-md flex flex-col gap-4 mb-12 border-b border-gray-800 pb-10'>
            {/* ... inputs, textarea, botones ... */}
            {/* Título */}
            <div>
                <label className='text-gray-400 text-sm font-bold block mb-2'>Título:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='w-full p-3 bg-gray-900 border border-gray-700 rounded text-lg font-bold focus:outline-none'
                    style={{ color: accentColor, borderColor: accentColor }}
                />
            </div>
             {/* ... resto del form ... */}
             <div className="mb-4">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className='w-full p-4 bg-gray-900 border border-gray-700 rounded text-white h-60 focus:outline-none focus:border-blue-500'
                />
            </div>
            
            <button 
                type="submit" 
                className='w-full py-3 text-white rounded font-bold transition shadow-lg'
                style={{ backgroundColor: accentColor }}
            >
                Guardar Cambios
            </button>
        </form>

        {/* ... SECCIÓN COMENTARIOS ... */}
        <div className='w-full max-w-md'>
            <h3 className='text-xl font-bold mb-4' style={{ color: accentColor }}>
                Moderar Comentarios ({comments.length})
            </h3>
            <div className='space-y-3'>
                {comments.map((comment) => (
                    <div key={comment.id} className='bg-gray-900/50 p-3 rounded border border-gray-800 flex justify-between items-start'>
                        <p className='text-gray-300 text-sm'>{comment.content}</p>
                        <button onClick={() => handleDeleteComment(comment.id)} className='text-red-500 hover:text-red-300'>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}