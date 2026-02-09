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

// Valor de venta (Base)
export const SCRAP_VALUES = {
  'common': 50,
  'rare': 250,
  'epic': 1000,
  'legendary': 5000
};

// COSTOS DE MEJORA (Nivel 0->1, 1->2, 2->3)
export const UPGRADE_COSTS = [200, 1000, 5000]; 

// CURVA DE PODER (Multiplicador por Nivel 0, 1, 2, 3)
export const LEVEL_MULTS = [1, 1.25, 1.6, 2.1];

// 3. LA LISTA DE ITEMS
export const GAME_ITEMS = {
  // --- SKINS (Visuales + Pequeño Buff) ---
  'skin_dark_choc': {
    id: 'skin_dark_choc',
    type: ITEM_TYPES.SKIN,
    name: 'Chocolate Amargo',
    description: '70% Cacao. Un sabor adulto.',
    rarity: RARITY.COMMON,
    multiplier: 1.02, 
    icon: '🍫'
  },
  'skin_glaze_pink': {
    id: 'skin_glaze_pink',
    type: ITEM_TYPES.SKIN,
    name: 'Glaseado Rosa',
    description: 'Brilla con dulzura.',
    rarity: RARITY.COMMON,
    multiplier: 1.03,
    icon: '🍩'
  },
  'skin_candy_neon': {
    id: 'skin_candy_neon',
    type: ITEM_TYPES.SKIN,
    name: 'Caramelo Neón',
    description: 'Duele a los ojos.',
    rarity: RARITY.RARE,
    multiplier: 1.05,
    icon: '🌈'
  },
  'skin_cookie_cosmic': {
    id: 'skin_cookie_cosmic',
    type: ITEM_TYPES.SKIN,
    name: 'Cookie Cósmica',
    description: 'Hecha de materia estelar.',
    rarity: RARITY.LEGENDARY,
    multiplier: 1.15,
    icon: '🌌'
  },
  'skin_golden': {
    id: 'skin_golden',
    type: ITEM_TYPES.SKIN,
    name: 'Galleta Dorada',
    description: '¡Brilla tanto que ciega!',
    rarity: RARITY.LEGENDARY,
    clickMultiplier: 2.0, 
    icon: '✨'
  },

  // --- HERRAMIENTAS TIER 1 (Cursor & Abuela) ---
  'tool_cursor_oil': {
    id: 'tool_cursor_oil',
    type: ITEM_TYPES.TOOL,
    name: 'Aceite de Cursor',
    description: 'Los cursores resbalan mejor.',
    rarity: RARITY.COMMON,
    targetId: 1, 
    buff: 1.10 
  },
  'tool_cursor_spring': {
    id: 'tool_cursor_spring',
    type: ITEM_TYPES.TOOL,
    name: 'Resorte de Titanio',
    description: 'Clicks ultra rápidos.',
    rarity: RARITY.RARE,
    targetId: 1,
    buff: 1.25
  },
  'tool_grandma_glasses': {
    id: 'tool_grandma_glasses',
    type: ITEM_TYPES.TOOL,
    name: 'Gafas Bifocales',
    description: 'Las abuelas ven mejor las chispas.',
    rarity: RARITY.RARE,
    targetId: 2, 
    buff: 1.30
  },
  'tool_grandma_coffee': {
    id: 'tool_grandma_coffee',
    type: ITEM_TYPES.TOOL,
    name: 'Café Turbo',
    description: 'Las abuelas no duermen.',
    rarity: RARITY.EPIC,
    targetId: 2,
    buff: 1.60
  },

  // --- HERRAMIENTAS TIER 2 (Granja & Mina) ---
  'tool_farm_fertilizer': {
    id: 'tool_farm_fertilizer',
    type: ITEM_TYPES.TOOL,
    name: 'Fertilizante Dulce',
    description: 'Las galletas crecen el doble de rápido.',
    rarity: RARITY.EPIC,
    targetId: 3, 
    buff: 1.45
  },
  'tool_mine_drill': {
    id: 'tool_mine_drill',
    type: ITEM_TYPES.TOOL,
    name: 'Taladro Azucarado',
    description: 'Extrae más cristales dulces.',
    rarity: RARITY.EPIC,
    targetId: 4,
    buff: 1.65
  },

  // --- HERRAMIENTAS TIER 3 (Fábrica) ---
  'tool_factory_robot': {
    id: 'tool_factory_robot',
    type: ITEM_TYPES.TOOL,
    name: 'Brazo Robótico',
    description: 'Automatización perfecta.',
    rarity: RARITY.RARE,
    targetId: 5,
    buff: 1.35 // +35% Fábrica
  },

  // --- HERRAMIENTAS TIER 4 (Banco & Templo) ---
  'tool_bank_interest': {
    id: 'tool_bank_interest',
    type: ITEM_TYPES.TOOL,
    name: 'Interés Compuesto',
    description: 'El dinero llama al dinero.',
    rarity: RARITY.RARE,
    targetId: 6, // Banco
    buff: 1.40
  },
  'tool_temple_sacrifices': {
    id: 'tool_temple_sacrifices',
    type: ITEM_TYPES.TOOL,
    name: 'Sacrificios de Azúcar',
    description: 'Los dioses exigen dulzura.',
    rarity: RARITY.EPIC,
    targetId: 7, // Templo
    buff: 1.55
  },
  'tool_temple_idol': {
    id: 'tool_temple_idol',
    type: ITEM_TYPES.TOOL,
    name: 'Ídolo Dorado',
    description: 'Una estatua que llora chocolate.',
    rarity: RARITY.LEGENDARY,
    targetId: 7, // Templo
    buff: 1.85
  },

  // --- HERRAMIENTAS TIER 5 (Torre de Magos) ---
  'tool_wizard_grimoire': {
    id: 'tool_wizard_grimoire',
    type: ITEM_TYPES.TOOL,
    name: 'Grimorio Prohibido',
    description: 'Hechizos que invocan masa oscura.',
    rarity: RARITY.EPIC,
    targetId: 8, // Torre
    buff: 1.70
  },

  // --- ITEMS GLOBALES ---
  'global_cookie_storm': {
    id: 'global_cookie_storm',
    type: ITEM_TYPES.GLOBAL,
    name: 'Tormenta de Galletas',
    description: 'Multiplica TODO brutalmente.',
    rarity: RARITY.EPIC,
    multiplier: 1.20,
    icon: '🌪️'
  },
  'global_time_break': {
    id: 'global_time_break',
    type: ITEM_TYPES.GLOBAL,
    name: 'Fractura Temporal',
    description: 'Rompe el flujo del tiempo.',
    rarity: RARITY.LEGENDARY,
    multiplier: 1.60,
    icon: '⏳'
  },
  'global_tech_magic': {
    id: 'global_tech_magic',
    type: ITEM_TYPES.GLOBAL,
    name: 'Tecno-Magia',
    description: 'Cuando la fábrica conoce al mago.',
    rarity: RARITY.LEGENDARY,
    multiplier: 1.35,
    icon: '🔮'
  }
};

export const getItem = (id) => GAME_ITEMS[id];
export const getAllItems = () => Object.values(GAME_ITEMS);