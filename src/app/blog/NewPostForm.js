'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    color: '#3b82f6' // Azul por defecto
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // LLAMADA A LA API SEGURA 🛡️
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_post', // <--- ORDEN PARA EL ROBOT
          data: formData
        })
      })

      if (res.ok) {
        alert("¡Post creado con éxito! 🚀")
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white">
      <div>
        <label className="text-gray-400 text-sm font-bold mb-1 block">Título</label>
        <input 
          type="text" 
          className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-lg focus:outline-none focus:border-green-500"
          placeholder="Escribe un título épico..."
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-gray-400 text-sm font-bold mb-1 block">URL Imagen (Opcional)</label>
          <input 
            type="text" 
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded focus:outline-none focus:border-green-500"
            placeholder="https://..."
            value={formData.image_url}
            onChange={e => setFormData({...formData, image_url: e.target.value})}
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm font-bold mb-1 block">Color</label>
          <input 
            type="color" 
            className="h-[50px] w-[50px] bg-transparent cursor-pointer"
            value={formData.color}
            onChange={e => setFormData({...formData, color: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-sm font-bold mb-1 block">Contenido (Markdown)</label>
        <textarea 
          className="w-full bg-gray-900 border border-gray-700 p-4 rounded h-64 font-mono focus:outline-none focus:border-green-500"
          placeholder="Escribe aquí tu post..."
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded mt-4 transition disabled:opacity-50"
      >
        {loading ? 'PUBLICANDO...' : 'PUBLICAR POST'}
      </button>
    </form>
  )
}