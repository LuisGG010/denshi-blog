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
    
    // --- TIER 3: INDUSTRIA (Aquí empieza el reto) ---
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
    
    // --- TIER 4: FINANZAS Y RELIGIÓN (NUEVOS) ---
    // El Banco cuesta ~10 veces más que la fábrica, pero produce ~5.5 veces más.
    // Obliga a usar upgrades.
    { id: 6, name: 'Banco', baseCost: 1400000, cps: 1400, count: 0, icon: '🏦' }, 
    
    // El Templo es un salto grande (20M). Aquí el jugador necesitará SKINS LEGENDARIAS.
    { id: 7, name: 'Templo', baseCost: 20000000, cps: 7800, count: 0, icon: '🏛️' }, 
    
    // --- TIER 5: MAGIA (ENDGAME ACTUAL) ---
    // La Torre es para jugadores dedicados. 
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

    const lastTimeRef = useRef(null);
    const requestRef = useRef(null);
    const cookiesRef = useRef(0);
    const inventoryRef = useRef([]); 


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
            }
        };
        loadGame();
    }, []);

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

        // Bonus de Cursores (+1 por cada cursor)
        const cursorItem = items.find(i => i.id === 1);
        if (cursorItem) {
            clickValue += cursorItem.count * 1; 
        }

        // Multiplicadores
        inventory.forEach(slot => {
            const item = GAME_ITEMS[slot.id];
            if (item && item.clickMultiplier) {
                const powerMult = LEVEL_MULTS[slot.level] || 1;
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

    const spinGacha = () => {
        if (inventory.length >= 30) {
            alert("¡Inventario Lleno! Recicla items para seguir jugando.");
            return null;
        }


        // --- COSTO GACHA (Con Límite de 10M) ---
        const baseCost = Math.max(5000, Math.floor(cps * 300));
        const gachaCost = Math.min(100000000, baseCost);

        if (cookiesRef.current < finalCost) return null;

        cookiesRef.current -= finalCost;
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

    // --- RECICLAR CON DEPRECIACIÓN ---
    const scrapItem = (index) => {
        const slot = inventory[index];
        const itemDef = GAME_ITEMS[slot.id];
        if(!itemDef) return;

        // Valor Base
        const baseValue = SCRAP_VALUES[itemDef.rarity.id] || 10;
        
        // Calcular inversión
        let investedCrumbs = 0;
        for (let i = 0; i < slot.level; i++) {
            investedCrumbs += UPGRADE_COSTS[i] || 0;
        }

        // Devolver Base + 50% Inversión
        const totalValue = baseValue + Math.floor(investedCrumbs * 0.5);

        setCrumbs(prev => prev + totalValue);

        const newInventory = inventory.filter((_, i) => i !== index);
        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);
    };

    const upgradeItem = (index) => {
        const newInventory = [...inventory];
        const slot = newInventory[index];
        
        if (slot.level >= 3) return;

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
        scrapItem, upgradeItem
    };
}