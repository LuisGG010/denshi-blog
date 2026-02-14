import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 1. Preparamos la respuesta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Buscamos si el usuario ya tiene una ID de jugador
  let gamerId = request.cookies.get('denshi_gamer_id')?.value

  // Si no tiene ID entonces le creamos uno nuevo (UUID seguro)
  if (!gamerId) {
    gamerId = crypto.randomUUID();

    response.cookies.set('denshi_gamer_id', gamerId, {
      httpOnly: true, //seguridad anti hack
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en produccion
      sameSite: 'lax', //Permite navegar normal
      maxAge: 60*60*24*365, //Dura 1 año
      path: '/' //Funciona en todo el sitio web
    })
  }

  // 2. Configuramos el cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })

          //Esto asegura que la cookie de supabase no borre esta.
          if (!request.cookies.get('denshi_gamer_id')) {
            response.cookies.set('denshi_gamer_id', gamerId, {
              httpOnly: true, 
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax', 
              maxAge: 60*60*24*365,
              path: '/'
            })
          }
        },
      },
    }
  )

  // 3. VERIFICAMOS SI HAY USUARIO REAL
  // Usamos getUser() porque es más seguro que getSession()
  const { data: { user } } = await supabase.auth.getUser()

  // 4. LÓGICA DE BLOQUEO (EL GUARDIA)
  
  // Si la ruta empieza con '/admin' Y NO hay usuario...
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    // ...¡FUERA! Redirigir al login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // (Opcional) Si ya estás logueado y vas al '/login', te manda directo al admin
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto archivos estáticos e imágenes.
     * Esto asegura que el middleware se ejecute en cada página que visitas.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}