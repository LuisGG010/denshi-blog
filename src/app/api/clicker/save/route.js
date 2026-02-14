import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getClickerSave, saveClickerProgress } from '@/lib/game-actions';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const gamerId = cookieStore.get('denshi_gamer_id')?.value

    if (!gamerId) {
      return NextResponse.json({error: 'No gamer ID found' }, {status: 401});
    }

    //Usamos el ID de la cookie en vez del hash de IP
    const saveData = await getClickerSave(gamerId);
    return NextResponse.json({ saveData })
  } catch (e) {
    return NextResponse.json({ error: 'Error cargando save' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // leer cookies
    const cookieStore = await cookies();
    const gamerId = cookieStore.get('denshi_gamer_id')?.value;

    if (!gamerId) {
      return NextResponse.json({error: 'No gamer ID found', status: 401 });
    }

    const body = await request.json();
    

    //guardar usando la id de la cookie
    // logica anticheat en game-actions funciona igual, pero ahora userhash es en realidad UUID de la cookie
    await saveClickerProgress(gamerId, body)


    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e.message);
    // Si es error de Cheat, devolvemos 429, si no 500
    const status = e.message.includes('CHEAT') ? 429 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}