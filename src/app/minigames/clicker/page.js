'use client'
import Link from 'next/link';
import { useState } from 'react'; 
import { useClickerGame } from '@/hooks/useClickerGame';
import { GAME_ITEMS, UPGRADE_COSTS, SCRAP_VALUES, ITEM_TYPES } from '@/lib/clicker-items'; 
// 👇 Asegúrate de que este archivo exista con el código que te di antes
import { BuildingRow, InventorySlot } from '@/components/clicker/GameParts';

export default function CookieClickerGame() {
  const { 
    cookies, crumbs, cps, items, inventory, loaded, isSaving, saveMessage, 
    handleClick, buyItem, resetGame, 
    spinGacha, gachaCost,
    scrapItem, upgradeItem, toggleEquip,
    activeEvent, triggerEventEffect, bonusMultiplier, eventMessage, clickFrenzy
  } = useClickerGame();

  const [isSpinning, setIsSpinning] = useState(false); 
  const [lastPrize, setLastPrize] = useState(null); 
  const [selectedItemIndex, setSelectedItemIndex] = useState(null); 
  const [clickSplashes, setClickSplashes] = useState([]);

  // Calcular Fuerza Visual del Click (¡AHORA SOLO CUENTA EQUIPADOS!)
  const getClickStrength = () => {
      let strength = 1;
      const cursorItem = items.find(i => i.id === 1);
      if (cursorItem) strength += cursorItem.count * 1;

      // Sinergia de Guantelete (Solo si están equipados)
      if (cursorItem) {
          const equippedGauntlets = inventory.filter(i => i.id === 'tool_cursor_gauntlet' && i.equipped);
          
          if (equippedGauntlets.length > 0) {
             strength -= cursorItem.count * 1; // Quitamos el base
             
             let perCursor = 1;
             equippedGauntlets.forEach(gauntlet => {
                 const mults = [1.2, 1.5, 2.0, 3.0];
                 perCursor *= mults[gauntlet.level] || 1.2;
             });
             strength += cursorItem.count * perCursor; 
          }
      }

      inventory.forEach(slot => {
          // 🔥 Si no está equipado, lo ignoramos visualmente también
          if (!slot.equipped) return;

          const item = GAME_ITEMS[slot.id];
          if (item && item.clickMultiplier) {
              const LEVEL_MULTS = [1, 1.5, 2.5, 5.0];
              const powerMult = LEVEL_MULTS[slot.level] || 1;
              const finalClickMult = 1 + ((item.clickMultiplier - 1) * powerMult);
              strength *= finalClickMult;
          }
      });
      
      if (clickFrenzy) strength *= clickFrenzy;
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

  const handleVisualClick = (e) => {
    e.preventDefault(); 
    handleClick();
    const btn = document.getElementById('big-cookie');
    if(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);
    }
    const id = Date.now() + Math.random();
    const value = getClickStrength();
    
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

    const x = clientX + (Math.random() * 40 - 20); 
    const y = clientY + (Math.random() * 40 - 20);
    setClickSplashes(prev => [...prev, { id, x, y, value }]);
  };

  const removeSplash = (id) => setClickSplashes(prev => prev.filter(s => s.id !== id));

  // Contadores de Equipamiento
  const equippedTools = inventory.filter(i => i.equipped && GAME_ITEMS[i.id]?.type !== ITEM_TYPES.SKIN).length;
  const equippedSkins = inventory.filter(i => i.equipped && GAME_ITEMS[i.id]?.type === ITEM_TYPES.SKIN).length;

  if (!loaded) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">Cargando Imperio...</div>;

  return (
    <div className='min-h-screen bg-black/90 font-sans text-white selection:bg-yellow-500/30 overflow-x-hidden'>
      
      <style jsx global>{`
        @keyframes float-up { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(1.5); } }
        .animate-float { animation: float-up 0.8s forwards ease-out; pointer-events: none; }
        @keyframes pulse-gold { 0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(255, 215, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); } }
        .animate-pulse-gold { animation: pulse-gold 2s infinite; }
        @keyframes spawn-pop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
        .animate-shake { animation: shake 0.5s infinite; }
        .bg-rays { background: repeating-conic-gradient(from 0deg, rgba(255,255,255,0.1) 0deg 20deg, transparent 20deg 40deg); animation: spin-slow 10s linear infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Galleta Dorada */}
      {activeEvent && (
          <button
            className="fixed z-50 text-6xl cursor-pointer hover:scale-110 active:scale-95 transition-transform animate-pulse-gold touch-none"
            style={{ top: `${activeEvent.y}%`, left: `${activeEvent.x}%`, animation: 'spawn-pop 0.5s ease-out, pulse-gold 2s infinite' }}
            onClick={(e) => { e.stopPropagation(); triggerEventEffect(); }}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); triggerEventEffect(); }}
          >
              ✨🍪✨
          </button>
      )}

      {/* Mensaje Evento */}
      {eventMessage && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] font-black px-8 py-3 rounded-full text-xl shadow-2xl animate-in slide-in-from-top-10 fade-in duration-300 whitespace-nowrap
            ${eventMessage.includes('PODRIDA') 
                ? 'bg-red-600 text-white shadow-red-500/50' 
                : 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-yellow-500/50'
            }
          `}>
              {eventMessage}
          </div>
      )}

      {/* Click Splashes (Textos flotantes) */}
      {clickSplashes.map(splash => (
        <div 
          key={splash.id} 
          // 🔥 IMPORTANTE: Esto elimina el elemento del DOM cuando termina la animación
          onAnimationEnd={() => removeSplash(splash.id)}
          className="fixed z-[9999] text-2xl font-black text-white animate-float select-none pointer-events-none" 
          style={{ left: splash.x, top: splash.y, textShadow: '0px 2px 0px #000' }}
        >
          +{Math.floor(splash.value).toLocaleString()}
        </div>
      ))}

      {/* Modal Ruleta Girando */}
      {isSpinning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 left-0 md:left-64">
            <h2 className="text-3xl font-bold text-purple-400 mb-8 animate-pulse tracking-widest text-center px-4">ABRIENDO...</h2>
            <div className="text-[120px] md:text-[150px] animate-shake filter drop-shadow-[0_0_50px_rgba(168,85,247,0.6)]">🔮</div>
            <p className="text-gray-500 mt-8 font-mono text-sm">Decodificando...</p>
        </div>
      )}

      {/* Modal Premio Gacha */}
      {lastPrize && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in zoom-in-50 duration-300 px-4 left-0 md:left-64">
            <div className="absolute inset-0 bg-rays opacity-30 pointer-events-none"></div>
            <div className="relative bg-gray-900 border-4 p-6 md:p-8 rounded-3xl text-center shadow-[0_0_100px_rgba(255,255,255,0.2)] max-w-md w-full" style={{ borderColor: lastPrize.rarity.color }}>
                <button onClick={() => setLastPrize(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">✕</button>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase italic tracking-tighter drop-shadow-md">¡NUEVO ITEM!</h2>
                <div className="text-8xl md:text-9xl my-6 animate-bounce filter drop-shadow-2xl">{lastPrize.icon}</div>
                <div className="space-y-2">
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: lastPrize.rarity.color }}>{lastPrize.name}</div>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white/10" style={{ color: lastPrize.rarity.color }}>{lastPrize.rarity.name}</div>
                </div>
                <p className="text-gray-400 mt-6 text-sm max-w-xs mx-auto border-t border-gray-800 pt-4">{lastPrize.description}</p>
                <div className="mt-6 text-xs text-gray-500 bg-gray-800 p-2 rounded">
                    ⚠️ Ve al inventario y dale a "EQUIPAR" para usarlo.
                </div>
                <button onClick={() => setLastPrize(null)} className="mt-4 w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">¡GENIAL!</button>
            </div>
        </div>
      )}

      {/* Modal Detalle/Upgrade Item */}
      {selectedItemIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 px-4 left-0 md:left-64">
              {(() => {
                  const slot = inventory[selectedItemIndex];
                  const itemData = GAME_ITEMS[slot.id];
                  
                  const baseNextCost = UPGRADE_COSTS[slot.level] || 0;
                  const nextCost = Math.floor(baseNextCost * itemData.rarity.costMult);
                  const canUpgrade = slot.level < 3 && crumbs >= nextCost;
                  const isMax = slot.level >= 3;

                  const baseScrap = SCRAP_VALUES[itemData.rarity.id] || 0;
                  let invested = 0;
                  for(let i = 0; i < slot.level; i++) {
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
                          
                          {itemData.type === 'skin' && (
                              <div className="mb-2 px-3 py-0.5 bg-pink-900/30 border border-pink-500/40 text-pink-300 text-[10px] rounded-full uppercase font-bold tracking-widest shadow-[0_0_10px_rgba(236,72,153,0.15)]">
                                  ✨ Skin Cosmético
                              </div>
                          )}

                          <div className={`mb-4 px-3 py-1 rounded font-bold text-xs uppercase tracking-wide
                             ${slot.equipped ? 'bg-green-900/40 text-green-400 border border-green-500/50' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                              {slot.equipped ? '✅ EQUIPADO' : '💤 EN MOCHILA'}
                          </div>

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

                          {/* 🔥 BOTÓN DE EQUIPAR + ACCIONES */}
                          <div className="flex flex-col gap-2 w-full">
                              <button 
                                  onClick={() => { toggleEquip(selectedItemIndex); setSelectedItemIndex(null); }}
                                  className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all
                                    ${slot.equipped 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-500' 
                                        : 'bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800 active:border-b-0 active:translate-y-1'
                                    }`}
                              >
                                  {slot.equipped ? 'DESEQUIPAR' : 'EQUIPAR'}
                              </button>

                              <div className="flex gap-2 w-full mt-2">
                                  <button 
                                      onClick={() => !isMax && upgradeItem(selectedItemIndex)}
                                      disabled={!canUpgrade && !isMax}
                                      className={`flex-1 py-2 rounded-xl border font-bold flex flex-col items-center justify-center transition-all relative overflow-hidden group
                                          ${isMax ? 'bg-green-900/20 border-green-500/50 text-green-500 cursor-default' : 
                                              canUpgrade ? 'bg-blue-600 border-blue-400 hover:bg-blue-500 active:scale-95' : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'}
                                      `}
                                  >
                                      {isMax ? (
                                          <span>MAX</span>
                                      ) : (
                                          <div className="flex items-center gap-1 text-xs">
                                              <span>🛠️ MEJORAR</span>
                                              <span className={crumbs >= nextCost ? "text-white" : "text-red-300"}>{nextCost}</span>
                                          </div>
                                      )}
                                  </button>
                                  <button 
                                      onClick={() => { if(confirm(`¿Destruir por ${scrapValue} migajas?`)) { scrapItem(selectedItemIndex); setSelectedItemIndex(null); } }}
                                      className="px-4 bg-red-900/20 border border-red-500/30 hover:bg-red-900/50 active:scale-95 text-red-400 rounded-xl font-bold flex items-center justify-center transition-all"
                                  >
                                      <span className="text-xs">🗑️ +{scrapValue}</span>
                                  </button>
                              </div>
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
             <div className={`text-xs md:text-sm font-mono px-2 py-0.5 rounded inline-block transition-colors 
                ${bonusMultiplier > 1 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500 animate-pulse' : ''}
                ${bonusMultiplier < 1 ? 'bg-red-900/30 text-red-500 border border-red-500 animate-pulse' : ''}
                ${bonusMultiplier === 1 ? 'bg-gray-900/50 text-gray-500' : ''}
             `}>
                 {(cps * bonusMultiplier).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} CPS 
                 
                 {bonusMultiplier > 1 && ` (x${bonusMultiplier}🔥)`}
                 {bonusMultiplier < 1 && ` (↘ 10% 📉)`}
             </div>
         </div>
      </div>

      <div className="min-h-screen pt-28 pb-10 px-4 md:px-10 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        
        {/* COLUMNA IZQUIERDA: GALLETA Y GACHA E INVENTARIO */}
        <div className="flex-1 flex flex-col items-center gap-6 md:gap-8">
            <div className="relative group mt-4 md:mt-0">
                <button 
                    id="big-cookie"
                    onTouchStart={handleVisualClick} 
                    onClick={handleVisualClick}
                    className={`text-[100px] md:text-[150px] leading-none transition-transform active:scale-95 cursor-pointer filter drop-shadow-2xl select-none touch-none ${clickFrenzy > 1 ? 'animate-bounce' : ''}`}
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
                <p className="text-xs text-gray-500 mt-3">Precio = 5 Min. Prod. (Máx 1000M)</p>
            </div>

            {/* SECCIÓN INVENTARIO */}
            {inventory.length > 0 && (
                <div className="w-full max-w-md animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-gray-400 text-xs md:text-sm uppercase font-bold">Inventario</h3>
                        {/* 🔥 CONTADORES DE EQUIPAMIENTO */}
                        <div className="flex gap-2 text-[10px] md:text-xs font-mono">
                            <span className={equippedTools >= 5 ? 'text-red-500' : 'text-blue-400'}>
                                🔧 {equippedTools}/5
                            </span>
                            <span className={equippedSkins >= 5 ? 'text-red-500' : 'text-pink-400'}>
                                🎨 {equippedSkins}/5
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {inventory.map((slot, idx) => (
                            // 👇 USAMOS EL COMPONENTE OPTIMIZADO AQUÍ
                            <InventorySlot 
                                key={idx} 
                                slot={slot} 
                                index={idx} 
                                onClick={setSelectedItemIndex} 
                            />
                        ))}
                        {Array.from({ length: Math.max(0, 30 - inventory.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-gray-900/30 rounded-lg border border-white/5 flex items-center justify-center">
                                <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-white/5"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* COLUMNA DERECHA: EDIFICIOS */}
        <div className="flex-1 max-w-md mx-auto lg:max-w-none w-full pb-8">
          <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
             <h2 className="text-lg md:text-xl font-bold text-gray-300">Edificios</h2>
             <button onClick={resetGame} className="text-xs text-red-900 hover:text-red-500 px-2 py-1">Reset</button>
          </div>
          <div className="space-y-3 h-auto max-h-[500px] md:h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {items.map(item => (
                  // 👇 USAMOS EL COMPONENTE OPTIMIZADO AQUÍ
                  <BuildingRow 
                    key={item.id}
                    item={item}
                    cookies={cookies} // Pasamos cookies para que calcule si se puede comprar
                    buyItem={buyItem}
                  />
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}