import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 🎨 VALIDACIÓN ESTRICTA (Configuración)
const GRID_SIZE = 250;
const VALID_COLORS = [
  '#FF4500', '#FFA800', '#FFD635', '#00A368', '#7EED56', '#2450A4', 
  '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', 
  '#000000', '#898D90', '#D4D7D9', '#FFFFFF'
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, color } = body;

    // --- 🛡️ 1. FILTRO DE ENTRADA (Input Validation) ---
    // Rechazamos basura antes de molestar a la base de datos
    if (!Number.isInteger(x) || x < 0 || x >= GRID_SIZE || 
        !Number.isInteger(y) || y < 0 || y >= GRID_SIZE) {
        return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
    }

    if (!VALID_COLORS.includes(color)) {
        return NextResponse.json({ error: 'Color no permitido' }, { status: 400 });
    }
    // --------------------------------------------------

    // 2. IDENTIFICACIÓN (Hash IP)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const salt = process.env.IP_SALT || 'salt-seguro';
    const userHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- ⚛️ 3. EJECUCIÓN ATÓMICA (Llamada al SQL) ---
    // Aquí ocurre la magia. Ya no calculamos nada en JS.
    const { data, error } = await supabaseAdmin.rpc('paint_pixel_advanced', {
        p_user_hash: userHash,
        p_x: x,
        p_y: y,
        p_color: color
    });

    if (error) {
        console.error("Error SQL:", error);
        return NextResponse.json({ error: 'Error procesando jugada' }, { status: 500 });
    }

    // 4. RESPUESTA AL CLIENTE
    if (!data.success) {
        // Si el SQL dijo que no (ej: sin saldo), devolvemos error 429
        return NextResponse.json(data, { status: 429 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Crash API:", error);
    return NextResponse.json({ error: 'Error interno crítico' }, { status: 500 });
  }
}