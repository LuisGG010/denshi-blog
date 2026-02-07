import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'luisgamer2015210@gmail.com' 

export async function POST(request) {
  try {
    const cookieStore = cookies()

    // 1. SEGURIDAD
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

    const { data: { session } } = await supabaseAuth.auth.getSession()

    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. MODO DIOS ACTIVADO
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { action, id, data } = body

    // ==========================================
    // 🤖 LISTA DE COMANDOS DEL ROBOT
    // ==========================================

    // 1. BORRAR POST
    if (action === 'delete_post') {
        const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    // 2. CREAR POST
    if (action === 'create_post') {
        const { title, content, image_url, color } = data;
        const { error } = await supabaseAdmin.from('posts').insert({
            title, content, image_url, accent_color: color
        })
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    // 3. ACTUALIZAR POST (EDITAR)
    if (action === 'update_post') {
        const { title, content, image_url, color } = data;
        const { error } = await supabaseAdmin.from('posts').update({
            title, content, image_url, accent_color: color,
            updated_at: new Date().toISOString() // Actualizamos la fecha
        }).eq('id', id)
        
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    // 4. BORRAR COMENTARIO (MODERACIÓN)
    if (action === 'delete_comment') {
        const { error } = await supabaseAdmin.from('comments').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error("Error API Admin:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}