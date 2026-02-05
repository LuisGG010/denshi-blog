'use client'

import { useState, useRef } from 'react';
// import { supabase } from '@/lib/supabase'; // <-- YA NO LO NECESITAMOS AQUÍ
import { useRouter } from 'next/navigation';

export default function NewPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [accentColor, setAccentColor] = useState('#3b82f6');
  
  // Estado para el color del TEXTO INTERNO
  const [textColor, setTextColor] = useState('#ff0000'); 
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const textareaRef = useRef(null);

  // FUNCIÓN PARA INSERTAR CÓDIGO DE COLOR
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

  // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // EN LUGAR DE SUPABASE DIRECTO, LLAMAMOS AL ROBOT (API)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_post', // Le decimos "Quiero crear"
        data: {
          title: title,
          content: content,
          image_url: imageUrl || null,
          color: accentColor
        }
      })
    });

    const result = await res.json();

    if (!res.ok) {
      alert("Error: " + result.error);
    } else {
      // SI TODO SALIÓ BIEN, LIMPIAMOS
      setTitle('');
      setContent('');
      setImageUrl('');
      alert("¡Post creado con éxito!"); // Feedback visual
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className='bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-xl'>
      
      {/* Título y Color */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1 font-bold">Título:</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-black text-white border border-gray-700 rounded text-lg font-bold"
          style={{ color: accentColor }} 
          required
        />
      </div>

      <div className="mb-6 flex items-center gap-4 border-b border-gray-800 pb-4">
         <div>
            <span className="text-xs text-gray-500 block mb-1">Color del Título:</span>
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="cursor-pointer bg-transparent h-8 w-8"/>
         </div>
      </div>

      {/* --- BARRA DE HERRAMIENTAS DE TEXTO --- */}
      <div className="mb-2 flex items-center gap-2 bg-gray-800 p-2 rounded-t-lg border border-gray-700 border-b-0">
         <span className="text-xs text-gray-400 font-bold mr-2">Herramientas:</span>
         
         <div className="flex items-center gap-2 bg-black px-2 py-1 rounded border border-gray-600">
            <input 
                type="color" 
                value={textColor} 
                onChange={(e) => setTextColor(e.target.value)}
                className="w-6 h-6 bg-transparent border-none cursor-pointer"
                title="Elige color para el texto"
            />
            <button 
                type="button"
                onClick={insertColorTag}
                className="text-xs font-bold text-white hover:text-blue-400 transition"
            >
                Agregar Color
            </button>
         </div>
         
         <div className="text-[10px] text-gray-500 ml-auto">
            Usa el botón para insertar texto coloreado
         </div>
      </div>

      {/* CONTENIDO */}
      <div className="mb-4">
        <textarea
          ref={textareaRef}
          className='w-full p-3 bg-black text-white border border-gray-700 rounded-b-lg focus:border-blue-500 focus:outline-none min-h-[150px]'
          placeholder="Escribe aquí..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      {/* Link de Imagen */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Link de imagen (Opcional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 bg-black text-blue-400 border border-gray-700 rounded text-sm"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className='w-full text-white font-bold py-2 px-4 rounded transition shadow-lg'
        style={{ backgroundColor: accentColor }}
      >
        {loading ? 'Publicando...' : 'Publicar Post'}
      </button>
    </form>
  );
}