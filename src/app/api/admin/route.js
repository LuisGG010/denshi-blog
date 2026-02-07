import { createServerClient } from '@supabase/ssr' // 👈 La librería moderna
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ⚠️ TU CORREO DE ADMIN
const ADMIN_EMAIL = 'luisgamer2015210@gmail.com' 

export async function POST(request) {
  try {
    const cookieStore = cookies()

    // 1. Crear un cliente "fantasma" solo para leer la cookie de sesión
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
          set(name, value, options) { },
          remove(name, options) { },
        },
      }
    )

    // 2. Verificar sesión
    const { data: { session } } = await supabaseAuth.auth.getSession()

    // SI NO HAY SESIÓN O EL EMAIL NO ES EL TUYO -> ¡FUERA! 🚫
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized: Nice try, hacker.' },
        { status: 401 }
      )
    }

    // 3. Si eres tú, activamos el "Modo Dios" con Service Role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { action, id } = body // No necesitas 'data' para borrar

    // 👇 CORRECCIÓN: Usamos el mismo nombre que envía el AdminList ('delete_post')
    if (action === 'delete_post') {
        const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
        
        if (error) {
            console.error("Error borrando:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        return NextResponse.json({ success: true })
    }
    
    // Aquí puedes añadir tus otros casos (create, update, etc.)

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}