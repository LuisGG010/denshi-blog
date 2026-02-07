'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminList from './AdminList'

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([]) // 👈 1. Estado para guardar los posts
  const router = useRouter()

  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      // --- PASO 1: SEGURIDAD ---
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      } 
      
      if (session.user.email !== 'luisgamer2015210@gmail.com') {
          alert("Logueado pero no eres Admin")
          await supabase.auth.signOut()
          router.replace('/login')
          return
      }

      setAuthorized(true)

      // --- PASO 2: CARGAR DATOS (Esto faltaba) ---
      // Ya que sabemos que eres admin, bajamos los posts para que puedas borrarlos
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error("Error cargando posts:", error)
      else setPosts(postsData || [])
      
      setLoading(false)
    }

    checkSessionAndLoadData()
  }, [router])

  if (loading) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Verifying credentials & Loading data...</div>

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
            <h1 className="text-3xl font-bold text-green-500 font-mono">
                ADMIN_PANEL_V2
            </h1>
            <button 
                onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/login')
                }}
                className="bg-red-900/30 text-red-400 border border-red-900 px-4 py-2 hover:bg-red-900/50 transition-colors font-mono text-sm"
            >
                [LOGOUT]
            </button>
        </div>

        {/* 👇 3. AHORA SÍ LE PASAMOS LOS POSTS */}
        <AdminList posts={posts} />
      </div>
    </div>
  )
}