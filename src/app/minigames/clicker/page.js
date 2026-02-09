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
  
  // Estado para textos flotantes
  const [clickSplashes, setClickSplashes] = useState([]);

  // Calcular Fuerza Visual del Click
  const getClickStrength = () => {
      let strength = 1;

      // 1. LÓGICA DE CURSORES CON SINERGIA (GUANTELETE)
      const cursorItem = items.find(i => i.id === 1); // ID 1 = Cursor
      if (cursorItem) {
          let perCursorDamage = 1; // Daño base por cursor

          // Buscamos si tenemos el Guantelete en el inventario
          const gauntlet = inventory.find(i => i.id === 'tool_cursor_gauntlet');
          
          if (gauntlet) {
              // Si lo tenemos, aumenta el daño según el nivel del item
              // Nivel 0: x1.2 | Nivel 1: x1.5 | Nivel 2: x2.0 | Nivel 3: x3.0
              const mults = [1.2, 1.5, 2.0, 3.0];
              perCursorDamage *= mults[gauntlet.level] || 1.2;
          }

          // Sumamos: Cantidad de Cursores * Daño por Cursor
          strength += cursorItem.count * perCursorDamage;
      }

      // 2. MULTIPLICADORES GLOBALES (SKINS)
      inventory.forEach(slot => {
          const item = GAME_ITEMS[slot.id];
          if (item && item.clickMultiplier) {
              const LEVEL_MULTS = [1, 1.5, 2.5, 5.0];
              const powerMult = LEVEL_MULTS[slot.level] || 1;
              const finalClickMult = 1 + ((item.clickMultiplier - 1) * powerMult);
              strength *= finalClickMult;
          }
      });

      return strength;
  };

  const getTargetName = (targetId) => items.find(b => b.id === targetId)?.name || "Edificio";

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

  // Click Visual con Efectos
  const handleVisualClick = (e) => {
    handleClick();

    const btn = document.getElementById('big-cookie');
    if(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }

    const id = Date.now() + Math.random();
    const value = getClickStrength();
    const x = e.clientX + (Math.random() * 40 - 20); 
    const y = e.clientY + (Math.random() * 40 - 20);

    const newSplash = { id, x, y, value };
    setClickSplashes(prev => [...prev, newSplash]);
  };

  const removeSplash = (id) => {
      setClickSplashes(prev => prev.filter(s => s.id !== id));
  };

  const renderStars = (level) => "⭐".repeat(level) + "☆".repeat(3 - level);

  if (!loaded) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Cargando Imperio...</div>;

  return (
    <div className='min-h-screen bg-black/90 font-sans text-white touch-none selection:bg-yellow-500/30 overflow-x-hidden'>
      
      <style jsx global>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
        }
        .animate-float {
            animation: float-up 0.8s forwards ease-out;
            pointer-events: none;
        }
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

      {/* Textos Flotantes */}
      {clickSplashes.map(splash => (
          <div
            key={splash.id}
            className="fixed z-[9999] text-2xl font-black text-white animate-float select-none"
            style={{ 
                left: splash.x, 
                top: splash.y,
                textShadow: '0px 2px 0px #000, 0px 0px 10px rgba(0,0,0,0.5)' 
            }}
            onAnimationEnd={() => removeSplash(splash.id)}
          >
              +{Math.floor(splash.value).toLocaleString()}
          </div>
      ))}

      {/* Pantalla Carga */}
      {isSpinning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 left-0 md:left-64">
            <h2 className="text-3xl font-bold text-purple-400 mb-8 animate-pulse tracking-widest text-center px-4">ABRIENDO...</h2>
            <div className="text-[120px] md:text-[150px] animate-shake filter drop-shadow-[0_0_50px_rgba(168,85,247,0.6)]">🔮</div>
            <p className="text-gray-500 mt-8 font-mono text-sm">Decodificando...</p>
        </div>
      )}

      {/* Pantalla Premio */}
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

      {/* Modal Detalles */}
      {selectedItemIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 px-4 left-0 md:left-64">
              {(() => {
                  const slot = inventory[selectedItemIndex];
                  const itemData = GAME_ITEMS[slot.id];
                  // 🔥 CÁLCULO DE COSTE DINÁMICO VISUAL
                  // Coste del siguiente nivel
                  const baseNextCost = UPGRADE_COSTS[slot.level] || 0;
                  const nextCost = Math.floor(baseNextCost * itemData.rarity.costMult);

                  const canUpgrade = slot.level < 3 && crumbs >= nextCost;
                  const isMax = slot.level >= 3;

                  

                  // 🔥 CÁLCULO DE RECICLAJE DINÁMICO
                  const baseScrap = SCRAP_VALUES[itemData.rarity.id] || 0;
                  let invested = 0;
                  for(let i = 0; i < slot.level; i++) {
                      // Sumamos lo que costó cada nivel según la rareza
                      const levelBaseCost = UPGRADE_COSTS[i] || 0;
                      invested += Math.floor(levelBaseCost * itemData.rarity.costMult);
                  }
                  const scrapValue = baseScrap + Math.floor(invested * 0.5);

                  const LEVEL_MULTS = [1, 1.5, 2.5, 5.0]; 
                  const currentMult = LEVEL_MULTS[slot.level];
                  const nextMult = isMax ? currentMult : LEVEL_MULTS[slot.level + 1];

                  const getBonusText = (multVal) => {
                      if (itemData.multiplier) return `+${Math.round((itemData.multiplier - 1) * multVal * 100)}% Prod. Global`;
                      if (itemData.buff) return `+${Math.round((itemData.buff - 1) * multVal * 100)}% ${getTargetName(itemData.targetId)}`;
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

      {/* Header */}
      <div className="fixed top-0 left-0 md:left-64 right-0 bg-black/80 backdrop-blur-md p-3 md:p-4 flex justify-between items-start z-10 border-b border-white/10">
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

      {/* Contenido */}
      <div className="min-h-screen pt-28 pb-10 px-4 md:px-10 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col items-center gap-6 md:gap-8">
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
                <p className="text-xs text-gray-500 mt-3">Precio = 5 Min. Prod. (Máx 100M)</p>
            </div>

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

                            const LEVEL_MULTS = [1, 1.5, 2.5, 5.0];
                            const currentMult = LEVEL_MULTS[slot.level] || 1;
                            let buffText = "";
                            if (itemData.multiplier) buffText = `+${Math.round((itemData.multiplier - 1) * currentMult * 100)}% Global`;
                            else if (itemData.buff) buffText = `+${Math.round((itemData.buff - 1) * currentMult * 100)}% ${getTargetName(itemData.targetId)}`;
                            else if (itemData.clickMultiplier) buffText = `x${(1 + ((itemData.clickMultiplier - 1) * currentMult)).toFixed(1)} Click`;

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedItemIndex(idx)}
                                    className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-xl md:text-2xl relative group border border-white/5 hover:border-white/50 hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer z-0 hover:z-10"
                                >
                                    <span className="relative z-10">{itemData.icon}</span>
                                    <div className="absolute inset-0 rounded-lg opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: itemData.rarity.color }}></div>
                                    
                                    {slot.level > 0 && (
                                        <div className="absolute bottom-0 right-0 bg-black/80 text-[8px] md:text-[10px] font-bold px-1 text-yellow-400 border-tl border-gray-600 rounded-tl rounded-br-lg z-20">
                                            +{slot.level}
                                        </div>
                                    )}

                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/95 border border-gray-600 p-2 rounded-lg shadow-xl z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                        <div className="text-[10px] font-bold mb-0.5" style={{ color: itemData.rarity.color }}>{itemData.name}</div>
                                        <div className="text-[9px] text-gray-300 leading-tight mb-1 opacity-80">"{itemData.description}"</div>
                                        {buffText && (
                                            <div className="text-[9px] font-mono font-bold text-green-400 bg-green-900/30 px-1 rounded inline-block">
                                                {buffText}
                                            </div>
                                        )}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-600"></div>
                                    </div>
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