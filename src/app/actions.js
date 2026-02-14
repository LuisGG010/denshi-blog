'use server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto';

// Clave secreta para encriptar (En producción usa una variable de entorno)
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'secreto-super-seguro-denshi-blog'; 
const ALGORITHM = 'aes-256-cbc';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function ascendFromClicker() {
  const cookieStore = await cookies()
  const userHash = cookieStore.get('denshi_gamer_id')?.value
  
  if (!userHash) return { error: "No identificado" }

  // 1. OBTENER NIVEL ACTUAL EN PLACE
  const { data: painter } = await supabaseAdmin
    .from('pixel_painters')
    .select('prestige_level')
    .eq('user_hash', userHash)
    .single()
    
  const currentLevel = painter?.prestige_level || 0;

  // 🛑 LÍMITE DE NIVEL 5
  if (currentLevel >= 5) {
      return { error: "¡Has alcanzado el Nivel Máximo de Ascensión (5)!" }
  }

  // 2. VERIFICAR SI TIENE LAS 300M GALLETAS
  const { data: saveEntry } = await supabaseAdmin
    .from('clicker_saves')
    .select('save_data')
    .eq('user_hash', userHash)
    .single()

  const currentCookies = saveEntry?.save_data?.cookies || 0;

  if (currentCookies < 300000000) {
    return { error: "Requieres 300 Millones de Galletas." }
  }

  // 3. ACTUALIZAR PLACE (+1 Nivel)
  const newLevel = currentLevel + 1;

  const { error: paintError } = await supabaseAdmin
    .from('pixel_painters')
    .upsert({
      user_hash: userHash,
      prestige_level: newLevel,
      last_painted_at: new Date(Date.now() - 86400000).toISOString()
    })

  if (paintError) return { error: "Error al conectar con la Dimensión Pixel" }

  // 4. RESETEAR CLICKER (A CERO)
  const oldData = saveEntry.save_data || {};
  const newData = {
      cookies: 0, // 🔥 BORRADO
      crumbs: oldData.crumbs || 0, // Mantiene migajas
      inventory: oldData.inventory || [], // Mantiene items/skins
      items: [], // 🔥 BORRA LOS EDIFICIOS
  };

  const { error: saveError } = await supabaseAdmin
    .from('clicker_saves')
    .update({ 
        save_data: newData,
        updated_at: new Date().toISOString()
    })
    .eq('user_hash', userHash)

  if (saveError) return { error: "Error al reiniciar el universo" }

  return { success: true, newLevel: newLevel }
}

export async function generateSaveCode() {
  const cookieStore = await cookies();
  const gamerId = cookieStore.get('denshi_gamer_id')?.value;

  if (!gamerId) return { error: "No hay partida para exportar." };

  try {
    //creamos un vector de inicializacion (IV aleatorio)
    const iv = crypto.randomBytes(16);
    //creamos la llave de 32 bytes a partir de tu secreto
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(gamerId, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    //codigo final es IV + conenido (separados por ':')
    const saveString = `${iv.toString('hex')}:${encrypted}`;

    //lo codificamos en base64 para que se vea seguro
    return { success: true, code: Buffer.from(saveString).toString('base64') };
  } catch (e) {
    return { error: "Error encriptando datos." };
  }
}

// --- CARGAR CÓDIGO (IMPORTAR) ---
export async function loadSaveCode(base64Code) {
  try {
    const cookieStore = await cookies();

    const saveString = Buffer.from(base64Code, 'base64').toString('utf-8');
    const [ivHex, encryptedHex] = saveString.split(':');

    if (!ivHex || !encryptedHex)  return { error: "Archivo corrupto o inválido." }

    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // 🔥 CORRECCIÓN 2: Declaramos 'decryptedId' y hacemos el update()
    let decryptedId = decipher.update(encryptedHex, 'hex', 'utf8');
    decryptedId += decipher.final('utf8');

    // Validamos que sea un UUID real
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // 🔥 CORRECCIÓN 3: Usamos la variable correcta 'decryptedId'
    if (!uuidRegex.test(decryptedId)) {
        return { error: "El código no contiene un ID válido." };
    }

    // Sobrescribimos la cookie actual
    cookieStore.set('denshi_gamer_id', decryptedId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 años
      path: '/',
    });

    // 🔥 CORRECCIÓN 4: 'success' (con doble s)
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Código inválido o contraseña incorrecta." };
  }
}