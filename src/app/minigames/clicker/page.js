'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieClickerGame() {
  // --- ESTADOS DEL JUEGO ---
  const [cookies, setCookies] = useState(0);
  const [cps, setCps] = useState(0); // Cookies por Segundo
  const [clickPower, setClickPower] = useState(1);
  const [loaded, setLoaded] = useState(false); // Para evitar errores de hidratación

  // --- TIENDA DE MEJORAS ---
  // id: identificador, name: nombre, baseCost: costo inicial, cps: cuánto produce, count: cuántos tienes, icon: emoji
  const [items, setItems] = useState([
    { id: 1, name: 'Cursor Reforzado', baseCost: 15, cps: 0.1, count: 0, icon: '👆' },
    { id: 2, name: 'Abuelita', baseCost: 100, cps: 1, count: 0, icon: '👵' },
    { id: 3, name: 'Granja de Cookies', baseCost: 1100, cps: 8, count: 0, icon: '🚜' },
    { id: 4, name: 'Mina de Chocolate', baseCost: 12000, cps: 47, count: 0, icon: '⛏️' },
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
  ]);

  // --- 1. CARGAR PARTIDA (Solo al inicio) ---
  useEffect(() => {
    const savedData = localStorage.getItem('denshi-clicker-save');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCookies(parsed.cookies || 0);
      setItems(parsed.items || items);
      // Recalcular CPS basado en los items cargados
      recalculateCPS(parsed.items || items);
    }
    setLoaded(true);
  }, []);

  // --- 2. GUARDADO AUTOMÁTICO (Cada vez que cambia algo importante) ---
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('denshi-clicker-save', JSON.stringify({
        cookies,
        items
      }));
    }
  }, [cookies, items, loaded]);

  // --- 3. GAME LOOP (El corazón del juego) ---
  useEffect(() => {
    if (!loaded || cps === 0) return;

    // Ejecutamos 10 veces por segundo para que se vea fluido
    const interval = setInterval(() => {
      setCookies((prev) => prev + (cps / 10));
    }, 100);

    return () => clearInterval(interval);
  }, [cps, loaded]);

  // --- LÓGICA ---
  
  const recalculateCPS = (currentItems) => {
    const newCps = currentItems.reduce((acc, item) => acc + (item.count * item.cps), 0);
    setCps(newCps);
  };

  const handleClick = () => {
    setCookies(cookies + clickPower);
    
    // Pequeña animación visual (opcional, manipulando el DOM directamente para performance)
    const btn = document.getElementById('big-cookie');
    if(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }
  };

  const buyItem = (itemId) => {
    const itemIndex = items.findIndex(i => i.id === itemId);
    const item = items[itemIndex];
    
    // Fórmula de costo exponencial: CostoBase * (1.15 ^ Cantidad)
    const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));

    if (cookies >= currentCost) {
      const newItems = [...items];
      newItems[itemIndex].count += 1;
      
      setCookies(cookies - currentCost);
      setItems(newItems);
      recalculateCPS(newItems);
    }
  };

  const resetGame = () => {
    if(confirm("¿Seguro que quieres borrar tu progreso?")) {
        localStorage.removeItem('denshi-clicker-save');
        window.location.reload();
    }
  }

  if (!loaded) return <div className="text-white text-center pt-20">Cargando partida...</div>;

  return (
    <div className='min-h-screen bg-black/40'>
      <div className="min-h-screen pt-20 pb-10 px-4 md:px-10 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        
        <Link href="/minigames" className="absolute top-24 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition hover:-translate-x-1 font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm z-20">
          <span>&larr;</span> Salir
        </Link>

        {/* --- COLUMNA IZQUIERDA: LA GALLETA --- */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-700 p-8 shadow-2xl relative overflow-hidden">
          {/* Rayos de sol rotando al fondo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-900/20 to-transparent pointer-events-none"></div>

          <div className="text-center z-10 mb-8">
              <h2 className="text-gray-400 text-xl font-bold uppercase tracking-widest">Tu Banco</h2>
              <div className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">
                  {Math.floor(cookies).toLocaleString()} 🍪
              </div>
              <p className="text-blue-400 font-mono mt-2 animate-pulse">
                  Producción: {cps.toFixed(1)} por segundo
              </p>
          </div>

          {/* LA GALLETA GIGANTE */}
          <button 
              id="big-cookie"
              onClick={handleClick}
              className="
                  w-64 h-64 md:w-80 md:h-80 
                  rounded-full 
                  bg-amber-600 
                  border-8 border-amber-700
                  shadow-[0_0_50px_rgba(217,119,6,0.4)]
                  hover:shadow-[0_0_80px_rgba(217,119,6,0.6)]
                  transition-all duration-100 ease-in-out
                  flex items-center justify-center
                  relative
                  group
                  cursor-pointer
              "
          >
              {/* Chispas de chocolate (decoración) */}
              <div className="absolute top-10 left-16 w-8 h-8 bg-amber-900 rounded-full opacity-60"></div>
              <div className="absolute bottom-16 right-20 w-10 h-10 bg-amber-900 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 left-10 w-6 h-6 bg-amber-900 rounded-full opacity-60"></div>
              <div className="absolute top-14 right-14 w-9 h-9 bg-amber-900 rounded-full opacity-60"></div>
              <div className="absolute bottom-10 left-1/2 w-7 h-7 bg-amber-900 rounded-full opacity-60"></div>
              
              <span className="text-9xl group-hover:scale-110 transition duration-300 drop-shadow-lg">🍪</span>
          </button>

          <button onClick={resetGame} className="mt-10 text-xs text-red-500 hover:underline opacity-50 hover:opacity-100">
              Borrar Partida
          </button>
        </div>

        {/* --- COLUMNA DERECHA: LA TIENDA --- */}
        <div className="flex-1 bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700 p-6 flex flex-col h-[600px] overflow-hidden">
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
                          className={`
                              w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                              ${canAfford 
                                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-yellow-500 cursor-pointer shadow-lg' 
                                  : 'bg-gray-900/50 border-gray-800 opacity-50 cursor-not-allowed grayscale'}
                          `}
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