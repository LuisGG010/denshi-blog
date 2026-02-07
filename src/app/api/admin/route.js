import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ⚠️ TU CORREO DE ADMIN (El único que puede pasar)
const ADMIN_EMAIL = 'luisgamer2015210@gmail.com' 

export async function POST(request) {
  try {
    // 1. Verificar quién hace la petición (Auth Check)
    const supabaseUser = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabaseUser.auth.getSession()

    // SI NO HAY SESIÓN O EL EMAIL NO ES EL TUYO -> ¡FUERA! 🚫
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized: Nice try, hacker.' },
        { status: 401 }
      )
    }

    // 2. Si pasamos el check, iniciamos el cliente con PODERES (Service Role)
    // Solo usamos este cliente poderoso DESPUÉS de verificar quién eres.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { action, id, data } = body

    // ... (El resto de tu lógica de switch action sigue igual) ...
    // Ejemplo rápido de cómo se vería una acción:
    
    if (action === 'delete') {
        const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    }
    
    // ... Resto de tus acciones (create, update) ...

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}