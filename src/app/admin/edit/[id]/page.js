'use client'
import { useState, useEffect, use, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 🎨 Paleta de colores consistente
const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff']

export default function EditPostPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const textareaRef = useRef(null) // Referencia para el pintor
  
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState({ title: '', content: '', image_url: '', color: '#3b82f6' })
  const [textColor, setTextColor] = useState('#10b981') // Color del pincel
  const [comments, setComments] = useState([])

  // 1. CARGAR DATOS
  useEffect(() => {
    const loadData = async () => {
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()
      
      if (postData) {
        setPost({
          title: postData.title,
          content: postData.content,
          image_url: postData.image_url || '',
          color: postData.color || postData.accent_color || '#3b82f6'
        })
      }

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
      
      if (commentsData) setComments(commentsData)
      setLoading(false)
    }
    loadData()
  }, [id])

  // ✨ FUNCIÓN PARA INYECTAR COLOR (IGUALITO A CREATE)
  const insertColorTag = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const colorSnippet = `[TEXTO](#color=${textColor})`
    const newContent = post.content.substring(0, start) + colorSnippet + post.content.substring(end)
    
    setPost({ ...post, content: newContent })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 1, start + 6) 
    }, 10)
  }

  // 2. GUARDAR CAMBIOS
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
        const res = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_post',
            id: id,
            data: post
          })
        })

        const dataResponse = await res.json(); 
        if (res.ok) {
          alert("✅ Post actualizado correctamente")
          router.refresh()
          router.push('/admin')
        } else {
          alert("❌ Error: " + (dataResponse.error || "Error desconocido"));
        }
    } catch (error) {
        alert("❌ Error de Conexión");
    }
  }

  // 3. BORRAR COMENTARIO
  const handleDeleteComment = async (commentId) => {
    if (!confirm("¿Borrar este comentario?")) return
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_comment', id: commentId })
    })
    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white p-10 font-mono">Cargando datos del sistema...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 flex flex-col items-center font-mono">
      <div className="max-w-3xl w-full">
        
        <Link href="/admin" className="text-gray-500 hover:text-white mb-8 inline-block text-xs uppercase tracking-widest transition-colors">
          &larr; Volver al Panel
        </Link>

        <h1 className="text-2xl font-bold mb-8 tracking-tighter" style={{ color: post.color }}>
          MODO_EDICIÓN: <span className="text-white">{post.title.substring(0, 20)}...</span>
        </h1>

        <form onSubmit={handleUpdate} className="flex flex-col gap-6 bg-black border border-gray-900 p-6 rounded-xl shadow-2xl mb-12">
          
          {/* TÍTULO */}
          <div>
            <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Título de la Entrada</label>
            <input 
              className="w-full bg-gray-900/50 border border-gray-800 p-3 rounded focus:border-blue-500 outline-none transition-all"
              value={post.title}
              onChange={e => setPost({...post, title: e.target.value})}
              required
            />
          </div>

          {/* SELECTORES DE COLOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TEMA DEL POST */}
            <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
              <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Tema (Borde/Botón)</label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setPost({...post, color: c})}
                      className={`w-4 h-4 rounded-full border ${post.color === c ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <input type="color" className="w-6 h-6 bg-transparent cursor-pointer ml-auto" value={post.color} onChange={e => setPost({...post, color: e.target.value})} />
              </div>
            </div>

            {/* PINCEL DE TEXTO */}
            <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
              <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Pincel (Markdown)</label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setTextColor(c)}
                      className={`w-4 h-4 rounded-full border ${textColor === c ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <input type="color" className="w-6 h-6 bg-transparent cursor-pointer ml-auto" value={textColor} onChange={e => setTextColor(e.target.value)} />
              </div>
            </div>
          </div>

          {/* IMAGEN URL */}
          <div>
            <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Imagen URL</label>
            <input 
              className="w-full bg-gray-900/50 border border-gray-800 p-3 rounded focus:border-blue-500 outline-none"
              value={post.image_url}
              onChange={e => setPost({...post, image_url: e.target.value})}
            />
          </div>

          {/* EDITOR CON BOTÓN PINTAR */}
          <div className="relative">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Contenido Markdown</label>
              <button
                type="button"
                onClick={insertColorTag}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-full transition-all active:scale-95"
              >
                <span className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: textColor, boxShadow: `0 0 8px ${textColor}` }} />
                <span className="text-[9px] font-bold">PINTAR TEXTO</span>
              </button>
            </div>
            <textarea 
              ref={textareaRef}
              className="w-full bg-gray-900/50 border border-gray-800 p-4 rounded h-96 font-mono text-sm focus:border-blue-500 outline-none transition-all"
              style={{ borderLeft: `4px solid ${post.color}` }}
              value={post.content}
              onChange={e => setPost({...post, content: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="w-full py-4 rounded font-bold text-black transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs shadow-lg" style={{ backgroundColor: post.color, color: post.color === '#ffffff' ? 'black' : 'white' }}>
            ACTUALIZAR ENTRADA 💾
          </button>
        </form>

        {/* SECCIÓN DE COMENTARIOS (TU LÓGICA ORIGINAL) */}
        <div className="w-full border-t border-gray-900 pt-10 pb-20">
            <h3 className="text-lg font-bold text-gray-500 mb-6 uppercase tracking-widest">Moderación ({comments.length})</h3>
            <div className="grid gap-3">
                {comments.map(c => (
                    <div key={c.id} className="group bg-black/40 border border-gray-900 p-4 rounded-lg flex justify-between items-start hover:border-gray-700 transition-colors">
                        <div>
                            <span className="text-green-500 text-[10px] font-bold uppercase tracking-tighter block mb-2">{c.author || 'Anónimo'}</span>
                            <p className="text-gray-400 text-sm leading-relaxed">{c.content}</p>
                        </div>
                        <button onClick={() => handleDeleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500 transition-all p-1">
                            BORRAR_🗑️
                        </button>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-gray-700 italic text-sm text-center py-10">No hay interacciones registradas.</p>}
            </div>
        </div>

      </div>
    </div>
  )
}