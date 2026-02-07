'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CookieClickerGame() {
  // --- ESTADOS ---
  const [cookies, setCookies] = useState(0);
  const [cps, setCps] = useState(0); 
  const [loaded, setLoaded] = useState(false);
  
  // Estado de la Nube ☁️
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // --- TIENDA (Tus items originales) ---
  const [items, setItems] = useState([
    { id: 1, name: 'Cursor Reforzado', baseCost: 15, cps: 0.1, count: 0, icon: '👆' },
    { id: 2, name: 'Abuelita', baseCost: 100, cps: 1, count: 0, icon: '👵' },
    { id: 3, name: 'Granja de Cookies', baseCost: 1100, cps: 8, count: 0, icon: '🚜' },
    { id: 4, name: 'Mina de Chocolate', baseCost: 12000, cps: 47, count: 0, icon: '⛏️' },
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
  ]);

  // Referencias para el reloj interno (DELTA TIME)
  const lastTimeRef = useRef(null);
  const requestRef = useRef(null);
  // Referencia para guardar cookies sin depender del renderizado
  const cookiesRef = useRef(0); 

  // --- 1. CARGAR PARTIDA (Desde Supabase) ---
  useEffect(() => {
    const loadGame = async () => {
        try {
            const res = await fetch('/api/clicker/save');
            if (res.ok) {
                const data = await res.json();
                if (data.saveData) {
                    // Recuperamos cookies
                    const savedCookies = data.saveData.cookies || 0;
                    setCookies(savedCookies);
                    cookiesRef.current = savedCookies;

                    // Recuperamos items (fusionando con los originales por seguridad)
                    const loadedItems = items.map(baseItem => {
                        const savedItem = data.saveData.items.find(i => i.id === baseItem.id);
                        return savedItem ? { ...baseItem, count: savedItem.count } : baseItem;
                    });
                    setItems(loadedItems);
                    recalculateCPS(loadedItems);
                }
            }
        } catch (error) {
            console.error("Error cargando nube:", error);
        } finally {
            setLoaded(true);
        }
    };
    loadGame();
  }, []);

  // --- 2. GAME LOOP (Matemáticas Precisas) ⏳ ---
  const animate = (time) => {
    if (lastTimeRef.current !== null && cps > 0) {
      const now = Date.now();
      // Calculamos segundos reales transcurridos (Delta Time)
      const deltaSeconds = (now - lastTimeRef.current) / 1000;
      
      if (deltaSeconds > 0) {
        // Producción: CPS * Segundos
        const gained = cps * deltaSeconds;
        
        // Actualizamos referencia y estado
        cookiesRef.current += gained;
        setCookies(cookiesRef.current);
      }
      
      lastTimeRef.current = now;
    } else {
        // Primer frame o reset
        lastTimeRef.current = Date.now();
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!loaded) return;
    
    // Iniciamos/Reiniciamos el loop cuando cambia el CPS o carga
    lastTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(requestRef.current);
  }, [cps, loaded]);


  // --- 3. AUTO-GUARDADO (Cada 10s) ☁️ ---
  useEffect(() => {
    if (!loaded) return;

    const saveInterval = setInterval(async () => {
        setIsSaving(true);
        try {
            await fetch('/api/clicker/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cookies: cookiesRef.current, 
                    items: items.map(i => ({ id: i.id, count: i.count })) 
                })
            });
            setSaveMessage('Guardado en nube ✅');
            setTimeout(() => setSaveMessage(''), 2000);
        } catch (error) {
            console.error("Error guardando:", error);
        } finally {
            setIsSaving(false);
        }
    }, 10000); // 10 segundos

    return () => clearInterval(saveInterval);
  }, [items, loaded]); // Dependencias para reiniciar si cambian items


  // --- LÓGICA DE JUEGO ---
  const recalculateCPS = (currentItems) => {
    const newCps = currentItems.reduce((acc, item) => acc + (item.count * item.cps), 0);
    setCps(newCps);
  };

  const handleClick = () => {
    // Click manual
    const amount = 1; // Puedes mejorarlo luego
    cookiesRef.current += amount;
    setCookies(cookiesRef.current);
    
    // Animación visual
    const btn = document.getElementById('big-cookie');
    if(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }
  };

  const buyItem = (itemId) => {
    const itemIndex = items.findIndex(i => i.id === itemId);
    const item = items[itemIndex];
    const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));

    if (cookiesRef.current >= currentCost) {
      const newItems = [...items];
      newItems[itemIndex].count += 1;
      
      // Restamos costo
      cookiesRef.current -= currentCost;
      setCookies(cookiesRef.current);
      
      setItems(newItems);
      recalculateCPS(newItems);
    }
  };

  const resetGame = async () => {
    if(confirm("¿Borrar progreso de la nube?")) {
        setCookies(0);
        cookiesRef.current = 0;
        setItems(items.map(i => ({...i, count: 0})));
        setCps(0);
        // Enviamos partida vacía para limpiar DB
        await fetch('/api/clicker/save', {
            method: 'POST',
            body: JSON.stringify({ cookies: 0, items: [] })
        });
        window.location.reload();
    }
  }

  if (!loaded) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Cargando Imperio...</div>;

  return (
    <div className='min-h-screen bg-black/40 font-sans text-white touch-none'>
      <div className="min-h-screen pt-20 pb-10 px-4 md:px-10 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        
        <Link href="/minigames" className="absolute top-24 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition hover:-translate-x-1 font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm z-20">
          <span>&larr;</span> Salir
        </Link>

        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-700 p-8 shadow-2xl relative overflow-hidden">
          {/* Fondo animado */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/10 to-transparent pointer-events-none"></div>

          <div className="text-center z-10 mb-8">
              <h2 className="text-gray-400 text-xl font-bold uppercase tracking-widest mb-2">Tu Banco</h2>
              <div className="text-5xl md:text-6xl font-black text-white drop-shadow-lg tabular-nums">
                  {/* Math.floor visual para limpieza */}
                  {Math.floor(cookies).toLocaleString()} 🍪
              </div>
              <p className="text-blue-400 font-mono mt-2 animate-pulse">
                  Producción: {cps.toFixed(1)} / seg
              </p>
              <div className="mt-2 text-xs h-4 text-green-400 font-mono">
                  {isSaving ? '☁️ Guardando...' : saveMessage}
              </div>
          </div>

          <button 
              id="big-cookie"
              onClick={handleClick}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-amber-600 border-8 border-amber-700 shadow-[0_0_50px_rgba(217,119,6,0.4)] hover:shadow-[0_0_80px_rgba(217,119,6,0.6)] transition-all flex items-center justify-center relative group active:scale-95 touch-manipulation cursor-pointer"
          >
              <span className="text-9xl group-hover:scale-110 transition duration-300 drop-shadow-lg select-none">🍪</span>
          </button>

          <button onClick={resetGame} className="mt-10 text-xs text-red-500 hover:underline opacity-50 hover:opacity-100">
              Reiniciar Partida
          </button>
        </div>

        {/* --- COLUMNA DERECHA: TIENDA --- */}
        <div className="flex-1 bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6 flex flex-col h-[600px]">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-2">Tienda 🛒</h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {items.map((item) => {
                  const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));
                  const canAfford = cookies >= currentCost;

                  return (
                      <button
                          key={item.id}
                          onClick={() => buyItem(item.id)}
                          disabled={!canAfford}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${canAfford ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-yellow-500 shadow-lg cursor-pointer' : 'bg-gray-900/50 border-gray-800 opacity-50 cursor-not-allowed grayscale'}`}
                      >
                          <div className="flex items-center gap-4">
                              <div className="text-4xl bg-black/30 p-2 rounded-lg">{item.icon}</div>
                              <div className="text-left">
                                  <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                  <p className="text-green-400 text-sm font-mono">Cost: {currentCost.toLocaleString()}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="text-3xl font-black text-gray-700 block">{item.count}</span>
                              <span className="text-xs text-gray-500">+{item.cps} cps</span>
                          </div>
                      </button>
                  )
              })}
          </div>
        </div>

      </div>
    </div>
  );
}