'use client'
import { createBrowserClient } from '@supabase/ssr'

export default function LogoutButton() {
  
  // Usamos el cliente del navegador
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const handleLogout = async () => {
    // 1. Borramos la sesión en Supabase (Limpia la cookie)
    await supabase.auth.signOut()
    
    // 2. ☢️ OPCIÓN NUCLEAR: Forzamos una recarga completa
    // En vez de usar router.push, usamos esto para matar la caché de Next.js
    window.location.href = '/login?loggedOut=true'
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-red-500 hover:text-red-400 font-mono text-sm border border-red-900/50 px-4 py-2 rounded hover:bg-red-900/20 transition"
    >
      CERRAR SESIÓN
    </button>
  )
}