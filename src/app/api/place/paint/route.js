import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, color } = body;

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const salt = process.env.IP_SALT;
    const userHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const TIEMPO_ESPERA_SEGUNDOS = 30;

    // Verificar Cooldown
    const { data: painter } = await supabaseAdmin
      .from('pixel_painters')
      .select('last_painted_at')
      .eq('user_hash', userHash)
      .single();

    if (painter) {
      const ultimoPintado = new Date(painter.last_painted_at).getTime();
      const ahora = new Date().getTime();
      const segundosPasados = (ahora - ultimoPintado) / 1000;

      if (segundosPasados < TIEMPO_ESPERA_SEGUNDOS) {
        // Calculamos cuándo termina el castigo exactamente
        const finCastigo = new Date(ultimoPintado + (TIEMPO_ESPERA_SEGUNDOS * 1000)).toISOString();
        
        return NextResponse.json(
          { error: `¡Espera un poco!`, cooldownEnd: finCastigo }, 
          { status: 429 }
        );
      }
    }

    // Pintar
    const { error: pixelError } = await supabaseAdmin
      .from('canvas_pixels')
      .upsert({ x, y, color }, { onConflict: 'x, y' });

    if (pixelError) throw pixelError;

    const ahoraISO = new Date().toISOString();
    
    const { error: painterError } = await supabaseAdmin
      .from('pixel_painters')
      .upsert({ user_hash: userHash, last_painted_at: ahoraISO });

    if (painterError) throw painterError;

    // Devolvemos cuándo podrá pintar de nuevo (Ahora + 60s)
    const proximoTurno = new Date(new Date().getTime() + (TIEMPO_ESPERA_SEGUNDOS * 1000)).toISOString();

    return NextResponse.json({ success: true, cooldownEnd: proximoTurno });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}