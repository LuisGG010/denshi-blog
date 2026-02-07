import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, color } = body;

    // 1. Identificación del usuario
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const salt = process.env.IP_SALT;
    const userHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const MAX_PIXELS = 3;
    const TIEMPO_RECARGA_SEGUNDOS = 30;

    // 2. Obtener datos actuales del pintor
    const { data: painter } = await supabaseAdmin
      .from('pixel_painters')
      .select('last_painted_at, pixel_balance')
      .eq('user_hash', userHash)
      .single();

    let balanceActual = painter ? painter.pixel_balance : MAX_PIXELS;
    let ultimaFecha = painter ? new Date(painter.last_painted_at).getTime() : 0;
    const ahora = new Date().getTime();

    // 3. CALCULAR REGENERACIÓN 🧮
    // Cuántos ciclos de 30s han pasado desde la última vez
    if (balanceActual < MAX_PIXELS) {
        const segundosPasados = (ahora - ultimaFecha) / 1000;
        const pixelesGanados = Math.floor(segundosPasados / TIEMPO_RECARGA_SEGUNDOS);
        
        if (pixelesGanados > 0) {
            balanceActual = Math.min(MAX_PIXELS, balanceActual + pixelesGanados);
            // Avanzamos la fecha "ultimaFecha" por los pixeles que ya se recargaron
            // para no perder el progreso del pixel que se está cargando actualmente.
            ultimaFecha = ultimaFecha + (pixelesGanados * TIEMPO_RECARGA_SEGUNDOS * 1000);
        }
    } else {
        // Si estaba lleno, la referencia de tiempo es Ahora
        ultimaFecha = ahora;
    }

    // 4. VERIFICAR SI TIENE MUNICIÓN
    if (balanceActual <= 0) {
      // Calculamos cuándo llega el próximo pixel exacto
      const proximoPixel = new Date(ultimaFecha + (TIEMPO_RECARGA_SEGUNDOS * 1000)).toISOString();
      return NextResponse.json(
        { error: `Sin pixeles`, nextRefill: proximoPixel, balance: 0 }, 
        { status: 429 }
      );
    }

    // 5. PINTAR (Gastar 1 pixel)
    const { error: pixelError } = await supabaseAdmin
      .from('canvas_pixels')
      .upsert({ x, y, color }, { onConflict: 'x, y' });

    if (pixelError) throw pixelError;

    // 6. ACTUALIZAR USUARIO
    // Restamos 1 pixel
    const nuevoBalance = balanceActual - 1;
    
    // Si pasamos de estar LLENOS a NO LLENOS, marcamos el inicio del cronómetro ahora
    // Si ya estábamos recargando, mantenemos la fecha antigua para respetar el ciclo
    const nuevaFechaBase = (balanceActual === MAX_PIXELS) ? new Date().toISOString() : new Date(ultimaFecha).toISOString();

    const { error: painterError } = await supabaseAdmin
      .from('pixel_painters')
      .upsert({ 
          user_hash: userHash, 
          last_painted_at: nuevaFechaBase,
          pixel_balance: nuevoBalance
      });

    if (painterError) throw painterError;

    // Calculamos cuándo llega el siguiente (para el frontend)
    const proximoRefill = new Date(new Date(nuevaFechaBase).getTime() + (TIEMPO_RECARGA_SEGUNDOS * 1000)).toISOString();

    return NextResponse.json({ 
        success: true, 
        balance: nuevoBalance, 
        nextRefill: proximoRefill 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}