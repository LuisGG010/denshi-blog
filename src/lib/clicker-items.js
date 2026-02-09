// src/lib/clicker-items.js

// 1. Rarezas para el Gacha (Probabilidad y Color)
export const RARITY = {
  // 🔥 AÑADIDO: costMult para ajustar el precio de mejora según rareza
  COMMON: { id: 'common', name: 'Común', chance: 0.70, color: '#9ca3af', costMult: 0.5 }, // Barato
  RARE: { id: 'rare', name: 'Raro', chance: 0.20, color: '#60a5fa', costMult: 1.0 },      // Normal
  EPIC: { id: 'epic', name: 'Épico', chance: 0.08, color: '#a855f7', costMult: 1.5 },     // Caro
  LEGENDARY: { id: 'legendary', name: 'Legendario', chance: 0.02, color: '#fbbf24', costMult: 2.0 } // Muy caro
};

export const ITEM_TYPES = {
  SKIN: 'skin',
  TOOL: 'tool',
  GLOBAL: 'global'
};

export const SCRAP_VALUES = {
  'common': 50,
  'rare': 250,
  'epic': 1000,
  'legendary': 5000
};

export const UPGRADE_COSTS = [200, 1000, 5000];

export const LEVEL_MULTS = [1, 1.25, 1.6, 2.1];

export const GAME_ITEMS = {
  // --- SKINS ---
  'skin_dark_choc': {
    id: 'skin_dark_choc',
    type: ITEM_TYPES.SKIN,
    name: 'Chocolate Amargo',
    description: '70% cacao puro.',
    rarity: RARITY.COMMON,
    multiplier: 1.02,
    icon: '🍫'
  },
  'skin_glaze_pink': {
    id: 'skin_glaze_pink',
    type: ITEM_TYPES.SKIN,
    name: 'Glaseado Rosa',
    description: 'Dulzura extrema.',
    rarity: RARITY.COMMON,
    multiplier: 1.02,
    icon: '🍩'
  },
  'skin_mint_frost': {
    id: 'skin_mint_frost',
    type: ITEM_TYPES.SKIN,
    name: 'Menta Helada',
    description: 'Frescura productiva.',
    rarity: RARITY.RARE,
    multiplier: 1.05,
    icon: '❄️'
  },
  'skin_candy_neon': {
    id: 'skin_candy_neon',
    type: ITEM_TYPES.SKIN,
    name: 'Caramelo Neón',
    description: 'Luces que producen.',
    rarity: RARITY.RARE,
    multiplier: 1.05,
    icon: '🌈'
  },
  'skin_cookie_cosmic': {
    id: 'skin_cookie_cosmic',
    type: ITEM_TYPES.SKIN,
    name: 'Cookie Cósmica',
    description: 'Materia estelar condensada.',
    rarity: RARITY.LEGENDARY,
    multiplier: 1.15,
    icon: '🌌'
  },
  'skin_golden': {
    id: 'skin_golden',
    type: ITEM_TYPES.SKIN,
    name: 'Galleta Dorada',
    description: 'Clicks bendecidos.',
    rarity: RARITY.LEGENDARY,
    clickMultiplier: 2.5,
    icon: '✨'
  },

  // --- HERRAMIENTAS T1 ---
  'tool_cursor_oil': {
    id: 'tool_cursor_oil',
    type: ITEM_TYPES.TOOL,
    name: 'Aceite de Cursor',
    description: 'Cursores más fluidos.',
    rarity: RARITY.COMMON,
    targetId: 1,
    buff: 1.10
  },
  'tool_cursor_gauntlet': {
    id: 'tool_cursor_gauntlet',
    type: ITEM_TYPES.TOOL,
    name: 'Guantelete de Poder',
    description: 'Tus cursores golpean con +20% de fuerza.',
    rarity: RARITY.RARE,
    targetId: 1, // ID del Cursor
    // No usamos 'buff' estándar porque esto afecta al CLICK manual, no al CPS
  },
  'tool_cursor_spring': {
    id: 'tool_cursor_spring',
    type: ITEM_TYPES.TOOL,
    name: 'Resorte de Titanio',
    description: 'Clicks rápidos.',
    rarity: RARITY.RARE,
    targetId: 1,
    buff: 1.25,
    clickMultiplier: 1.05
  },
  'tool_grandma_glasses': {
    id: 'tool_grandma_glasses',
    type: ITEM_TYPES.TOOL,
    name: 'Gafas Bifocales',
    description: 'Abuelas eficientes.',
    rarity: RARITY.RARE,
    targetId: 2,
    buff: 1.30
  },
  'tool_grandma_coffee': {
    id: 'tool_grandma_coffee',
    type: ITEM_TYPES.TOOL,
    name: 'Café Turbo',
    description: 'No duermen.',
    rarity: RARITY.EPIC,
    targetId: 2,
    buff: 1.60
  },

  // --- HERRAMIENTAS T2 ---
  'tool_farm_fertilizer': {
    id: 'tool_farm_fertilizer',
    type: ITEM_TYPES.TOOL,
    name: 'Fertilizante Dulce',
    description: 'Crecimiento eficiente.',
    rarity: RARITY.EPIC,
    targetId: 3,
    buff: 1.45
  },
  'tool_farm_irrigation': {
    id: 'tool_farm_irrigation',
    type: ITEM_TYPES.TOOL,
    name: 'Riego Automatizado',
    description: 'Granjas más constantes.',
    rarity: RARITY.RARE,
    targetId: 3,
    buff: 1.25
  },

  'tool_mine_drill': {
    id: 'tool_mine_drill',
    type: ITEM_TYPES.TOOL,
    name: 'Taladro Azucarado',
    description: 'Minería eficiente.',
    rarity: RARITY.EPIC,
    targetId: 4,
    buff: 1.65
  },

  // --- HERRAMIENTAS T3 ---
  'tool_factory_robot': {
    id: 'tool_factory_robot',
    type: ITEM_TYPES.TOOL,
    name: 'Brazo Robótico',
    description: 'Automatización precisa.',
    rarity: RARITY.RARE,
    targetId: 5,
    buff: 1.35
  },
  'tool_factory_ai': {
    id: 'tool_factory_ai',
    type: ITEM_TYPES.TOOL,
    name: 'IA Industrial',
    description: 'Optimización constante.',
    rarity: RARITY.EPIC,
    targetId: 5,
    buff: 1.55
  },

  // --- HERRAMIENTAS T4 ---
  'tool_bank_interest': {
    id: 'tool_bank_interest',
    type: ITEM_TYPES.TOOL,
    name: 'Interés Compuesto',
    description: 'Economía estable.',
    rarity: RARITY.RARE,
    targetId: 6,
    buff: 1.40
  },
  'tool_bank_investor': {
    id: 'tool_bank_investor',
    type: ITEM_TYPES.TOOL,
    name: 'Inversor Legendario',
    description: 'Capital infinito.',
    rarity: RARITY.EPIC,
    targetId: 6,
    buff: 1.60
  },

  'tool_temple_sacrifices': {
    id: 'tool_temple_sacrifices',
    type: ITEM_TYPES.TOOL,
    name: 'Sacrificios de Azúcar',
    description: 'Bendiciones divinas.',
    rarity: RARITY.EPIC,
    targetId: 7,
    buff: 1.55
  },
  'tool_temple_idol': {
    id: 'tool_temple_idol',
    type: ITEM_TYPES.TOOL,
    name: 'Ídolo Dorado',
    description: 'Fe cristalizada.',
    rarity: RARITY.LEGENDARY,
    targetId: 7,
    buff: 1.85
  },

  // --- HERRAMIENTAS T5 ---
  'tool_wizard_grimoire': {
    id: 'tool_wizard_grimoire',
    type: ITEM_TYPES.TOOL,
    name: 'Grimorio Prohibido',
    description: 'Hechicería avanzada.',
    rarity: RARITY.EPIC,
    targetId: 8,
    buff: 1.70
  },

  // --- GLOBALES ---
  'global_cookie_storm': {
    id: 'global_cookie_storm',
    type: ITEM_TYPES.GLOBAL,
    name: 'Tormenta de Galletas',
    description: 'Producción mejorada.',
    rarity: RARITY.EPIC,
    multiplier: 1.20,
    icon: '🌪️'
  },
  'global_time_break': {
    id: 'global_time_break',
    type: ITEM_TYPES.GLOBAL,
    name: 'Fractura Temporal',
    description: 'Tiempo alterado.',
    rarity: RARITY.LEGENDARY,
    multiplier: 1.40,
    icon: '⏳'
  },
  'global_tech_magic': {
    id: 'global_tech_magic',
    type: ITEM_TYPES.GLOBAL,
    name: 'Tecno-Magia',
    description: 'Tecnología arcana.',
    rarity: RARITY.LEGENDARY,
    multiplier: 1.35,
    icon: '🔮'
  }
};

export const getItem = (id) => GAME_ITEMS[id];
export const getAllItems = () => Object.values(GAME_ITEMS);
