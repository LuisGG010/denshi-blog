import { useState, useEffect, useRef } from 'react';
import { GAME_ITEMS, SCRAP_VALUES, UPGRADE_COSTS, LEVEL_MULTS } from '@/lib/clicker-items';

const INITIAL_BUILDINGS = [
    { id: 1, name: 'Cursor Reforzado', baseCost: 15, cps: 0.1, count: 0, icon: '👆' },
    { id: 2, name: 'Abuelita', baseCost: 100, cps: 1, count: 0, icon: '👵' },
    { id: 3, name: 'Granja de Cookies', baseCost: 1100, cps: 8, count: 0, icon: '🚜' },
    { id: 4, name: 'Mina de Chocolate', baseCost: 12000, cps: 47, count: 0, icon: '⛏️' },
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
];

export function useClickerGame() {
    const [cookies, setCookies] = useState(0);
    const [crumbs, setCrumbs] = useState(0); // 👈 NUEVA MONEDA: MIGAJAS
    const [cps, setCps] = useState(0); 
    const [loaded, setLoaded] = useState(false);
    const [items, setItems] = useState(INITIAL_BUILDINGS);
    const [inventory, setInventory] = useState([]); 
    
    // Estados de UI
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const lastTimeRef = useRef(null);
    const requestRef = useRef(null);
    const cookiesRef = useRef(0);
    const inventoryRef = useRef([]); 

    // Costo del Gacha (Dinámico)
    const gachaCost = Math.max(1000, Math.floor(cps * 50));

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
                        setCrumbs(data.saveData.crumbs || 0); // Cargar Migajas

                        // Cargar Edificios
                        const loadedItems = INITIAL_BUILDINGS.map(baseItem => {
                            const savedItem = data.saveData.items.find(i => i.id === baseItem.id);
                            return savedItem ? { ...baseItem, count: savedItem.count } : baseItem;
                        });
                        setItems(loadedItems);

                        // --- MIGRACIÓN DE INVENTARIO ---
                        // Si el usuario tiene el formato viejo ["id1", "id2"], lo convertimos a objetos [{id:"id1", level:0}]
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
            }
        };
        loadGame();
    }, []);

    // 2. CÁLCULO DE PRODUCCIÓN (Con Curva de Poder)
    const recalculateCPS = (currentBuildings, currentInventory) => {
        let totalCPS = 0;
        let globalMultiplier = 1;
        const buffs = {}; 
        
        currentInventory.forEach(slot => {
            const item = GAME_ITEMS[slot.id];
            if (!item) return;

            // Obtenemos el multiplicador según el nivel actual (0, 1, 2 o 3)
            // Si por error el nivel es mayor a 3, usamos el último valor
            const powerMult = LEVEL_MULTS[slot.level] || LEVEL_MULTS[LEVEL_MULTS.length - 1];

            // A. Si es un Skin que da % Global (ej: 1.01 para +1%)
            if (item.multiplier) {
                const baseBonus = item.multiplier - 1; // 0.01
                const finalBonus = baseBonus * powerMult; // Nv3: 0.01 * 5 = 0.05
                globalMultiplier *= (1 + finalBonus);
            }

            // B. Si es una Herramienta para Edificios (ej: 1.20 para +20%)
            if (item.targetId && item.buff) {
                const baseBonus = item.buff - 1; // 0.20
                const finalBonus = baseBonus * powerMult; // Nv3: 0.20 * 5 = 1.00 (+100%)
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
        if (lastTimeRef.current !== null && cps > 0) {
            const now = Date.now();
            const deltaSeconds = (now - lastTimeRef.current) / 1000;
            if (deltaSeconds > 0) {
                cookiesRef.current += cps * deltaSeconds;
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
    }, [cps, loaded]);

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
                        crumbs: crumbs, // Guardamos migajas
                        items: items.map(i => ({ id: i.id, count: i.count })),
                        inventory: inventory // Guardamos estructura {id, level}
                    })
                });
                setSaveMessage('Guardado ✅');
                setTimeout(() => setSaveMessage(''), 2000);
            } catch (err) { console.error(err); } 
            finally { setIsSaving(false); }
        }, 10000);
        return () => clearInterval(saveInterval);
    }, [items, inventory, crumbs, loaded]);

    // 5. CLICK MANUAL (Con Curva de Poder)
    const handleClick = () => {
        let clickValue = 1;
        inventory.forEach(slot => {
            const item = GAME_ITEMS[slot.id];
            if (item && item.clickMultiplier) {
                // Aplicamos la misma curva de poder para clicks
                const powerMult = LEVEL_MULTS[slot.level] || 1;
                // Si la skin daba x2, a nivel 3 da x10 (2 * 5)
                // Ojo: Para multiplicadores directos como el click, multiplicamos el valor base
                // Si base es x2: Nv0=x2, Nv1=x3, Nv2=x5, Nv3=x10
                const finalClickMult = 1 + ((item.clickMultiplier - 1) * powerMult);
                
                clickValue *= finalClickMult;
            }
        });
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

    // --- SISTEMA GACHA ---
    const spinGacha = () => {
        if (inventory.length >= 30) {
            alert("¡Inventario Lleno! (Máx 30 items). Destruye algo.");
            return null;
        }
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

        // Guardamos OBJETO con Nivel 0
        const newInventory = [...inventory, { id: prize.id, level: 0 }];
        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);

        return prize;
    };

    // --- NUEVO: DESTRUIR Y MEJORAR ---
    
    const scrapItem = (index) => {
        const slot = inventory[index];
        const itemDef = GAME_ITEMS[slot.id];
        if(!itemDef) return;

        // Dar Migajas
        const value = SCRAP_VALUES[itemDef.rarity.id] || 10;
        setCrumbs(prev => prev + value);

        // Borrar del inventario
        const newInventory = inventory.filter((_, i) => i !== index);
        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);
    };

    const upgradeItem = (index) => {
        const newInventory = [...inventory];
        const slot = newInventory[index];
        
        if (slot.level >= 3) return; // Máx nivel 3

        const cost = UPGRADE_COSTS[slot.level];
        if (crumbs >= cost) {
            setCrumbs(prev => prev - cost);
            slot.level += 1;
            setInventory(newInventory);
            inventoryRef.current = newInventory;
            recalculateCPS(items, newInventory);
        } else {
            alert(`Necesitas ${cost} Migajas para mejorar.`);
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
        handleClick, buyItem, resetGame, spinGacha, gachaCost,
        scrapItem, upgradeItem // 👈 Nuevas funciones expuestas
    };
}