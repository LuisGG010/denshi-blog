import { useState, useEffect, useRef } from 'react';
import { GAME_ITEMS, SCRAP_VALUES, UPGRADE_COSTS, LEVEL_MULTS } from '@/lib/clicker-items';

// src/hooks/useClickerGame.js

const INITIAL_BUILDINGS = [
    // --- TIER 1: INICIO RÁPIDO ---
    { id: 1, name: 'Cursor Reforzado', baseCost: 15, cps: 0.1, count: 0, icon: '👆' },
    { id: 2, name: 'Abuelita', baseCost: 100, cps: 1, count: 0, icon: '👵' },
    
    // --- TIER 2: LA PRIMERA EXPANSIÓN ---
    { id: 3, name: 'Granja de Cookies', baseCost: 1100, cps: 8, count: 0, icon: '🚜' },
    { id: 4, name: 'Mina de Chocolate', baseCost: 12000, cps: 47, count: 0, icon: '⛏️' },
    
    // --- TIER 3: INDUSTRIA ---
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
    
    // --- TIER 4: FINANZAS Y RELIGIÓN ---
    { id: 6, name: 'Banco', baseCost: 1400000, cps: 1400, count: 0, icon: '🏦' }, 
    { id: 7, name: 'Templo', baseCost: 20000000, cps: 7800, count: 0, icon: '🏛️' }, 
    
    // --- TIER 5: MAGIA ---
    { id: 8, name: 'Torre de Magos', baseCost: 330000000, cps: 44000, count: 0, icon: '🧙‍♂️' } 
];

export function useClickerGame() {
    const [cookies, setCookies] = useState(0);
    const [crumbs, setCrumbs] = useState(0); 
    const [cps, setCps] = useState(0); 
    const [loaded, setLoaded] = useState(false);
    const [items, setItems] = useState(INITIAL_BUILDINGS);
    const [inventory, setInventory] = useState([]); 
    
    // Estados de UI
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Estados de Evento
    const [activeEvent, setActiveEvent] = useState(null); 
    const [bonusMultiplier, setBonusMultiplier] = useState(1); 
    const [clickFrenzy, setClickFrenzy] = useState(1); 
    const [eventMessage, setEventMessage] = useState(null); 

    const lastTimeRef = useRef(null);
    const requestRef = useRef(null);
    const cookiesRef = useRef(0);
    const inventoryRef = useRef([]); 
    const eventTimeoutRef = useRef(null);
    const buffTimeoutRef = useRef(null);

    // 🔥 ARREGLO 1: Definir gachaCost AQUÍ (en el cuerpo principal) para poder exportarlo
    const baseGachaCost = Math.max(5000, Math.floor(cps * 300));
    const gachaCost = Math.min(100000000, baseGachaCost);

    // 1. CARGA INICIAL
    useEffect(() => {
        const loadGame = async () => {
            try {
                const res = await fetch('/api/clicker/save');
                if (res.ok) {
                    const data = await res.json();
                    if (data.saveData) {
                        cookiesRef.current = data.saveData.cookies || 0;
                        setCookies(cookiesRef.current);
                        setCrumbs(data.saveData.crumbs || 0);

                        const loadedItems = INITIAL_BUILDINGS.map(baseItem => {
                            const savedItem = data.saveData.items.find(i => i.id === baseItem.id);
                            return savedItem ? { ...baseItem, count: savedItem.count } : baseItem;
                        });
                        setItems(loadedItems);

                        let rawInventory = data.saveData.inventory || [];
                        const migratedInventory = rawInventory.map(item => {
                            if (typeof item === 'string') return { id: item, level: 0 };
                            return item;
                        });

                        setInventory(migratedInventory);
                        inventoryRef.current = migratedInventory;
                        recalculateCPS(loadedItems, migratedInventory);
                    }
                }
            } catch (error) {
                console.error("Error loading:", error);
            } finally {
                setLoaded(true);
                scheduleNextEvent();
            }
        };
        loadGame();
    }, []);

    // SISTEMA DE EVENTOS (Simplificado para el ejemplo)
    const scheduleNextEvent = () => {
        const minTime = 60000; const maxTime = 180000;
        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        setTimeout(() => spawnEventCookie(), randomTime);
    };
    const spawnEventCookie = () => {
        const x = Math.random() * 80 + 10; const y = Math.random() * 80 + 10; 
        setActiveEvent({ x, y, id: Date.now() });
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = setTimeout(() => { setActiveEvent(null); scheduleNextEvent(); }, 15000); 
    };
    const triggerEventEffect = () => {
        setActiveEvent(null);
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        const roll = Math.random();
        if (roll < 0.4) {
            setBonusMultiplier(7); setEventMessage("¡FRENESÍ DE PRODUCCIÓN! (x7 CPS)");
            if (buffTimeoutRef.current) clearTimeout(buffTimeoutRef.current);
            buffTimeoutRef.current = setTimeout(() => { setBonusMultiplier(1); setEventMessage(null); }, 30000);
        } else if (roll < 0.5) {
            setClickFrenzy(777); setEventMessage("¡FRENESÍ DE CLICK! (x777 Power)");
            if (buffTimeoutRef.current) clearTimeout(buffTimeoutRef.current);
            buffTimeoutRef.current = setTimeout(() => { setClickFrenzy(1); setEventMessage(null); }, 10000); 
        } else {
            const gain = Math.max(1000, (cps * 60 * 15)); 
            cookiesRef.current += gain; setCookies(cookiesRef.current);
            setEventMessage(`¡SUERTE! +${Math.floor(gain).toLocaleString()} Cookies`);
            setTimeout(() => setEventMessage(null), 3000);
        }
        scheduleNextEvent();
    };

    // 2. CÁLCULO DE PRODUCCIÓN
    const recalculateCPS = (currentBuildings, currentInventory) => {
        let totalCPS = 0;
        let globalMultiplier = 1;
        const buffs = {}; 
        
        currentInventory.forEach(slot => {
            const item = GAME_ITEMS[slot.id];
            if (!item) return;
            const powerMult = LEVEL_MULTS[slot.level] || LEVEL_MULTS[LEVEL_MULTS.length - 1];

            if (item.multiplier) {
                const baseBonus = item.multiplier - 1; 
                const finalBonus = baseBonus * powerMult; 
                globalMultiplier *= (1 + finalBonus);
            }
            if (item.targetId && item.buff) {
                const baseBonus = item.buff - 1; 
                const finalBonus = baseBonus * powerMult; 
                const finalBuff = 1 + finalBonus;
                buffs[item.targetId] = (buffs[item.targetId] || 1) * finalBuff;
            }
        });

        currentBuildings.forEach(building => {
            let buildingCPS = building.cps;
            if (buffs[building.id]) buildingCPS *= buffs[building.id];
            totalCPS += building.count * buildingCPS;
        });

        setCps(totalCPS * globalMultiplier);
    };

    // 3. GAME LOOP
    const animate = () => {
        if (lastTimeRef.current !== null) {
            const now = Date.now();
            const deltaSeconds = (now - lastTimeRef.current) / 1000;
            if (deltaSeconds > 0 && cps > 0) {
                const effectiveCPS = cps * bonusMultiplier;
                cookiesRef.current += effectiveCPS * deltaSeconds;
                setCookies(cookiesRef.current);
            }
            lastTimeRef.current = now;
        } else {
            lastTimeRef.current = Date.now();
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!loaded) return;
        lastTimeRef.current = Date.now();
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [cps, loaded, bonusMultiplier]);

    // 4. AUTO-SAVE
    useEffect(() => {
        if (!loaded) return;
        const saveInterval = setInterval(async () => {
            setIsSaving(true);
            try {
                await fetch('/api/clicker/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        cookies: cookiesRef.current, 
                        crumbs: crumbs,
                        items: items.map(i => ({ id: i.id, count: i.count })),
                        inventory: inventory 
                    })
                });
                setSaveMessage('Guardado ✅');
                setTimeout(() => setSaveMessage(''), 2000);
            } catch (err) { console.error(err); } 
            finally { setIsSaving(false); }
        }, 10000);
        return () => clearInterval(saveInterval);
    }, [items, inventory, crumbs, loaded]);

    // 5. ACCIONES
    const handleClick = () => {
        let clickValue = 1;

        // --- LÓGICA DE CURSORES MEJORADA ---
        const cursorItem = items.find(i => i.id === 1); // ID 1 = Cursor
        if (cursorItem) {
            // 1. Valor base por cursor
            let perCursorDamage = 1; 

            // 2. Buscamos si tenemos el item de sinergia
            const gauntlet = inventory.find(i => i.id === 'tool_cursor_gauntlet');
            
            if (gauntlet) {
                // Definimos los multiplicadores por nivel (0, 1, 2, 3)
                // Nivel 0 = x1.2 (+20%)
                // Nivel 1 = x1.5 (+50%)
                // Nivel 2 = x2.0 (+100%)
                // Nivel 3 = x3.0 (+200%)
                const mults = [1.2, 1.5, 2.0, 3.0];
                perCursorDamage *= mults[gauntlet.level] || 1.2;
            }

            // 3. Sumamos al click total
            clickValue += cursorItem.count * perCursorDamage; 
        }

        // --- RESTO DE MULTIPLICADORES GLOBALES (Igual que antes) ---
        inventory.forEach(slot => {
            const item = GAME_ITEMS[slot.id];
            if (item && item.clickMultiplier) {
                const powerMult = LEVEL_MULTS[slot.level] || 1;
                const finalClickMult = 1 + ((item.clickMultiplier - 1) * powerMult);
                clickValue *= finalClickMult;
            }
        });

        // Click Frenzy (Evento)
        clickValue *= clickFrenzy;

        cookiesRef.current += clickValue;
        setCookies(cookiesRef.current);
    };

    const buyItem = (itemId) => {
        const itemIndex = items.findIndex(i => i.id === itemId);
        const item = items[itemIndex];
        const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));

        if (cookiesRef.current >= currentCost) {
            const newItems = [...items];
            newItems[itemIndex].count += 1;
            cookiesRef.current -= currentCost;
            setCookies(cookiesRef.current);
            setItems(newItems);
            recalculateCPS(newItems, inventory);
        }
    };

    const spinGacha = () => {
        if (inventory.length >= 30) {
            alert("¡Inventario Lleno! Recicla items para seguir jugando.");
            return null;
        }

        // Usamos el gachaCost calculado en el scope principal
        if (cookiesRef.current < gachaCost) return null;

        cookiesRef.current -= gachaCost;
        setCookies(cookiesRef.current);

        const roll = Math.random();
        let selectedRarity = 'common';
        if (roll > 0.98) selectedRarity = 'legendary';
        else if (roll > 0.90) selectedRarity = 'epic';
        else if (roll > 0.70) selectedRarity = 'rare';

        const possibleItems = Object.values(GAME_ITEMS).filter(i => i.rarity.id === selectedRarity);
        if (possibleItems.length === 0) return null;

        const prize = possibleItems[Math.floor(Math.random() * possibleItems.length)];

        const newInventory = [...inventory, { id: prize.id, level: 0 }];
        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);

        return prize;
    };

    // 🔥 ARREGLO 2: Helper para calcular costes con descuento por rareza
    const getUpgradeCost = (itemDef, level) => {
        const baseCost = UPGRADE_COSTS[level];
        // Si es común, costMult es 0.5 (mitad de precio). Si es Legendario, x2.
        const multiplier = itemDef.rarity.costMult || 1; 
        return Math.floor(baseCost * multiplier);
    };

    // 🔥 ARREGLO 3: Reciclaje usando el coste real (con descuento)
    const scrapItem = (index) => {
        const slot = inventory[index];
        const itemDef = GAME_ITEMS[slot.id];
        if(!itemDef) return;

        const baseValue = SCRAP_VALUES[itemDef.rarity.id] || 10;
        
        let investedCrumbs = 0;
        for (let i = 0; i < slot.level; i++) {
            // Usamos getUpgradeCost para saber cuánto pagó realmente
            investedCrumbs += getUpgradeCost(itemDef, i);
        }

        const totalValue = baseValue + Math.floor(investedCrumbs * 0.5);

        setCrumbs(prev => prev + totalValue);

        const newInventory = inventory.filter((_, i) => i !== index);
        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);
    };

    // 🔥 ARREGLO 4: Mejora usando el coste real (con descuento)
    const upgradeItem = (index) => {
        const newInventory = [...inventory];
        const slot = newInventory[index];
        const itemDef = GAME_ITEMS[slot.id]; // Necesitamos datos del item
        
        if (slot.level >= 3) return;

        // Usamos el helper
        const cost = getUpgradeCost(itemDef, slot.level);

        if (crumbs >= cost) {
            setCrumbs(prev => prev - cost);
            slot.level += 1;
            setInventory(newInventory);
            inventoryRef.current = newInventory;
            recalculateCPS(items, newInventory);
        } else {
            alert(`Necesitas ${cost} Migajas para mejorar este item.`);
        }
    };

    const resetGame = async () => {
        if(confirm("¿Reiniciar TODO? Se perderán skins y migajas.")) {
            setCookies(0);
            setCrumbs(0);
            cookiesRef.current = 0;
            const resetBuildings = INITIAL_BUILDINGS.map(b => ({...b, count: 0}));
            setItems(resetBuildings);
            setCps(0);
            
            await fetch('/api/clicker/save', {
                method: 'POST',
                body: JSON.stringify({ 
                    cookies: 0, 
                    crumbs: 0,
                    items: [],
                    inventory: [] 
                })
            });
            window.location.reload();
        }
    };

    return {
        cookies, crumbs, cps, items, inventory, loaded, isSaving, saveMessage,
        handleClick, buyItem, resetGame, spinGacha, 
        gachaCost, // ✅ Ahora sí existe y se puede exportar
        scrapItem, upgradeItem,
        activeEvent, triggerEventEffect, bonusMultiplier, eventMessage, clickFrenzy
    };
}