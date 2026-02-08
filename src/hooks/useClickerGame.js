import { useState, useEffect, useRef } from 'react';

// Items iniciales (Constante)
const INITIAL_ITEMS = [
    { id: 1, name: 'Cursor Reforzado', baseCost: 15, cps: 0.1, count: 0, icon: '👆' },
    { id: 2, name: 'Abuelita', baseCost: 100, cps: 1, count: 0, icon: '👵' },
    { id: 3, name: 'Granja de Cookies', baseCost: 1100, cps: 8, count: 0, icon: '🚜' },
    { id: 4, name: 'Mina de Chocolate', baseCost: 12000, cps: 47, count: 0, icon: '⛏️' },
    { id: 5, name: 'Fábrica', baseCost: 130000, cps: 260, count: 0, icon: '🏭' },
];

export function useClickerGame() {
    const [cookies, setCookies] = useState(0);
    const [cps, setCps] = useState(0); 
    const [loaded, setLoaded] = useState(false);
    const [items, setItems] = useState(INITIAL_ITEMS);
    
    // Estados de UI
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Refs
    const lastTimeRef = useRef(null);
    const requestRef = useRef(null);
    const cookiesRef = useRef(0);

    // 1. CARGA INICIAL
    useEffect(() => {
        const loadGame = async () => {
            try {
                const res = await fetch('/api/clicker/save');
                if (res.ok) {
                    const data = await res.json();
                    if (data.saveData) {
                        const savedCookies = data.saveData.cookies || 0;
                        setCookies(savedCookies);
                        cookiesRef.current = savedCookies;

                        const loadedItems = INITIAL_ITEMS.map(baseItem => {
                            const savedItem = data.saveData.items.find(i => i.id === baseItem.id);
                            return savedItem ? { ...baseItem, count: savedItem.count } : baseItem;
                        });
                        setItems(loadedItems);
                        recalculateCPS(loadedItems);
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

    // 2. GAME LOOP
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

    // 3. AUTO-SAVE
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
                        items: items.map(i => ({ id: i.id, count: i.count })) 
                    })
                });
                setSaveMessage('Guardado ✅');
                setTimeout(() => setSaveMessage(''), 2000);
            } catch (err) { console.error(err); } 
            finally { setIsSaving(false); }
        }, 10000);
        return () => clearInterval(saveInterval);
    }, [items, loaded]);

    // LOGICA
    const recalculateCPS = (currentItems) => {
        const newCps = currentItems.reduce((acc, item) => acc + (item.count * item.cps), 0);
        setCps(newCps);
    };

    const handleClick = () => {
        cookiesRef.current += 1;
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
            recalculateCPS(newItems);
        }
    };

    const resetGame = async () => {
        if(confirm("¿Reiniciar progreso?")) {
            setCookies(0);
            cookiesRef.current = 0;
            setItems(INITIAL_ITEMS);
            setCps(0);
            await fetch('/api/clicker/save', {
                method: 'POST',
                body: JSON.stringify({ cookies: 0, items: [] })
            });
            window.location.reload();
        }
    };

    return {
        cookies,
        cps,
        items,
        loaded,
        isSaving,
        saveMessage,
        handleClick,
        buyItem,
        resetGame
    };
}