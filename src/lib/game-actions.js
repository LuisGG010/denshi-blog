
import { createClient } from '@supabase/supabase-js'
import { GAME_ITEMS } from '@/lib/clicker-items' // 👈 Importamos para validar buffs

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ... (El código de PIXEL WAR se queda igual, saltamos a CLICKER) ...

export async function getClickerSave(userHash) {
  // ... (Igual que antes)
  const { data } = await supabaseAdmin
    .from('clicker_saves')
    .select('save_data')
    .eq('user_hash', userHash)
    .single()
  return data?.save_data || null
}

export async function saveClickerProgress(userHash, newData) {
  // 1. OBTENER DATOS ANTERIORES
  const { data: oldEntry } = await supabaseAdmin
    .from('clicker_saves')
    .select('save_data, updated_at')
    .eq('user_hash', userHash)
    .single()

  // --- 🚨 ZONA ANTI-CHEAT 2.0 🚨 ---
  if (oldEntry && oldEntry.save_data) {
    const oldData = oldEntry.save_data
    
    const now = Date.now()
    const lastSaveTime = new Date(oldEntry.updated_at).getTime()
    const secondsPassed = (now - lastSaveTime) / 1000

    // --- CÁLCULO DE PRODUCCIÓN (Con Inventario) ---
    const oldItems = oldData.items || []
    const oldInventory = oldData.inventory || [] // Skins y Tools guardados
    
    // Calcular Multiplicadores
    let globalMult = 1
    const buffs = {}
    
    oldInventory.forEach(itemId => {
        const item = GAME_ITEMS[itemId]
        if (!item) return
        if (item.multiplier) globalMult *= item.multiplier
        if (item.targetId && item.buff) {
             buffs[item.targetId] = (buffs[item.targetId] || 1) * item.buff
        }
        // Si hay items de click manual, deberíamos considerarlos en maxManualClicks
    })

    // Calcular CPS Real Antiguo
    const oldCPS = oldItems.reduce((acc, item) => {
        let itemCPS = item.cps // El cliente envía el CPS base en el objeto item
        // Si no confías en el cliente, deberías tener un mapa de CPS base en el servidor también
        
        if (buffs[item.id]) itemCPS *= buffs[item.id]
        return acc + (item.count * itemCPS)
    }, 0) * globalMult

    // Límites
    const maxManualClicks = 20 * secondsPassed // Aumenté un poco por si tiene clicks dobles
    const maxPossibleGain = (oldCPS * secondsPassed) + maxManualClicks + 5000 // Buffer generoso
    
    const currentCookies = newData.cookies
    const previousCookies = oldData.cookies

    if (currentCookies > previousCookies) {
        const gained = currentCookies - previousCookies
        
        if (gained > maxPossibleGain && previousCookies > 0) {
            console.warn(`⚠️ Posible trampa: Ganó ${gained.toFixed(0)} vs Máx ${maxPossibleGain.toFixed(0)}`);
            // Nota: Si el inventario es muy poderoso, aumenta el buffer
        }
    }
  }

  // 2. GUARDAR
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