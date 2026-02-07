'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
// 👇 AQUÍ EL CAMBIO: Usamos tu cliente que ya funciona
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Login usando tu configuración existente
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
    } else {
      // Al loguearte, Supabase guarda una cookie automáticamente
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 border border-green-500 rounded bg-gray-900 w-80">
        <h1 className="text-2xl font-mono text-green-500 text-center">ACCESS DENIED</h1>
        <p className="text-xs text-gray-400 text-center mb-4">Please authenticate identity</p>
        
        <input
          type="email"
          placeholder="Admin Email"
          className="p-2 bg-black border border-gray-700 text-white focus:border-green-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 bg-black border border-gray-700 text-white focus:border-green-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-2 mt-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Decrypting...' : 'LOGIN'}
        </button>
      </form>
    </div>
  )
}