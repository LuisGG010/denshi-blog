import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { token } = await request.json();

    // 1. Preguntar a Cloudflare si el humano es real
    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
    });
    const turnstileData = await turnstileRes.json();

    if (!turnstileData.success) {
        return NextResponse.json({ success: false, error: "Captcha fallido" }, { status: 403 });
    }

    // 2. ¡Es humano! Le damos su "Sello de la Discoteca" (Cookie)
    const cookieStore = await cookies();
    
    // Esta cookie dura 1 hora. Después de 1 hora, tendrá que verificar de nuevo.
    cookieStore.set('human_verified', 'true', {
        httpOnly: true, // 🔒 No se puede modificar con JavaScript (Anti-Hackers)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600, // 1 hora en segundos
        path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}