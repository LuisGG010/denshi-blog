import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { postId, content, author, imageUrl } = body;

    // 🌐 Obtenemos la IP para el candado
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    // Creamos una "llave" única para esa IP
    const userIPHash = crypto.createHash('sha256').update(ip).digest('hex');

    // ⚡ LLAMADA ATÓMICA
    const { data, error } = await supabaseAdmin.rpc('create_comment_secure', {
        p_post_id: postId,
        p_content: content,
        p_author: author || 'Anónimo',
        p_image_url: imageUrl || null,
        p_user_id: userIPHash // Enviamos la llave a la base de datos
    });

    if (error) return NextResponse.json({ error: 'Error DB' }, { status: 500 });

    if (data && data.success === false) {
        return NextResponse.json({ error: data.error }, { status: 429 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}