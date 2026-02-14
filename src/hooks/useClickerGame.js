import { useState, useEffect, useRef } from 'react';
import { GAME_ITEMS, SCRAP_VALUES, UPGRADE_COSTS, LEVEL_MULTS, ITEM_TYPES } from '@/lib/clicker-items';
import { ascendFromClicker, generateSaveCode, loadSaveCode } from '@/app/actions';

// src/hooks/useClickerGame.js

const INITIAL_BUILDINGS = [
    { id: 1, name: 'Cursor Reforzado', baseCost: 15, cps: 0.1, count: 0, icon: '👆' },
    { id: 2, name: 'Abuelita', baseCost: 100, cps: 1, count: 0, icon: '👵' },
    { id: 3, name: 'Granja de Cookies', baseCost: 1100, cps: 8, count: 0, icon: '🚜' },
    { id: 4, name: 'Mina de Chocolate', baseCost: 12000, cps: 47, count: 0, icon: '⛏️' },
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
    { id: 6, name: 'Banco', baseCost: 1400000, cps: 1400, count: 0, icon: '🏦' }, 
    { id: 7, name: 'Templo', baseCost: 20000000, cps: 7800, count: 0, icon: '🏛️' }, 
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

    const lastUiUpdateRef = useRef(0);
    // 🔥 NUEVO: Bloqueo para evitar que el auto-save sobrescriba el ascenso
    const isAscendingRef = useRef(false);

    const baseGachaCost = Math.max(5000, Math.floor(cps * 300));
    const gachaCost = Math.min(1000000000, baseGachaCost);

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
                            // Migración: Aseguramos que tenga la propiedad 'equipped'
                            // Si es un objeto antiguo, le ponemos false por defecto.
                            const baseItem = (typeof item === 'string') ? { id: item, level: 0 } : item;
                            return { ...baseItem, equipped: baseItem.equipped || false };
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

    // 2. CÁLCULO DE PRODUCCIÓN (¡MODIFICADO!)
    const recalculateCPS = (currentBuildings, currentInventory) => {
        let totalCPS = 0;
        let globalMultiplier = 1;
        const buffs = {}; 
        
        currentInventory.forEach(slot => {
            // 🔥 REGLA DE ORO: Si no está equipado, lo ignoramos
            if (!slot.equipped) return;

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

    // 3. NUEVA FUNCIÓN: EQUIPAR / DESEQUIPAR (CORREGIDA ✅)
    const toggleEquip = (index) => {
        // Hacemos copia del array
        const newInventory = [...inventory];
        // 🔥 CLAVE: Hacemos copia del OBJETO específico. 
        // Así React detecta que es "nuevo" y actualiza el botón.
        const slot = { ...newInventory[index] }; 
        
        const itemDef = GAME_ITEMS[slot.id];

        // A. Si ya está equipado, lo quitamos
        if (slot.equipped) {
            slot.equipped = false;
        } 
        // B. Si queremos equiparlo, verificamos límites
        else {
            const isSkin = itemDef.type === ITEM_TYPES.SKIN;
            
            const currentlyEquipped = newInventory.filter(i => {
                if (!i.equipped) return false;
                const def = GAME_ITEMS[i.id];
                const type = def.type;
                if (isSkin) return type === ITEM_TYPES.SKIN;
                return type !== ITEM_TYPES.SKIN; 
            });

            const limit = isSkin ? 5 : 5; 

            if (currentlyEquipped.length >= limit) {
                alert(`¡Límite alcanzado! Solo puedes equipar ${limit} items de este tipo.`);
                return; 
            }

            slot.equipped = true;
        }

        // Insertamos el objeto copiado/modificado en el array
        newInventory[index] = slot; 

        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);
    };

    // 4. GAME LOOP
    // 4. GAME LOOP (CORREGIDO)
    const animate = () => {
        const now = Date.now();

        if (lastTimeRef.current !== null) {
            // Calculamos cuánto tiempo pasó desde el último frame (ej: 0.016 segundos)
            const deltaSeconds = (now - lastTimeRef.current) / 1000;

            if (deltaSeconds > 0 && cps > 0) {
                const effectiveCPS = cps * bonusMultiplier;
                
                // Suma matemática correcta
                cookiesRef.current += effectiveCPS * deltaSeconds;

                // Actualización Visual (Throttle)
                // Esto solo limita cuándo "ves" el cambio, no el cálculo real
                if (now - lastUiUpdateRef.current > 30) { // 100ms = 10 updates/seg
                    setCookies(cookiesRef.current);
                    lastUiUpdateRef.current = now;
                }
            }
        }

        // 🔥 CRÍTICO: Actualizamos el reloj SIEMPRE.
        // Si no hacemos esto, deltaSeconds crece infinitamente.
        lastTimeRef.current = now;

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!loaded) return;
        lastTimeRef.current = Date.now();
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [cps, loaded, bonusMultiplier]);

    // 5. AUTO-SAVE
    // 2. AUTO-SAVE CORREGIDO (Modifica tu useEffect existente)
    useEffect(() => {
        if (!loaded) return;
        const saveInterval = setInterval(async () => {
            // SI ESTAMOS ASCENDIENDO, PROHIBIDO GUARDAR
            if (isAscendingRef.current) return; 

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

    // 6. ACCIONES (CLICKS MODIFICADOS)
    const handleClick = () => {
        let clickValue = 1;
        const cursorItem = items.find(i => i.id === 1);
        if (cursorItem) clickValue += cursorItem.count * 1; 

        // Solo items EQUIPADOS afectan al click
        inventory.forEach(slot => {
            if (!slot.equipped) return; // 🔥 Ignorar mochila

            const item = GAME_ITEMS[slot.id];
            
            // Saltamos el guantelete aquí, lo calculamos especial abajo
            if (item.id === 'tool_cursor_gauntlet') return;

            if (item && item.clickMultiplier) {
                const powerMult = LEVEL_MULTS[slot.level] || 1;
                const finalClickMult = 1 + ((item.clickMultiplier - 1) * powerMult);
                clickValue *= finalClickMult;
            }
        });

        // Lógica Especial Guanteletes (Solo los equipados)
        if (cursorItem) {
            const equippedGauntlets = inventory.filter(i => i.id === 'tool_cursor_gauntlet' && i.equipped);
            if(equippedGauntlets.length > 0) {
                // Restar el valor base
                clickValue -= cursorItem.count * 1; 
                
                let perCursor = 1;
                equippedGauntlets.forEach(gauntlet => {
                    const mults = [1.2, 1.5, 2.0, 3.0];
                    perCursor *= mults[gauntlet.level] || 1.2;
                });
                clickValue += cursorItem.count * perCursor;
            }
        }

        clickValue *= clickFrenzy;
        cookiesRef.current += clickValue;
        setCookies(cookiesRef.current);
    };

    const buyItem = (itemId) => {
        const itemIndex = items.findIndex(i => i.id === itemId);
        const item = items[itemIndex];
        const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.count));

        if (cookiesRef.current >= currentCost) {
            // Hacemos copia del array de edificios
            const newItems = [...items];
            // 🔥 CLAVE: Creamos una copia del edificio que vamos a modificar
            newItems[itemIndex] = { ...item };
            
            // Modificamos la COPIA, no el original
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

        // Al ganar, item viene desequipado por defecto
        const newInventory = [...inventory, { id: prize.id, level: 0, equipped: false }];
        setInventory(newInventory);
        inventoryRef.current = newInventory;
        recalculateCPS(items, newInventory);

        return prize;
    };

    const getUpgradeCost = (itemDef, level) => {
        const baseCost = UPGRADE_COSTS[level];
        const multiplier = itemDef.rarity.costMult || 1; 
        return Math.floor(baseCost * multiplier);
    };

    const scrapItem = (index) => {
        const slot = inventory[index];
        const itemDef = GAME_ITEMS[slot.id];
        if(!itemDef) return;

        const baseValue = SCRAP_VALUES[itemDef.rarity.id] || 10;
        let investedCrumbs = 0;
        for (let i = 0; i < slot.level; i++) {
            investedCrumbs += getUpgradeCost(itemDef, i);
        }
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
        const itemDef = GAME_ITEMS[slot.id]; 
        
        if (slot.level >= 3) return;
        const cost = getUpgradeCost(itemDef, slot.level);

        if (crumbs >= cost) {
            setCrumbs(prev => prev - cost);
            slot.level += 1;
            setInventory(newInventory);
            inventoryRef.current = newInventory;
            recalculateCPS(items, newInventory);
        } else {
            alert(`Necesitas ${cost} Migajas.`);
        }
    };

    // EVENTOS (Iguales que antes, pero copiados para que esté completo)
    const scheduleNextEvent = () => {
        const minTime = 120000; const maxTime = 360000;
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
        if (roll < 0.10) {
            const loss = Math.floor(cookiesRef.current * 0.10);
            cookiesRef.current = Math.max(0, cookiesRef.current - loss);
            setCookies(cookiesRef.current);
            setEventMessage(`🤢 PODRIDA: -${loss.toLocaleString()} Cookies (-10%)`);
            if (buffTimeoutRef.current) clearTimeout(buffTimeoutRef.current);
            setTimeout(() => setEventMessage(null), 3000);
        } else if (roll < 0.40) {
            setBonusMultiplier(7); setEventMessage("¡FRENESÍ DE PRODUCCIÓN! (x7 CPS)");
            if (buffTimeoutRef.current) clearTimeout(buffTimeoutRef.current);
            buffTimeoutRef.current = setTimeout(() => { setBonusMultiplier(1); setEventMessage(null); }, 30000); 
        } else if (roll < 0.50) {
            setClickFrenzy(777); setEventMessage("¡FRENESÍ DE CLICK! (x777 Power)");
            if (buffTimeoutRef.current) clearTimeout(buffTimeoutRef.current);
            buffTimeoutRef.current = setTimeout(() => { setClickFrenzy(1); setEventMessage(null); }, 10000); 
        } else {
            const gain = Math.max(1000, Math.floor(cookiesRef.current * 0.10)); 
            cookiesRef.current += gain; setCookies(cookiesRef.current);
            setEventMessage(`¡SUERTE! +${Math.floor(gain).toLocaleString()} Cookies`);
            setTimeout(() => setEventMessage(null), 3000);
        }
        scheduleNextEvent(); 
    };

    // FUNCIÓN DE ASCENSO
    // 3. FUNCIÓN DE ASCENSO CORREGIDA
    const triggerAscension = async () => {
        if (cookiesRef.current < 300000000) return;

        const confirmacion = confirm(
            "🌌 ¿ASCENSIÓN DIMENSIONAL? 🌌\n\n" +
            "COSTO: Todo tu imperio de galletas.\n" +
            "PREMIO: +2 Capacidad en d/place.\n" +
            "(Máximo Nivel 5)"
        );

        if (confirmacion) {
            // 🛑 ACTIVAMOS EL ESCUDO ANTI-AUTOSAVE
            isAscendingRef.current = true; 
            setIsSaving(true);
            
            try {
                // Llamamos a la Server Action
                const res = await ascendFromClicker();
                
                if (res.success) {
                    alert(`✨ ¡ASCENSIÓN EXITOSA! ✨\nAhora eres Nivel ${res.newLevel}.`);
                    // Forzamos recarga inmediata para evitar que algo se guarde en memoria
                    window.location.href = window.location.href; 
                } else {
                    alert("Error: " + res.error);
                    isAscendingRef.current = false; // Si falló, permitimos guardar de nuevo
                }
            } catch (e) {
                console.error(e);
                alert("Error de conexión.");
                isAscendingRef.current = false;
            } finally {
                setIsSaving(false);
            }
        }
    };

    // 8. EXPORTAR DATOS
    const handleExport = async () => {
        const res = await generateSaveCode();
        if (res.success) {
            // Creamos un archivo de texto virtual y lo descargamos
            const blob = new Blob([res.code], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `denshi-save-${new Date().toISOString().slice(0,10)}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
            alert("💾 Archivo de guardado descargado.\nGuárdalo bien, es tu única llave de respaldo.");
        } else {
            alert("Error: " + (res.error || "Error desconocido en el servidor"));
        }
    };

    // 9. IMPORTAR DATOS
    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            // Limpiamos espacios en blanco por si acaso
            const code = content.trim();

            if(confirm("⚠️ ¿Sobrescribir tu partida actual con este archivo?\nSe recargará la página.")) {
                const res = await loadSaveCode(code);
                if (res.success) {
                    alert("✅ Partida recuperada con éxito.");
                    window.location.reload();
                } else {
                    alert("❌ Error: " + res.error);
                }
            }
        };
        reader.readAsText(file);
    };

    const resetGame = async () => {
        if(confirm("¿Reiniciar TODO? Se perderán skins y migajas.")) {
            setCookies(0); setCrumbs(0); cookiesRef.current = 0;
            const resetBuildings = INITIAL_BUILDINGS.map(b => ({...b, count: 0}));
            setItems(resetBuildings); setCps(0);
            await fetch('/api/clicker/save', {
                method: 'POST', body: JSON.stringify({ cookies: 0, crumbs: 0, items: [], inventory: [] })
            });
            window.location.reload();
        }
    };

    return {
        cookies, crumbs, cps, items, inventory, loaded, isSaving, saveMessage,
        handleClick, buyItem,
        resetGame, handleExport, handleImport, triggerAscension,
        spinGacha, gachaCost, 
        scrapItem, upgradeItem, 
        toggleEquip, // 🔥 EXPORTAMOS LA NUEVA FUNCIÓN
        activeEvent, triggerEventEffect, bonusMultiplier, eventMessage, clickFrenzy
    };
}