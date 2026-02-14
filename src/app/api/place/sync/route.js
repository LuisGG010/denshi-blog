import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

export async function GET(request) {
  try {
    // 1. OBTENER IDENTIFICADORES (Igual que antes)
    const cookieStore = await cookies();
    const userHash = cookieStore.get('denshi_gamer_id')?.value;

    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    
    const salt = process.env.IP_SALT || 'salt-por-defecto';
    const ipHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    const isVerified = cookieStore.get('human_verified')?.value === 'true';

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. CONSULTA PARALELA (Igual que antes)
    const queries = [];
    if (userHash) {
        // Usamos maybeSingle para evitar errores si no existe
        queries.push(supabaseAdmin.from('pixel_painters').select('*').eq('user_hash', userHash).maybeSingle());
    } else {
        queries.push(Promise.resolve({ data: null }));
    }
    queries.push(supabaseAdmin.from('ip_cooldowns').select('last_painted_at').eq('ip_hash', ipHash).maybeSingle());

    const [userRes, ipRes] = await Promise.all(queries);
    const painter = userRes.data;
    const ipData = ipRes.data;

    // 3. VARIABLES DE CONFIGURACIÓN
    const TIEMPO_RECARGA_MS = 30000;
    const nivelPrestigio = painter?.prestige_level || 0;
    const MAX_PIXELS = 3 + (nivelPrestigio * 2);
    const now = Date.now();

    // 4. LÓGICA CORREGIDA (Aquí arreglamos el bug del Nivel 5) 🛠️
    let currentAmmo = 0;
    let ultimaFechaReal = 0;

    if (painter) {
        // ✅ A) USUARIO REGISTRADO: 
        // Si te encontramos en la base de datos, usamos TUS datos.
        // Ignoramos la IP para no castigarte por lo que hicieron otros en tu red.
        currentAmmo = painter.pixel_balance;
        ultimaFechaReal = new Date(painter.last_painted_at).getTime();
    } else {
        // ⛔ B) USUARIO NUEVO / INCÓGNITO:
        // No sabemos quién eres. Aquí sí aplicamos la ley de la IP.
        if (ipData) {
            // Tu IP ya gastó balas recientemente. Heredas tanque vacío.
            currentAmmo = 0; 
            ultimaFechaReal = new Date(ipData.last_painted_at).getTime();
        } else {
            // IP Limpia + Usuario Nuevo = Regalo de Bienvenida
            currentAmmo = MAX_PIXELS;
            ultimaFechaReal = now;
        }
    }

    // 5. CALCULAR REGENERACIÓN (Igual que antes)
    if (currentAmmo < MAX_PIXELS) {
        if (ultimaFechaReal === 0) ultimaFechaReal = now;

        const diff = now - ultimaFechaReal;
        const gained = Math.floor(diff / TIEMPO_RECARGA_MS);

        if (gained > 0) {
            currentAmmo = Math.min(MAX_PIXELS, currentAmmo + gained);
            ultimaFechaReal = ultimaFechaReal + (gained * TIEMPO_RECARGA_MS);
        }
    } else {
        ultimaFechaReal = now;
    }

    // 6. CALCULAR NEXT REFILL
    const nextRefill = (currentAmmo < MAX_PIXELS) 
      ? new Date(ultimaFechaReal + TIEMPO_RECARGA_MS).toISOString()
      : null;

    // 👇 AL FINAL: Devolvemos también 'isVerified'
    return NextResponse.json({ 
      ammo: currentAmmo,
      maxAmmo: MAX_PIXELS, 
      level: nivelPrestigio,
      nextRefill,
      isVerified // <--- ¡AQUÍ ESTÁ LA CLAVE!
    });

  } catch (err) {
    console.error(err);
    // En caso de error, asumimos no verificado para seguridad
    return NextResponse.json({ ammo: 3, maxAmmo: 3, level: 0, nextRefill: null, isVerified: false });  }
}