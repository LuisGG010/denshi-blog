import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getClickerSave, saveClickerProgress } from '@/lib/game-actions'; // 👈 Importamos

// Función auxiliar para identificar al usuario por IP
function getUserHash(req) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const salt = process.env.IP_SALT || 'salt-secreto-denshi';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

export async function GET(request) {
  try {
    const userHash = getUserHash(request);
    const saveData = await getClickerSave(userHash); // Lógica delegada
    return NextResponse.json({ saveData });
  } catch (e) {
    return NextResponse.json({ error: 'Error cargando save' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userHash = getUserHash(request);
    const body = await request.json();

    // La librería se encarga de validar Anti-Cheat y DB
    await saveClickerProgress(userHash, body);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e.message);
    // Si es error de Cheat, devolvemos 429, si no 500
    const status = e.message.includes('CHEAT') ? 429 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}