import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// --- 🎨 PIXEL WAR LOGIC (PLACE) ---

export async function getCanvasPixels() {
  const { data, error } = await supabaseAdmin
    .from('canvas_pixels')
    .select('*')
  
  if (error) throw error
  return data || []
}

export async function paintPixelAction(userHash, x, y, color) {
  // Llamamos a TU función avanzada que controla la munición
  const { data, error } = await supabaseAdmin.rpc('paint_pixel_advanced', {
      p_user_hash: userHash,
      p_x: x,
      p_y: y,
      p_color: color
  });

  if (error) throw error;
  return data; // Retornamos { success, balance, nextRefill, etc }
}

// --- 🍪 CLICKER LOGIC ---

export async function getClickerSave(userHash) {
  const { data } = await supabaseAdmin
    .from('clicker_saves')
    .select('save_data')
    .eq('user_hash', userHash)
    .single()
  
  return data?.save_data || null
}

export async function saveClickerProgress(userHash, newData) {
  // 1. OBTENER DATOS ANTERIORES (Para el Anti-Cheat)
  const { data: oldEntry } = await supabaseAdmin
    .from('clicker_saves')
    .select('save_data, updated_at')
    .eq('user_hash', userHash)
    .single()

  // --- 🚨 ZONA ANTI-CHEAT 🚨 ---
  if (oldEntry && oldEntry.save_data) {
    const oldData = oldEntry.save_data
    
    // A. Tiempo transcurrido (segundos)
    const now = Date.now()
    const lastSaveTime = new Date(oldEntry.updated_at).getTime()
    const secondsPassed = (now - lastSaveTime) / 1000

    // B. Calcular producción vieja
    const oldItems = oldData.items || []
    const oldCPS = oldItems.reduce((acc, item) => acc + (item.count * item.cps), 0)
    
    // C. Límites (Manual + Automático + Buffer)
    const maxManualClicks = 15 * secondsPassed // 15 clicks/segundo humano
    const maxPossibleGain = (oldCPS * secondsPassed) + maxManualClicks + 1000 // Buffer generoso
    
    const currentCookies = newData.cookies
    const previousCookies = oldData.cookies

    // Solo validamos si las cookies SUBEN
    if (currentCookies > previousCookies) {
        const gained = currentCookies - previousCookies
        
        // Si ganaste más de lo matemáticamente posible...
        // (Y no es el primer guardado o un reinicio)
        if (gained > maxPossibleGain && previousCookies > 0) {
            // Puedes descomentar esto para bloquear trampas estrictamente:
            // throw new Error(`CHEAT DETECTADO: Ganaste ${gained.toFixed(0)} pero el máx era ${maxPossibleGain.toFixed(0)}`)
            console.warn(`⚠️ Posible trampa detectada: Ganó ${gained} vs Máx ${maxPossibleGain}`);
        }
    }
  }

  // 2. GUARDAR (Si pasó la prueba)
  const { error } = await supabaseAdmin
    .from('clicker_saves')
    .upsert({
        user_hash: userHash,
        save_data: newData,
        updated_at: new Date().toISOString()
    })

  if (error) throw error
  return true
}