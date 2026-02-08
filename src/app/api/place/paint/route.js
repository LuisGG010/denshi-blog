import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { paintPixelAction } from '@/lib/game-actions'; // 👈 Importamos la acción

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

    // 1. VALIDACIÓN
    if (!Number.isInteger(x) || x < 0 || x >= GRID_SIZE || 
        !Number.isInteger(y) || y < 0 || y >= GRID_SIZE) {
        return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
    }
    if (!VALID_COLORS.includes(color)) {
        return NextResponse.json({ error: 'Color no permitido' }, { status: 400 });
    }

    // 2. IDENTIFICACIÓN
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const salt = process.env.IP_SALT || 'salt-seguro';
    const userHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    // 3. EJECUCIÓN (Desde la lib)
  const result = await paintPixelAction(userHash, x, y, color);

  // 4. RESPUESTA MEJORADA
  if (!result.success) {
      // Si el servidor dice que no, le enviamos el cooldown real al cliente
      return NextResponse.json({
          error: 'Munición agotada',
          nextRefillIn: result.nextRefillIn || 10 // Tiempo que falta
      }, { status: 429 });
  }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}