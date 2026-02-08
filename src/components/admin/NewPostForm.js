'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff']

export default function NewPostForm() {
  const router = useRouter()
  const textareaRef = useRef(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    color: '#3b82f6',     // Color del tema del post
    textColor: '#10b981'  // 👈 Nuevo: Color para el resaltado de texto
  })

  // ✨ Inyecta usando el color de texto específico
  const insertColorTag = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Usamos formData.textColor aquí 👇
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
        body: JSON.stringify({ action: 'create_post', data: formData })
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      }
    } catch (error) { alert("Error de red") } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white">
      {/* TÍTULO */}
      <div>
        <label className="text-gray-400 text-[10px] font-bold mb-1 block uppercase tracking-[0.2em]">Título</label>
        <input 
          type="text" 
          className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:outline-none focus:border-blue-500 font-medium"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      {/* CONTROLES DE COLOR SEPARADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. COLOR DEL TEMA (POST) */}
        <div className="bg-gray-900/50 p-3 rounded border border-gray-800">
          <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Color del Tema (Post)</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map(c => (
                <button 
                  key={c} type="button" 
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-4 h-4 rounded-full border ${formData.color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input 
              type="color" 
              className="w-6 h-6 bg-transparent cursor-pointer ml-auto"
              value={formData.color}
              onChange={e => setFormData({...formData, color: e.target.value})}
            />
          </div>
        </div>

        {/* 2. COLOR DEL PINCEL (TEXTO) */}
        <div className="bg-gray-900/50 p-3 rounded border border-gray-800">
          <label className="text-gray-500 text-[10px] font-bold mb-2 block uppercase tracking-widest">Color del Pincel (Texto)</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {PRESET_COLORS.map(c => (
                <button 
                  key={c} type="button" 
                  onClick={() => setFormData({...formData, textColor: c})}
                  className={`w-4 h-4 rounded-full border ${formData.textColor === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input 
              type="color" 
              className="w-6 h-6 bg-transparent cursor-pointer ml-auto"
              value={formData.textColor}
              onChange={e => setFormData({...formData, textColor: e.target.value})}
            />
          </div>
        </div>

      </div>

      {/* EDITOR */}
      <div className="relative">
        <div className="flex justify-between items-center mb-1 px-1">
          <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Contenido Markdown</label>
          
          <button
            type="button"
            onClick={insertColorTag}
            className="group flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-full transition-all active:scale-90"
          >
            <span className="w-3 h-3 rounded-full shadow-[0_0_8px] transition-all" style={{ backgroundColor: formData.textColor, boxShadow: `0 0 8px ${formData.textColor}` }} />
            <span className="text-[10px] font-bold">PINTAR TEXTO</span>
          </button>
        </div>

        <textarea 
          ref={textareaRef}
          className="w-full bg-gray-900 border border-gray-700 p-4 rounded h-80 font-mono text-sm focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
          style={{ borderLeft: `4px solid ${formData.color}` }} // El borde sigue el color del TEMA
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="font-bold py-4 rounded mt-2 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.3em] text-xs"
        style={{ backgroundColor: formData.color, color: formData.color === '#ffffff' ? 'black' : 'white' }}
      >
        {loading ? 'Subiendo datos...' : 'Publicar Entrada'}
      </button>
    </form>
  )
}