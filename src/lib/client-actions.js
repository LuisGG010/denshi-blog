// src/lib/client-actions.js
import { supabase } from '@/lib/supabase';

export async function registerView() {
  // 1. Evitar contar visitas en modo Desarrollo (localhost)
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Visita ignorada 🛑");
    return;
  }

  try {
    // 2. Llamada RPC a Supabase
    const { error } = await supabase.rpc('increment_views');
    if (error) throw error;
    console.log("Visita registrada +1 🚀");
  } catch (e) {
    console.error("Error contando visita:", e);
  }
}