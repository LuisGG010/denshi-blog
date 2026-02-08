import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePlaceGame() {
  const [pixels, setPixels] = useState({});
  const [loading, setLoading] = useState(false);
  
  // 🔫 SISTEMA DE MUNICIÓN
  const [ammo, setAmmo] = useState(3);
  const [nextRefillTime, setNextRefillTime] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // 1. CARGA DE DATOS Y SUSCRIPCIÓN REALTIME
  useEffect(() => {
    const fetchCanvas = async () => {
      const { data } = await supabase.from('canvas_pixels').select('*');
      if (data) {
        const pixelMap = {};
        data.forEach(p => { pixelMap[`${p.x}-${p.y}`] = p.color; });
        setPixels(pixelMap);
      }
    };
    fetchCanvas();

    const channel = supabase
      .channel('canvas_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canvas_pixels' }, (payload) => {
        const newPixel = payload.new;
        if (newPixel) {
            setPixels(prev => ({ ...prev, [`${newPixel.x}-${newPixel.y}`]: newPixel.color }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. RELOJ INTELIGENTE DE RECARGA 🛡️🔋
  useEffect(() => {
    if (ammo >= 3) {
        setSecondsLeft(0);
        return;
    }

    // Dentro de usePlaceGame.js, cambia calculateTimeLeft
    const calculateTimeLeft = () => {
      if (!nextRefillTime) return 0;
      const now = Date.now();
      const target = new Date(nextRefillTime).getTime();
      
      // Usamos Math.max para evitar números negativos
      // Y no redondeamos hacia arriba tan agresivamente
      const diff = Math.floor((target - now) / 1000); 
      return diff > 0 ? diff + 1 : 0; // Añadimos +1 visual para seguridad
    };

    setSecondsLeft(calculateTimeLeft());

    const interval = setInterval(() => {
        const remaining = calculateTimeLeft();
        setSecondsLeft(remaining);

        if (remaining <= 0 && nextRefillTime) {
            setAmmo(prev => Math.min(3, prev + 1));
            // Lógica de ciclo local
            if (ammo < 2) setNextRefillTime(new Date(Date.now() + 30000).toISOString());
            else setNextRefillTime(null);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [ammo, nextRefillTime]);

  // 3. ACCIÓN DE PINTAR
  // src/hooks/usePlaceGame.js

  const paint = async (x, y, color) => {
    if (ammo <= 0 || loading) return;
    
    const prevAmmo = ammo;
    const prevTime = nextRefillTime;

    setAmmo(prev => prev - 1); // Optimistic Update
    setLoading(true);

    try {
        const res = await fetch('/api/place/paint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y, color })
        });

        const data = await res.json();
        
        if (res.ok) {
            setAmmo(data.balance);
            if (data.nextRefill) setNextRefillTime(data.nextRefill);
        } else if (res.status === 429) {
            // 🛡️ SINCRONIZACIÓN AUTOMÁTICA (En lugar de alert)
            console.warn("Servidor ocupado, sincronizando munición...");
            if (data.balance !== undefined) setAmmo(data.balance);
            if (data.nextRefill) setNextRefillTime(data.nextRefill);
            // Opcional: puedes poner un sonido de "clic fallido" o vibración corta
        } else {
            setAmmo(prevAmmo);
            setNextRefillTime(prevTime);
            alert(data.error || "Error al pintar");
        }
    } catch (e) {
        setAmmo(prevAmmo);
    } finally {
        setLoading(false);
    }
  };

  return {
    pixels,
    ammo,
    secondsLeft,
    loading,
    paint
  };
}