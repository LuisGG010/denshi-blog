import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, data } = body;

    // 🔑 USAMOS LA LLAVE MAESTRA
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let result;

    switch (action) {
      // 👇👇👇 NUEVO PODER: CREAR POST 👇👇👇
      case 'create_post':
        result = await supabaseAdmin.from('posts').insert(data);
        break;
      // 👆👆👆 FIN DE LO NUEVO 👆👆👆

      case 'delete_post':
        result = await supabaseAdmin.from('posts').delete().eq('id', id);
        break;
      
      case 'update_post':
        result = await supabaseAdmin.from('posts').update(data).eq('id', id);
        break;

      case 'delete_comment':
        result = await supabaseAdmin.from('comments').delete().eq('id', id);
        break;

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    if (result.error) throw result.error;
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}