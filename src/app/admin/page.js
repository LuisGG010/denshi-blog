import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminList from '@/components/admin/AdminList' // Ruta corregida
import LogoutButton from '@/components/admin/LogoutButton' // Ruta corregida
import { ADMIN_EMAIL } from '@/lib/constants'

export default async function AdminDashboard() {
  const cookieStore = await cookies() 

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
      },
    }
  )

  // 🔴 ANTES: const { data: { session } } = await supabase.auth.getSession()
  // 🟢 AHORA: Usamos getUser() que es seguro
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verificamos 'user' en vez de 'session'
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
         
         {/* HEADER */}
         <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                PANEL DE CONTROL
                </h1>
                <p className="text-xs text-gray-500 mt-1">Admin: {user.email}</p>
            </div>

            <div className="flex items-center gap-4">
                <LogoutButton />
                
                <Link 
                href="/admin/create" 
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-6 rounded shadow-[0_0_10px_rgba(34,197,94,0.5)] transition"
                >
                + NUEVO POST
                </Link>
            </div>
         </div>

         <AdminList posts={posts || []} />

      </div>
    </div>
  )
}