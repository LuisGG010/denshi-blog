'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // Cliente público (solo lectura permitida)
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 1. CARGAR POSTS (READ)
  // Esto sí funciona desde el cliente porque dejamos la política "Public Posts Read"
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    // Verificamos sesión primero
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, created_at, accent_color')
      .order('created_at', { ascending: false })

    if (data) setPosts(data)
    setLoading(false)
  }

  // 2. BORRAR POST (DELETE)
  // Usamos la API porque RLS bloquea el delete directo
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres borrar este post? No hay vuelta atrás.")) return

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_post', // <--- ORDEN PARA EL ROBOT
          id: id
        })
      })

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id)) // Actualizar lista visualmente
        alert("Post eliminado 🗑️")
      } else {
        const data = await res.json()
        alert("Error: " + data.error)
      }
    } catch (error) {
      alert("Error de conexión")
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-green-500 font-mono p-10">Cargando sistema...</div>

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            ADMIN_PANEL_V2
          </h1>
          <Link 
            href="/admin/create" 
            className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-6 rounded shadow-[0_0_10px_rgba(34,197,94,0.5)] transition"
          >
            + NUEVO POST
          </Link>
        </div>

        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-900 border border-gray-800 p-4 rounded flex justify-between items-center hover:border-gray-600 transition">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: post.accent_color || '#fff' }}>
                  {post.title}
                </h2>
                <span className="text-xs text-gray-500">ID: {post.id}</span>
              </div>
              
              <div className="flex gap-3">
                {/* BOTÓN EDITAR */}
                <Link 
                  href={`/admin/edit/${post.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  EDITAR
                </Link>
                
                {/* BOTÓN BORRAR */}
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  BORRAR
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-gray-500 text-center mt-10">No hay posts. ¡Escribe algo!</p>
          )}
        </div>
      </div>
    </div>
  )
}