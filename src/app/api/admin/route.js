import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
// 👇 Importamos nuestras nuevas herramientas limpias
import { deletePost, createPost, updatePost, deleteComment } from '@/lib/admin-actions'

const ADMIN_EMAIL = 'luisgamer2015210@gmail.com' 

export async function POST(request) {
  try {
    const cookieStore = await cookies()

    // 1. SEGURIDAD (El Policía verifica tu identidad) 👮‍♂️
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

    // 2. DELEGAR TRABAJO (Llamamos al obrero) 👷
    const body = await request.json()
    const { action, id, data } = body

    if (action === 'delete_post') await deletePost(id)
    else if (action === 'create_post') await createPost(data)
    else if (action === 'update_post') await updatePost(id, data)
    else if (action === 'delete_comment') await deleteComment(id)
    else return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

    // 3. RESPONDER ✅
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}