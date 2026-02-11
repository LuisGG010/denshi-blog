import { memo } from 'react';
import { GAME_ITEMS, UPGRADE_COSTS, SCRAP_VALUES, ITEM_TYPES } from '@/lib/clicker-items';

// --- COMPONENTE 1: BOTÓN DE EDIFICIO (OPTIMIZADO) ---
// Este botón es "tacaño": solo se redibuja si compraste uno o si cambia de "gris" a "comprable".
export const BuildingRow = memo(({ item, cookies, buyItem }) => {
    const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));
    const canAfford = cookies >= currentCost;

    return (
        <button
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
    );
}, (prev, next) => {
    // 🔥 LA MAGIA DE LA OPTIMIZACIÓN 🔥
    // React comparará esto. Si devuelve TRUE, NO renderiza de nuevo.
    const prevCost = Math.floor(prev.item.baseCost * Math.pow(1.15, prev.item.count));
    const nextCost = Math.floor(next.item.baseCost * Math.pow(1.15, next.item.count));
    
    const prevCanAfford = prev.cookies >= prevCost;
    const nextCanAfford = next.cookies >= nextCost;

    // Solo repintamos si cambió la cantidad de edificios O si cambió el estado de "puedo comprarlo"
    return prev.item.count === next.item.count && prevCanAfford === nextCanAfford;
});

BuildingRow.displayName = 'BuildingRow';


// --- COMPONENTE 2: SLOT DE INVENTARIO (OPTIMIZADO) ---
export const InventorySlot = memo(({ slot, index, onClick }) => {
    const itemData = GAME_ITEMS[slot.id];
    if (!itemData) return null;

    const isSkin = itemData.type === ITEM_TYPES.SKIN; // Asegúrate de importar ITEM_TYPES o usar string 'skin'
    const isEquipped = slot.equipped;

    return (
        <button
            onClick={() => onClick(index)}
            className={`aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-xl md:text-2xl relative group transition-all cursor-pointer z-0 hover:z-10
            hover:scale-105 active:scale-95
            ${isEquipped
                ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                : isSkin
                    ? 'border-2 border-dashed border-pink-500/40 hover:border-pink-400'
                    : 'border border-white/5 hover:border-white/50 hover:bg-gray-700'
            }
            `}
        >
            <span className="relative z-10">{itemData.icon}</span>

            {isEquipped && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-lg z-20"></div>
            )}

            <div className="absolute inset-0 rounded-lg opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: itemData.rarity.color }}></div>

            {slot.level > 0 && (
                <div className="absolute bottom-0 right-0 bg-black/80 text-[8px] md:text-[10px] font-bold px-1 text-yellow-400 border-tl border-gray-600 rounded-tl rounded-br-lg z-20">
                    +{slot.level}
                </div>
            )}
            
            {/* Tooltip omitido por brevedad, puedes pegarlo aquí si quieres */}
        </button>
    );
}); // Comparación por defecto (shallow) suele servir aquí si el objeto slot cambia de referencia al actualizarse

InventorySlot.displayName = 'InventorySlot';