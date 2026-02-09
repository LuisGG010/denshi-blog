'use client'
import Link from 'next/link';
import { useState } from 'react'; 
import { useClickerGame } from '@/hooks/useClickerGame';
import { GAME_ITEMS, UPGRADE_COSTS, SCRAP_VALUES } from '@/lib/clicker-items'; 

export default function CookieClickerGame() {
  const { 
    cookies, crumbs, cps, items, inventory, loaded, isSaving, saveMessage, 
    handleClick, buyItem, resetGame, 
    spinGacha, gachaCost,
    scrapItem, upgradeItem 
  } = useClickerGame();

  const [isSpinning, setIsSpinning] = useState(false); 
  const [lastPrize, setLastPrize] = useState(null); 
  const [selectedItemIndex, setSelectedItemIndex] = useState(null); 

  const handleGacha = () => {
    if (cookies < gachaCost || isSpinning) return;
    const prize = spinGacha();
    if (prize) {
        setIsSpinning(true); 
        setTimeout(() => {
            setIsSpinning(false); 
            setLastPrize(prize); 
            setTimeout(() => setLastPrize(null), 4000); 
        }, 2000); 
    }
  };

  const handleVisualClick = () => {
    handleClick();
    const btn = document.getElementById('big-cookie');
    if(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }
  };

  const renderStars = (level) => "⭐".repeat(level) + "☆".repeat(3 - level);

  if (!loaded) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Cargando Imperio...</div>;

  return (
    // 👇 CORRECCIÓN 1: Quité 'md:ml-64' de aquí para evitar el doble espacio.
    // El layout.js ya se encarga de empujar el contenido.
    <div className='min-h-screen bg-black/90 font-sans text-white touch-none selection:bg-yellow-500/30 overflow-x-hidden'>
      
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.5s infinite; }
        .bg-rays {
            background: repeating-conic-gradient(from 0deg, rgba(255,255,255,0.1) 0deg 20deg, transparent 20deg 40deg);
            animation: spin-slow 10s linear infinite;
        }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* --- PANTALLA DE CARGA GACHA --- */}
      {isSpinning && (
        // 👇 Mantenemos md:left-64 aquí porque es FIXED y debe ignorar al padre
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 left-0 md:left-64">
            <h2 className="text-3xl font-bold text-purple-400 mb-8 animate-pulse tracking-widest text-center px-4">ABRIENDO...</h2>
            <div className="text-[120px] md:text-[150px] animate-shake filter drop-shadow-[0_0_50px_rgba(168,85,247,0.6)]">🔮</div>
            <p className="text-gray-500 mt-8 font-mono text-sm">Decodificando...</p>
        </div>
      )}

      {/* --- PANTALLA DE PREMIO --- */}
      {lastPrize && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in zoom-in-50 duration-300 px-4 left-0 md:left-64">
            <div className="absolute inset-0 bg-rays opacity-30 pointer-events-none"></div>
            
            <div className="relative bg-gray-900 border-4 p-6 md:p-8 rounded-3xl text-center shadow-[0_0_100px_rgba(255,255,255,0.2)] max-w-md w-full" style={{ borderColor: lastPrize.rarity.color }}>
                <button onClick={() => setLastPrize(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">✕</button>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase italic tracking-tighter drop-shadow-md">¡NUEVO ITEM!</h2>
                <div className="text-8xl md:text-9xl my-6 animate-bounce filter drop-shadow-2xl">{lastPrize.icon}</div>
                
                <div className="space-y-2">
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: lastPrize.rarity.color }}>{lastPrize.name}</div>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white/10" style={{ color: lastPrize.rarity.color }}>
                        {lastPrize.rarity.name}
                    </div>
                </div>

                <p className="text-gray-400 mt-6 text-sm max-w-xs mx-auto border-t border-gray-800 pt-4">{lastPrize.description}</p>
                <button onClick={() => setLastPrize(null)} className="mt-8 w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">¡GENIAL!</button>
            </div>
        </div>
      )}

      {/* --- MODAL DETALLES --- */}
      {selectedItemIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 px-4 left-0 md:left-64">
              {(() => {
                  const slot = inventory[selectedItemIndex];
                  const itemData = GAME_ITEMS[slot.id];
                  const nextCost = UPGRADE_COSTS[slot.level];
                  const canUpgrade = slot.level < 3 && crumbs >= nextCost;
                  const isMax = slot.level >= 3;
                  const scrapValue = SCRAP_VALUES[itemData.rarity.id] || 0;

                  const LEVEL_MULTS = [1, 1.5, 2.5, 5.0]; 
                  const currentMult = LEVEL_MULTS[slot.level];
                  const nextMult = isMax ? currentMult : LEVEL_MULTS[slot.level + 1];

                  const getBonusText = (multVal) => {
                      if (itemData.multiplier) return `+${Math.round((itemData.multiplier - 1) * multVal * 100)}% Prod. Global`;
                      if (itemData.buff) return `+${Math.round((itemData.buff - 1) * multVal * 100)}% Eficiencia`;
                      if (itemData.clickMultiplier) return `x${(1 + ((itemData.clickMultiplier - 1) * multVal)).toFixed(1)} Poder Click`;
                      return "";
                  };

                  return (
                    <div className="bg-gray-900 border-2 border-gray-600 p-6 md:p-8 rounded-2xl max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <button onClick={() => setSelectedItemIndex(null)} className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-white p-2">✕</button>
                        
                        <div className="flex flex-col items-center text-center">
                            <div className="text-7xl mb-4 relative filter drop-shadow-xl animate-bounce-slow">
                                {itemData.icon}
                                {slot.level > 0 && <span className="absolute -bottom-2 -right-2 bg-yellow-600 text-sm font-bold px-2 py-0.5 rounded-full border border-yellow-400 shadow-lg">Nvl {slot.level}</span>}
                            </div>
                            
                            <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: itemData.rarity.color }}>{itemData.name}</h2>
                            <p className="text-yellow-500 text-xs tracking-[0.2em] mb-4">{renderStars(slot.level)}</p>
                            
                            <div className="bg-black/40 rounded-lg p-3 w-full mb-6 border border-white/5">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-400">Actual:</span>
                                    <span className="font-bold text-green-400">{getBonusText(currentMult)}</span>
                                </div>
                                {!isMax && (
                                    <>
                                        <div className="w-full h-px bg-white/10 my-2"></div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Siguiente:</span>
                                            <span className="font-bold text-yellow-400 animate-pulse">{getBonusText(nextMult)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => !isMax && upgradeItem(selectedItemIndex)}
                                    disabled={!canUpgrade && !isMax}
                                    className={`flex-1 py-3 rounded-xl border font-bold flex flex-col items-center justify-center transition-all relative overflow-hidden group
                                        ${isMax ? 'bg-green-900/20 border-green-500/50 text-green-500 cursor-default' : 
                                          canUpgrade ? 'bg-blue-600 border-blue-400 hover:bg-blue-500 active:scale-95' : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'}
                                    `}
                                >
                                    {isMax ? (
                                        <span>MAX</span>
                                    ) : (
                                        <>
                                            <span className="text-xs uppercase font-black z-10">MEJORAR</span>
                                            <div className="flex items-center gap-1 text-sm z-10">
                                                <span>🛠️</span>
                                                <span className={crumbs >= nextCost ? "text-white" : "text-red-300"}>{nextCost}</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => { if(confirm(`¿Destruir por ${scrapValue} migajas?`)) { scrapItem(selectedItemIndex); setSelectedItemIndex(null); } }}
                                    className="px-4 bg-red-900/20 border border-red-500/30 hover:bg-red-900/50 active:scale-95 text-red-400 rounded-xl font-bold flex flex-col items-center justify-center transition-all min-w-[80px]"
                                >
                                    <span className="text-xs uppercase font-bold mb-1">Reciclar</span>
                                    <span className="text-sm flex items-center gap-1 text-white">+{scrapValue} 🛠️</span>
                                </button>
                            </div>
                        </div>
                    </div>
                  );
              })()}
          </div>
      )}

      {/* --- HEADER --- */}
      {/* 👇 Mantenemos md:left-64 aquí porque es FIXED y el layout no lo empuja */}
      <div className="fixed top-0 left-0 md:left-64 right-0 bg-black/80 backdrop-blur-md p-3 md:p-4 flex justify-between items-start z-10 border-b border-white/10">
         
         {/* IZQUIERDA */}
         <div className="flex flex-col gap-2 items-start">
             <div className="flex items-center gap-3">
                 <Link href="/minigames" className="text-gray-400 hover:text-white text-sm md:text-base">← Salir</Link>
                 <span className="text-green-500 font-mono text-[10px] md:text-xs">{isSaving ? '☁️' : '✓'}</span>
             </div>
             
             <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700 mt-1">
                 <span className="text-lg">🛠️</span>
                 <div className="flex flex-col leading-none">
                     <span className="font-bold text-gray-200 text-sm md:text-base">{crumbs.toLocaleString()}</span>
                     <span className="text-[9px] text-gray-500 uppercase font-bold">Migajas</span>
                 </div>
             </div>
         </div>

         {/* DERECHA */}
         <div className="text-right">
             <div className="text-2xl md:text-4xl font-black text-yellow-500 leading-none">
                 {Math.floor(cookies).toLocaleString()}
             </div>
             <div className="text-xs text-gray-400 uppercase font-bold mb-1">Cookies</div>
             <div className="text-xs md:text-sm text-gray-500 font-mono bg-gray-900/50 px-2 py-0.5 rounded inline-block">
                 {cps.toFixed(1)} CPS
             </div>
         </div>
      </div>

      <div className="min-h-screen pt-28 pb-10 px-4 md:px-10 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        
        {/* --- COLUMNA 1 --- */}
        <div className="flex-1 flex flex-col items-center gap-6 md:gap-8">
            {/* Galleta */}
            <div className="relative group mt-4 md:mt-0">
                <button 
                    id="big-cookie"
                    onClick={handleVisualClick}
                    className="text-[100px] md:text-[150px] leading-none transition-transform active:scale-95 cursor-pointer filter drop-shadow-2xl select-none"
                    style={{ textShadow: '0 0 50px rgba(200,150,50,0.3)', WebkitTapHighlightColor: 'transparent' }}
                >
                    🍪
                </button>
            </div>

            {/* Caja Gacha */}
            <div className="w-full max-w-md bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 text-center shadow-lg">
                <h3 className="text-purple-400 font-bold tracking-widest mb-2 text-sm md:text-base">🔮 CAJA MISTERIOSA</h3>
                <div className="mb-4 text-xs md:text-sm text-purple-200 bg-purple-900/20 py-1 px-3 rounded-full inline-block">
                    Costo: <span className="font-mono font-bold text-yellow-400">{Math.floor(gachaCost).toLocaleString()}</span>
                </div>
                <button 
                    onClick={handleGacha}
                    disabled={cookies < gachaCost || isSpinning}
                    className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all border active:scale-95
                        ${cookies >= gachaCost && !isSpinning
                            ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] text-white' 
                            : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isSpinning ? '...' : cookies >= gachaCost ? '¡Tirar Ruleta!' : 'Insuficiente'}
                </button>
            </div>

            {/* Inventario */}
            {inventory.length > 0 && (
                <div className="w-full max-w-md animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-gray-400 text-xs md:text-sm uppercase font-bold">Inventario</h3>
                        <span className={`text-[10px] md:text-xs font-mono ${inventory.length >= 30 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            {inventory.length}/30 Slots
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                        {inventory.map((slot, idx) => {
                            const itemData = GAME_ITEMS[slot.id];
                            if(!itemData) return null;
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedItemIndex(idx)}
                                    className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-xl md:text-2xl relative group border border-white/5 active:scale-95 transition-all overflow-hidden"
                                >
                                    <span className="relative z-10">{itemData.icon}</span>
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundColor: itemData.rarity.color }}></div>
                                    {slot.level > 0 && (
                                        <div className="absolute bottom-0 right-0 bg-black/80 text-[8px] md:text-[10px] font-bold px-1 text-yellow-400 border-tl border-gray-600 rounded-tl">
                                            +{slot.level}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                        {Array.from({ length: Math.max(0, 30 - inventory.length) }).map((_, i) => (
                             <div key={`empty-${i}`} className="aspect-square bg-gray-900/30 rounded-lg border border-white/5 flex items-center justify-center">
                                <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-white/5"></div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* --- COLUMNA 2: Tienda --- */}
        <div className="flex-1 max-w-md mx-auto lg:max-w-none w-full pb-8">
          <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
             <h2 className="text-lg md:text-xl font-bold text-gray-300">Edificios</h2>
             <button onClick={resetGame} className="text-xs text-red-900 hover:text-red-500 px-2 py-1">Reset</button>
          </div>
          <div className="space-y-3 h-[400px] md:h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {items.map(item => {
                  const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));
                  const canAfford = cookies >= currentCost;
                  return (
                      <button
                          key={item.id}
                          onClick={() => buyItem(item.id)}
                          disabled={!canAfford}
                          className={`w-full flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden active:scale-[0.98]
                            ${canAfford ? 'bg-gray-800 border-gray-700 hover:border-yellow-500 hover:bg-gray-750' : 'bg-gray-900 border-transparent opacity-60'}`}
                      >
                          <div className="flex items-center gap-3 md:gap-4 relative z-10">
                              <div className="text-2xl md:text-3xl bg-black/40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg">{item.icon}</div>
                              <div className="text-left">
                                  <h3 className="font-bold text-white text-sm md:text-base group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                                  <p className={`text-xs md:text-sm font-mono ${canAfford ? 'text-green-400' : 'text-red-400'}`}>Cost: {currentCost.toLocaleString()}</p>
                              </div>
                          </div>
                          <div className="text-right relative z-10">
                              <span className="text-xl md:text-2xl font-bold text-gray-600 group-hover:text-white">{item.count}</span>
                              <span className="text-[10px] md:text-xs text-gray-500 block">+{item.cps} cps</span>
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