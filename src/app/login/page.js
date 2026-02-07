'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
// 👇 CAMBIO IMPORTANTE: Usamos la librería SSR para que guarde en Cookies
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 👇 INICIALIZAMOS EL CLIENTE QUE USA COOKIES
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
    } else {
      // ✅ Éxito: La cookie ya se guardó automáticamente.
      // 1. Refrescamos el router para que el Middleware se entere
      router.refresh()
      // 2. Esperamos un poquito y redirigimos
      setTimeout(() => {
        router.push('/admin')
      }, 500) // Damos medio segundo para que la cookie se asiente
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 border border-green-500 rounded bg-gray-900 w-80 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
        <h1 className="text-2xl font-mono text-green-500 text-center animate-pulse">ACCESS DENIED</h1>
        <p className="text-xs text-gray-400 text-center mb-4">Please authenticate identity</p>
        
        <input
          type="email"
          placeholder="Admin Email"
          className="p-3 bg-black border border-gray-700 text-white focus:border-green-500 outline-none rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 bg-black border border-gray-700 text-white focus:border-green-500 outline-none rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-3 mt-2 transition-colors disabled:opacity-50 rounded"
        >
          {loading ? 'Decrypting...' : 'LOGIN'}
        </button>
      </form>
    </div>
  )
}