import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// --- UTILIDADES ---
function getUserHash(req) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const salt = process.env.IP_SALT || 'salt-secreto-denshi';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

// GET (Cargar partida) - Se queda igual
export async function GET(request) {
  try {
    const userHash = getUserHash(request);
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
        .from('clicker_saves')
        .select('save_data')
        .eq('user_hash', userHash)
        .single();

    return NextResponse.json({ saveData: data?.save_data || null });
  } catch (e) {
    return NextResponse.json({ error: 'Error cargando' }, { status: 500 });
  }
}

// POST (Guardar partida) - ¡AQUÍ ESTÁ LA SEGURIDAD! 🛡️
export async function POST(request) {
  try {
    const userHash = getUserHash(request);
    const body = await request.json(); // Lo que el cliente QUIERE guardar
    const supabase = getSupabaseAdmin();

    // 1. OBTENER DATOS ANTERIORES DE LA DB
    const { data: oldEntry } = await supabase
        .from('clicker_saves')
        .select('save_data, updated_at')
        .eq('user_hash', userHash)
        .single();

    // --- 🚨 ZONA ANTI-CHEAT 🚨 ---
    if (oldEntry && oldEntry.save_data) {
        const oldData = oldEntry.save_data;
        
        // A. Calcular tiempo transcurrido (en segundos)
        const now = Date.now();
        const lastSaveTime = new Date(oldEntry.updated_at).getTime();
        const secondsPassed = (now - lastSaveTime) / 1000;

        // B. Calcular producción MÁXIMA teórica
        // Recuperamos el CPS que tenías guardado (o lo recalculamos si quisieras ser más estricto)
        // Nota: Para ser 100% seguros, deberíamos recalcular el CPS aquí en el servidor leyendo los items.
        // Por ahora, usaremos una heurística: Items * CPS Base aproximado.
        
        // Truco: Vamos a confiar en el CPS que tenías ANTES, no en el que dices tener ahora.
        // Pero necesitamos calcular el CPS viejo.
        const oldItems = oldData.items || [];
        const oldCPS = oldItems.reduce((acc, item) => acc + (item.count * item.cps), 0);
        
        // C. Límite de Clicks Manuales
        // Un humano puede hacer máx 15 clicks por segundo.
        const maxManualClicks = 15 * secondsPassed;
        
        // D. Fórmula Mágica: Lo que tenías + (Producción automática) + (Clicks manuales) + Margen de error (Buffer)
        // El Buffer es importante por el lag de red. Damos un 20% extra o 500 cookies de regalo.
        const maxPossibleGain = (oldCPS * secondsPassed) + maxManualClicks + 500;
        
        const currentCookies = body.cookies; // Lo que intentas guardar
        const previousCookies = oldData.cookies;

        // Si intentas guardar MENOS cookies (porque compraste algo), está bien.
        // Solo nos preocupa si suben mágicamente.
        if (currentCookies > previousCookies) {
            const gained = currentCookies - previousCookies;
            
            if (gained > maxPossibleGain) {
                console.log(`🚨 HACK DETECTADO: Usuario ${userHash.substring(0,5)} intentó ganar ${gained} pero el máx era ${maxPossibleGain}`);
                return NextResponse.json(
                    { error: '¡Tramposo! Tus matemáticas no cuadran. 👮‍♂️' }, 
                    { status: 429 } // Código de "Too Many Requests" o rechazo
                );
            }
        }
    }
    // -----------------------------

    // 2. Si pasa la prueba, guardamos
    const { error } = await supabase
        .from('clicker_saves')
        .upsert({
            user_hash: userHash,
            save_data: body,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error guardando' }, { status: 500 });
  }
}