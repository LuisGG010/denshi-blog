'use client'

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ViewCounter() {
  useEffect(() => {
    // 1. Revisamos si ya contamos a esta persona en esta sesión
    const hasVisited = sessionStorage.getItem('denshi_visited');

    if (!hasVisited) {
      // 2. Si es nuevo, llamamos a la función de Supabase
      const increment = async () => {
        await supabase.rpc('increment_views');
      };
      
      increment();

      // 3. Lo marcamos para no contarlo doble si recarga la página
      sessionStorage.setItem('denshi_visited', 'true');
      console.log("Visita nueva registrada +1 🚀");
    } else {
      console.log("Visita recurrente (No cuenta)");
    }
  }, []);

  return null; // Este componente no renderiza nada visual
}