'use client'
import Link from 'next/link';
import { useClickerGame } from '@/hooks/useClickerGame'; // 👈 Importamos el cerebro

export default function CookieClickerGame() {
  // Desempaquetamos toda la lógica del hook
  const { 
    cookies, cps, items, loaded, isSaving, saveMessage, 
    handleClick, buyItem, resetGame 
  } = useClickerGame();

  if (!loaded) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Cargando Imperio...</div>;

  // Función visual auxiliar para el efecto de click
  const handleVisualClick = () => {
    handleClick();
    const btn = document.getElementById('big-cookie');
    if(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }
  };

  return (
    <div className='min-h-screen bg-black/40 font-sans text-white touch-none'>
      <div className="min-h-screen pt-20 pb-10 px-4 md:px-10 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        
        <Link href="/minigames" className="absolute top-24 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition hover:-translate-x-1 font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm z-20">
          <span>&larr;</span> Salir
        </Link>

        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-700 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/10 to-transparent pointer-events-none"></div>

          <div className="text-center z-10 mb-8">
              <h2 className="text-gray-400 text-xl font-bold uppercase tracking-widest mb-2">Tu Banco</h2>
              <div className="text-5xl md:text-6xl font-black text-white drop-shadow-lg tabular-nums">
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
              onClick={handleVisualClick}
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