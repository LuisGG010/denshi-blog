'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff']

export default function EditPostForm({ post }) {
  const router = useRouter()
  const textareaRef = useRef(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    id: post.id,
    title: post.title || '',
    content: post.content || '',
    image_url: post.image_url || '',
    color: post.color || '#3b82f6',
    textColor: '#10b981' 
  })

  const insertColorTag = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const colorSnippet = `[TEXTO](#color=${formData.textColor})`
    const newContent = formData.content.substring(0, start) + colorSnippet + formData.content.substring(end)
    setFormData({ ...formData, content: newContent })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 1, start + 6) 
    }, 10)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_post', // 👈 Tu API debe reconocer esta acción
          data: formData
        })
      })

      if (res.ok) {
        alert("¡Post actualizado! 🛠️")
        router.push('/admin')
        router.refresh()
      } else {
        const errorData = await res.json()
        alert("Error: " + errorData.error)
      }
    } catch (error) {
      alert("Error de red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white font-mono">
      {/* Título */}
      <div>
        <label className="text-gray-500 text-[10px] font-bold mb-1 block uppercase tracking-widest">Editar Título</label>
        <input 
          type="text" 
          className="w-full bg-gray-900 border border-gray-800 p-3 rounded focus:outline-none focus:border-blue-500 text-lg"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      {/* Selectores de Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
          <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Tema del Post</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                  className={`w-4 h-4 rounded-full border ${formData.color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <input type="color" className="w-6 h-6 bg-transparent cursor-pointer ml-auto" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
          </div>
        </div>

        <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
          <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Pincel de Texto</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setFormData({...formData, textColor: c})}
                  className={`w-4 h-4 rounded-full border ${formData.textColor === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <input type="color" className="w-6 h-6 bg-transparent cursor-pointer ml-auto" value={formData.textColor} onChange={e => setFormData({...formData, textColor: e.target.value})} />
          </div>
        </div>
      </div>

      {/* Editor Markdown */}
      <div className="relative">
        <div className="flex justify-between items-center mb-1 px-1">
          <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Contenido</label>
          <button type="button" onClick={insertColorTag} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1 rounded-full transition-all">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.textColor, boxShadow: `0 0 8px ${formData.textColor}` }} />
            <span className="text-[9px] font-bold">PINTAR</span>
          </button>
        </div>
        <textarea 
          ref={textareaRef}
          className="w-full bg-gray-900 border border-gray-800 p-4 rounded h-96 font-mono text-sm focus:outline-none focus:border-blue-500"
          style={{ borderLeft: `4px solid ${formData.color}` }}
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="font-bold py-4 rounded mt-2 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.3em] text-xs"
        style={{ backgroundColor: formData.color, color: formData.color === '#ffffff' ? 'black' : 'white' }}
      >
        {loading ? 'Guardando...' : 'Actualizar Post'}
      </button>
    </form>
  )
}