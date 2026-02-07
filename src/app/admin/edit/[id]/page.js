'use client'
import { useState, useEffect, use } from 'react' // 'use' es necesario para Next.js 15
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditPostPage({ params }) {
  const { id } = use(params) // Desempaquetar params
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState({ title: '', content: '', image_url: '', color: '#3b82f6' })
  const [comments, setComments] = useState([])

  // 1. CARGAR DATOS (READ)
  useEffect(() => {
    const loadData = async () => {
      // Verificar sesión
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Cargar Post
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
          color: postData.accent_color || '#3b82f6'
        })
      }

      // Cargar Comentarios
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
      
      if (commentsData) setComments(commentsData)
      
      setLoading(false)
    }
    loadData()
  }, [id, router])

  // 2. GUARDAR CAMBIOS (UPDATE)
  const handleUpdate = async (e) => {
    e.preventDefault()
    
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_post', // <--- ORDEN PARA EL ROBOT
        id: id,
        data: post
      })
    })

    if (res.ok) {
      alert("✅ Post actualizado")
      router.push('/admin')
      router.refresh()
    } else {
      alert("❌ Error al guardar")
    }
  }

  // 3. BORRAR COMENTARIO
  const handleDeleteComment = async (commentId) => {
    if (!confirm("¿Borrar este comentario?")) return

    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_comment',
        id: commentId
      })
    })

    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white p-10">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link href="/admin" className="text-gray-400 hover:text-white mb-6 inline-block font-mono bg-gray-800 px-4 py-2 rounded">
          &larr; Volver
        </Link>

        <h1 className="text-3xl font-bold mb-6 font-mono border-b border-gray-800 pb-4" style={{ color: post.color }}>
          EDITAR POST
        </h1>

        <form onSubmit={handleUpdate} className="bg-black border border-gray-800 p-6 rounded-lg shadow-2xl mb-10">
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Título</label>
            <input 
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              value={post.title}
              onChange={e => setPost({...post, title: e.target.value})}
            />
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
               <label className="block text-gray-400 mb-2">Imagen</label>
               <input 
                 className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                 value={post.image_url}
                 onChange={e => setPost({...post, image_url: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-gray-400 mb-2">Color</label>
               <input 
                 type="color"
                 className="h-10 w-10 bg-transparent"
                 value={post.color}
                 onChange={e => setPost({...post, color: e.target.value})}
               />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Contenido</label>
            <textarea 
              className="w-full bg-gray-900 border border-gray-700 p-4 rounded h-60 font-mono"
              value={post.content}
              onChange={e => setPost({...post, content: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-3 rounded font-bold text-black hover:opacity-90 transition" style={{ backgroundColor: post.color }}>
            GUARDAR CAMBIOS
          </button>
        </form>

        {/* MODERACIÓN DE COMENTARIOS */}
        <div className="border-t border-gray-800 pt-8">
            <h3 className="text-xl font-bold text-gray-400 mb-4">Comentarios ({comments.length})</h3>
            <div className="space-y-3">
                {comments.map(c => (
                    <div key={c.id} className="bg-gray-800 p-3 rounded flex justify-between items-start">
                        <div>
                            <span className="text-green-400 text-xs font-bold">{c.author || 'Anónimo'}</span>
                            <p className="text-gray-300 text-sm mt-1">{c.content}</p>
                        </div>
                        <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 hover:text-red-400 p-1">
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}