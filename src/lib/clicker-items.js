// src/lib/clicker-items.js

// 1. Rarezas para el Gacha (Probabilidad y Color)
export const RARITY = {
  COMMON: { id: 'common', name: 'Común', chance: 0.70, color: '#9ca3af' }, // Gris
  RARE: { id: 'rare', name: 'Raro', chance: 0.20, color: '#60a5fa' },     // Azul
  EPIC: { id: 'epic', name: 'Épico', chance: 0.08, color: '#a855f7' },     // Púrpura
  LEGENDARY: { id: 'legendary', name: 'Legendario', chance: 0.02, color: '#fbbf24' } // Dorado
};

// 2. Tipos de Item
export const ITEM_TYPES = {
  SKIN: 'skin',       // Cambia la apariencia
  TOOL: 'tool',       // Mejora edificios
  GLOBAL: 'global'    // Mejora todo
};

// Eliminar para basura
export const SCRAP_VALUES = {
  'common': 50,
  'rare': 250,
  'epic': 1000,
  'legendary': 5000
};

// COSTOS DE MEJORA (Nivel 0->1, 1->2, 2->3)
// Array: [Costo Nv1, Costo Nv2, Costo Nv3]
export const UPGRADE_COSTS = [200, 1000, 5000]; 

// 🔥 NUEVO: CURVA DE PODER (Multiplicador por Nivel 0, 1, 2, 3)
// Nivel 0 = x1 (Normal)
// Nivel 1 = x1.5 (Mejor)
// Nivel 2 = x2.5 (Muy bueno)
// Nivel 3 = x5.0 (¡LEGENDARIO!)
export const LEVEL_MULTS = [1, 1.5, 2.5, 5.0];

// 3. LA LISTA DE ITEMS
export const GAME_ITEMS = {
  // --- SKINS (Visuales + Pequeño Buff) ---
  'skin_dark_choc': {
    id: 'skin_dark_choc',
    type: ITEM_TYPES.SKIN,
    name: 'Chocolate Amargo',
    description: '70% Cacao. Un sabor adulto.',
    rarity: RARITY.COMMON,
    multiplier: 1.02, // +2% Producción Global
    icon: '🍫'
  },
  'skin_golden': {
    id: 'skin_golden',
    type: ITEM_TYPES.SKIN,
    name: 'Galleta Dorada',
    description: '¡Brilla tanto que ciega!',
    rarity: RARITY.LEGENDARY,
    clickMultiplier: 2.0, // Clicks valen x2
    icon: '✨'
  },

  // --- HERRAMIENTAS (Sinergias con tus edificios) ---
  'tool_cursor_oil': {
    id: 'tool_cursor_oil',
    type: ITEM_TYPES.TOOL,
    name: 'Aceite de Cursor',
    description: 'Los cursores resbalan mejor.',
    rarity: RARITY.COMMON,
    targetId: 1, // ID del "Cursor Reforzado"
    buff: 1.2 // +20% eficiencia
  },
  'tool_grandma_glasses': {
    id: 'tool_grandma_glasses',
    type: ITEM_TYPES.TOOL,
    name: 'Gafas Bifocales',
    description: 'Las abuelas ven mejor las chispas.',
    rarity: RARITY.RARE,
    targetId: 2, // ID de la "Abuelita"
    buff: 1.5 // +50% eficiencia
  },
  'tool_farm_fertilizer': {
    id: 'tool_farm_fertilizer',
    type: ITEM_TYPES.TOOL,
    name: 'Fertilizante Dulce',
    description: 'Las galletas crecen el doble de rápido.',
    rarity: RARITY.EPIC,
    targetId: 3, // ID de la "Granja"
    buff: 2.0 // x2 eficiencia
  }
};


export const getItem = (id) => GAME_ITEMS[id];
export const getAllItems = () => Object.values(GAME_ITEMS);