'use client'
import Link from 'next/link';
import { useState } from 'react'; 
import { useClickerGame } from '@/hooks/useClickerGame';
// 👇 AQUI AGREGUÉ SCRAP_VALUES
import { GAME_ITEMS, UPGRADE_COSTS, SCRAP_VALUES } from '@/lib/clicker-items'; 

export default function CookieClickerGame() {
  const { 
    cookies, crumbs, cps, items, inventory, loaded, isSaving, saveMessage, 
    handleClick, buyItem, resetGame, 
    spinGacha, gachaCost,
    scrapItem, upgradeItem 
  } = useClickerGame();

  const [lastPrize, setLastPrize] = useState(null); 
  const [selectedItemIndex, setSelectedItemIndex] = useState(null); 

  const handleGacha = () => {
    if (cookies < gachaCost) return;
    const prize = spinGacha();
    if (prize) {
        setLastPrize(prize);
        setTimeout(() => setLastPrize(null), 3000);
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

  const renderStars = (level) => {
      return "⭐".repeat(level) + "☆".repeat(3 - level);
  };

  if (!loaded) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Cargando Imperio...</div>;

  return (
    <div className='min-h-screen bg-black/90 font-sans text-white touch-none selection:bg-yellow-500/30'>
      
      {/* --- MODAL: DETALLES DEL ITEM MEJORADO --- */}
      {selectedItemIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
              {(() => {
                  const slot = inventory[selectedItemIndex];
                  const itemData = GAME_ITEMS[slot.id];
                  const nextCost = UPGRADE_COSTS[slot.level];
                  const canUpgrade = slot.level < 3 && crumbs >= nextCost;
                  const isMax = slot.level >= 3;
                  
                  // 👇 CALCULAMOS EL VALOR DE RECICLAJE AQUI
                  const scrapValue = SCRAP_VALUES[itemData.rarity.id] || 0;

                  // CÁLCULO VISUAL DE ESTADÍSTICAS
                  const LEVEL_MULTS = [1, 1.5, 2.5, 5.0]; 
                  const currentMult = LEVEL_MULTS[slot.level];
                  const nextMult = isMax ? currentMult : LEVEL_MULTS[slot.level + 1];

                  const getBonusText = (multVal) => {
                      if (itemData.multiplier) { 
                          const pct = Math.round((itemData.multiplier - 1) * multVal * 100);
                          return `+${pct}% Prod. Global`;
                      }
                      if (itemData.buff) { 
                          const pct = Math.round((itemData.buff - 1) * multVal * 100);
                          return `+${pct}% Eficiencia`;
                      }
                      if (itemData.clickMultiplier) { 
                           const val = 1 + ((itemData.clickMultiplier - 1) * multVal);
                           return `x${val.toFixed(1)} Poder Click`;
                      }
                      return "";
                  };

                  return (
                    <div className="bg-gray-900 border-2 border-gray-600 p-8 rounded-2xl max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <button onClick={() => setSelectedItemIndex(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                        
                        <div className="flex flex-col items-center text-center">
                            <div className="text-7xl mb-4 relative filter drop-shadow-xl animate-bounce-slow">
                                {itemData.icon}
                                {slot.level > 0 && <span className="absolute -bottom-2 -right-2 bg-yellow-600 text-sm font-bold px-2 py-0.5 rounded-full border border-yellow-400 shadow-lg">Nvl {slot.level}</span>}
                            </div>
                            
                            <h2 className="text-2xl font-bold mb-1" style={{ color: itemData.rarity.color }}>{itemData.name}</h2>
                            <p className="text-yellow-500 text-xs tracking-[0.2em] mb-4">{renderStars(slot.level)}</p>
                            
                            <div className="bg-black/40 rounded-lg p-4 w-full mb-6 border border-white/5">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-400">Actual:</span>
                                    <span className="font-bold text-green-400">{getBonusText(currentMult)}</span>
                                </div>
                                {!isMax && (
                                    <>
                                        <div className="w-full h-px bg-white/10 my-2"></div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Siguiente Nivel:</span>
                                            <span className="font-bold text-yellow-400 animate-pulse">{getBonusText(nextMult)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <p className="text-gray-400 italic mb-6 text-xs">"{itemData.description}"</p>

                            <div className="flex gap-3 w-full">
                                {/* BOTÓN MEJORAR */}
                                <button 
                                    onClick={() => !isMax && upgradeItem(selectedItemIndex)}
                                    disabled={!canUpgrade && !isMax}
                                    className={`flex-1 py-3 rounded-xl border font-bold flex flex-col items-center justify-center transition-all relative overflow-hidden group
                                        ${isMax ? 'bg-green-900/20 border-green-500/50 text-green-500 cursor-default' : 
                                          canUpgrade ? 'bg-blue-600 border-blue-400 hover:bg-blue-500 hover:scale-[1.02] shadow-lg shadow-blue-900/50' : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'}
                                    `}
                                >
                                    {isMax ? (
                                        <span>MAXIMO ALCANZADO</span>
                                    ) : (
                                        <>
                                            <span className="text-xs uppercase font-black z-10">MEJORAR</span>
                                            <div className="flex items-center gap-1 text-sm z-10">
                                                <span>🛠️</span>
                                                <span className={crumbs >= nextCost ? "text-white" : "text-red-300"}>{nextCost}</span>
                                            </div>
                                            {canUpgrade && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                                        </>
                                    )}
                                </button>

                                {/* BOTÓN RECICLAR (CORREGIDO) */}
                                <button 
                                    onClick={() => {
                                        if(confirm(`¿Destruir por ${scrapValue} migajas?`)) {
                                            scrapItem(selectedItemIndex);
                                            setSelectedItemIndex(null);
                                        }
                                    }}
                                    className="px-4 bg-red-900/20 border border-red-500/30 hover:bg-red-900/50 hover:border-red-500 text-red-400 rounded-xl font-bold flex flex-col items-center justify-center transition-all min-w-[80px]"
                                    title={`Destruir para obtener ${scrapValue} migajas`}
                                >
                                    <span className="text-xs uppercase font-bold mb-1">Reciclar</span>
                                    <span className="text-sm flex items-center gap-1 text-white">
                                        +{scrapValue} 🛠️
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                  );
              })()}
          </div>
      )}

      {/* --- HEADER --- */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 flex justify-between items-center z-10 border-b border-white/10">
         <div className="flex items-center gap-4">
             <Link href="/minigames" className="text-gray-400 hover:text-white">← Salir</Link>
             <div className="flex flex-col">
                <span className="text-green-500 font-mono text-xs">{isSaving ? 'Guardando...' : saveMessage}</span>
             </div>
         </div>
         <div className="text-right flex items-center gap-6">
             <div className="text-right">
                <div className="text-xl font-bold text-gray-400">🛠️ {crumbs.toLocaleString()}</div>
                <div className="text-xs text-gray-600 font-mono">Migajas</div>
             </div>
             <div>
                <div className="text-3xl font-black text-yellow-500">{Math.floor(cookies).toLocaleString()} <span className="text-sm text-gray-400">Cookies</span></div>
                <div className="text-sm text-gray-400 font-mono">{cps.toFixed(1)} CPS</div>
             </div>
         </div>
      </div>

      <div className="min-h-screen pt-24 pb-10 px-4 md:px-10 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        
        {/* --- IZQUIERDA --- */}
        <div className="flex-1 flex flex-col items-center gap-8">
            <div className="relative group">
                <button 
                    id="big-cookie"
                    onClick={handleVisualClick}
                    className="text-[150px] leading-none transition-transform active:scale-95 hover:scale-105 cursor-pointer filter drop-shadow-2xl"
                    style={{ textShadow: '0 0 50px rgba(200,150,50,0.3)' }}
                >
                    🍪
                </button>
            </div>

            {/* CAJA GACHA */}
            <div className="w-full max-w-md bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 text-center">
                <h3 className="text-purple-400 font-bold tracking-widest mb-2">🔮 CAJA MISTERIOSA</h3>
                <div className="mb-4 text-sm text-purple-200 bg-purple-900/20 py-1 px-3 rounded-full inline-block">
                    Costo: <span className="font-mono font-bold text-yellow-400">{Math.floor(gachaCost).toLocaleString()}</span>
                </div>
                <button 
                    onClick={handleGacha}
                    disabled={cookies < gachaCost}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all border
                        ${cookies >= gachaCost 
                            ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-500 hover:scale-[1.02] text-white' 
                            : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {cookies >= gachaCost ? '¡Tirar Ruleta!' : 'Insuficiente'}
                </button>
            </div>

            {/* INVENTARIO INTERACTIVO */}
            {inventory.length > 0 && (
                <div className="w-full max-w-md animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-gray-400 text-sm uppercase font-bold">Inventario (Click para detalles)</h3>
                        <span className={`text-xs font-mono ${inventory.length >= 30 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
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
                                    className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-2xl relative group border border-white/5 hover:border-white/50 hover:bg-gray-700 transition-all cursor-pointer overflow-hidden"
                                >
                                    <span className="relative z-10">{itemData.icon}</span>
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundColor: itemData.rarity.color }}></div>
                                    {slot.level > 0 && (
                                        <div className="absolute bottom-0 right-0 bg-black/80 text-[10px] font-bold px-1 text-yellow-400 border-tl border-gray-600 rounded-tl">
                                            +{slot.level}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                        {Array.from({ length: Math.max(0, 30 - inventory.length) }).map((_, i) => (
                             <div key={`empty-${i}`} className="aspect-square bg-gray-900/30 rounded-lg border border-white/5 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white/5"></div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* --- DERECHA: Tienda --- */}
        <div className="flex-1 max-w-md mx-auto lg:max-w-none w-full">
          <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
             <h2 className="text-xl font-bold text-gray-300">Edificios</h2>
             <button onClick={resetGame} className="text-xs text-red-900 hover:text-red-500">Reset</button>
          </div>
          <div className="space-y-3 h-[500px] lg:h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => {
                  const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));
                  const canAfford = cookies >= currentCost;
                  return (
                      <button
                          key={item.id}
                          onClick={() => buyItem(item.id)}
                          disabled={!canAfford}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                            ${canAfford ? 'bg-gray-800 border-gray-700 hover:border-yellow-500 hover:bg-gray-750' : 'bg-gray-900 border-transparent opacity-60'}`}
                      >
                          <div className="flex items-center gap-4 relative z-10">
                              <div className="text-3xl bg-black/40 w-12 h-12 flex items-center justify-center rounded-lg">{item.icon}</div>
                              <div className="text-left">
                                  <h3 className="font-bold text-white group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                                  <p className={`text-sm font-mono ${canAfford ? 'text-green-400' : 'text-red-400'}`}>Cost: {currentCost.toLocaleString()}</p>
                              </div>
                          </div>
                          <div className="text-right relative z-10">
                              <span className="text-2xl font-bold text-gray-600 group-hover:text-white">{item.count}</span>
                              <span className="text-xs text-gray-500 block">+{item.cps} cps</span>
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