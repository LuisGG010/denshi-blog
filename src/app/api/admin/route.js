import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'luisgamer2015210@gmail.com' 

export async function POST(request) {
  try {
    // ✅ CORRECCIÓN 1: await cookies() (Obligatorio en Next.js 15)
    const cookieStore = await cookies()

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
      return NextResponse.json({ error: 'Unauthorized: No eres admin o expiró la sesión' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { action, id, data } = body

    // --- MANEJO DE ACCIONES ---

    if (action === 'delete_post') {
        const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    if (action === 'create_post') {
        const { title, content, image_url, color } = data;
        // ✅ CORRECCIÓN 2: Usamos 'color'
        const { error } = await supabaseAdmin.from('posts').insert({
            title, content, image_url, color: color 
        })
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    if (action === 'update_post') {
        const { title, content, image_url, color } = data;
        // ✅ CORRECCIÓN 3: Usamos 'color'
        const { error } = await supabaseAdmin.from('posts').update({
            title, content, image_url, color: color,
            updated_at: new Date().toISOString()
        }).eq('id', id)
        
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    if (action === 'delete_comment') {
        const { error } = await supabaseAdmin.from('comments').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })

  } catch (error) {
    console.error("CRITICAL ERROR API:", error) // Verás esto en la terminal de VS Code
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}