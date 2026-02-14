import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, color } = body;

    const cookieStore = await cookies();

    // --- 🤖 ZONA DE SEGURIDAD (MODELO DISCOTECA) ---
    // Buscamos el "sello" en la mano del usuario
    const isHuman = cookieStore.get('human_verified')?.value === 'true';

    if (!isHuman) {
        // Si no tiene sello, error 403 (Prohibido)
        return NextResponse.json({ error: "Verificación requerida. Recarga." }, { status: 403 });
    }
    // ---------------------------------------------

    // 1. Identificación del usuario
    const userHash = cookieStore.get('denshi_gamer_id')?.value;

    if (!userHash) {
      return NextResponse.json({error: "Falta cookie de jugador"}, {status:401});
    }

    // 2. Identificación de Red (IP Hash)
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'; 
    const salt = process.env.IP_SALT || 'salt-secreto';
    const ipHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Obtener datos (Paralelo)
    const [userResponse, ipResponse] = await Promise.all([
        supabaseAdmin.from('pixel_painters').select('*').eq('user_hash', userHash).maybeSingle(),
        supabaseAdmin.from('ip_cooldowns').select('last_painted_at').eq('ip_hash', ipHash).maybeSingle()
    ]);

    const painter = userResponse.data;
    const ipData = ipResponse.data;

    // --- 🛑 CHECK DE VELOCIDAD (0.5 Segundo) ---
    if (ipData) {
        const lastTimeIP = new Date(ipData.last_painted_at).getTime();
        const now = Date.now();
        if (now - lastTimeIP < 500) { 
             return NextResponse.json({ error: "¡Muy rápido! Calma." }, { status: 429 });
        }
    }

    // 4. LÓGICA DE MUNICIÓN (Anti-Incógnito + Respeto Nivel 5)
    const TIEMPO_RECARGA_SEGUNDOS = 30;
    const nivelPrestigio = painter?.prestige_level || 0;
    const MAX_PIXELS = 3 + (nivelPrestigio * 2);
    const ahora = Date.now();

    let balanceCalculado = 0;
    let ultimaFechaReferencia = 0;

    if (painter) {
        // A) USUARIO REGISTRADO: Usamos sus datos.
        balanceCalculado = painter.pixel_balance;
        ultimaFechaReferencia = new Date(painter.last_painted_at).getTime();
    } else {
        // B) USUARIO NUEVO / INCÓGNITO:
        if (ipData) {
            // Incógnito detectado: Hereda la fecha de la IP y empieza vacío
            balanceCalculado = 0; 
            ultimaFechaReferencia = new Date(ipData.last_painted_at).getTime();
        } else {
            // Usuario 100% nuevo: Regalo de bienvenida
            balanceCalculado = MAX_PIXELS;
            ultimaFechaReferencia = ahora;
        }
    }

    // 5. CALCULAR REGENERACIÓN
    if (balanceCalculado < MAX_PIXELS) {
        if (ultimaFechaReferencia === 0) ultimaFechaReferencia = ahora;

        const segundosPasados = (ahora - ultimaFechaReferencia) / 1000;
        const pixelesGanados = Math.floor(segundosPasados / TIEMPO_RECARGA_SEGUNDOS);

        if (pixelesGanados > 0) {
            balanceCalculado = Math.min(MAX_PIXELS, balanceCalculado + pixelesGanados);
            ultimaFechaReferencia = ultimaFechaReferencia + (pixelesGanados * TIEMPO_RECARGA_SEGUNDOS * 1000);
        }
    } else {
        ultimaFechaReferencia = ahora;
    }

    // 6. VERIFICAR BALAS
    if (balanceCalculado <= 0) {
        const proximoPixel = new Date(ultimaFechaReferencia + (TIEMPO_RECARGA_SEGUNDOS * 1000)).toISOString();
        return NextResponse.json(
            { error: `Recargando...`, nextRefill: proximoPixel, balance: 0 }, 
            { status: 429 }
        );
    }

    // 7. PINTAR
    const { error: pixelError } = await supabaseAdmin
      .from('canvas_pixels')
      .upsert({ x, y, color }, { onConflict: 'x, y' });

    if (pixelError) throw pixelError;

    // 8. GUARDAR CAMBIOS
    const nuevoBalance = balanceCalculado - 1;
    const estabaLleno = (balanceCalculado === MAX_PIXELS);
    const nuevaFecha = estabaLleno ? new Date().toISOString() : new Date(ultimaFechaReferencia).toISOString();

    await Promise.all([
        supabaseAdmin.from('pixel_painters').upsert({ 
            user_hash: userHash, 
            last_painted_at: nuevaFecha,
            pixel_balance: nuevoBalance,
            prestige_level: nivelPrestigio 
        }),
        supabaseAdmin.from('ip_cooldowns').upsert({ 
            ip_hash: ipHash, 
            last_painted_at: new Date().toISOString() 
        })
    ]);

    const proximoRefill = new Date(new Date(nuevaFecha).getTime() + (TIEMPO_RECARGA_SEGUNDOS * 1000)).toISOString();

    return NextResponse.json({ 
        success: true, 
        balance: nuevoBalance, 
        maxAmmo: MAX_PIXELS, 
        nextRefill: proximoRefill 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno: ' + error.message }, { status: 500 });
  }
}