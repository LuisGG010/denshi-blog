'use client'

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const GRID_SIZE = 250; 
const BASE_SIZE = 800;
const COLORS = ['#FF4500', '#FFA800', '#FFD635', '#00A368', '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#000000', '#898D90', '#D4D7D9', '#FFFFFF'];

export default function PlaceGame() {
  const [pixels, setPixels] = useState({});
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  
  // ⏱️ ESTADO DEL CONTADOR
  const [cooldown, setCooldown] = useState(0); // Segundos restantes

  const canvasRef = useRef(null);
  const [hoverPos, setHoverPos] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 1. CARGA DE DATOS
  useEffect(() => {
    const fetchCanvas = async () => {
      const { data } = await supabase.from('canvas_pixels').select('*');
      if (data) {
        const pixelMap = {};
        data.forEach(p => { pixelMap[`${p.x}-${p.y}`] = p.color; });
        setPixels(pixelMap);
      }
    };
    fetchCanvas();

    const channel = supabase
      .channel('canvas_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canvas_pixels' }, (payload) => {
        const newPixel = payload.new;
        if (newPixel) {
            setPixels(prev => ({ ...prev, [`${newPixel.x}-${newPixel.y}`]: newPixel.color }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. RELOJ TIC-TAC (Countdown) ⏰
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
        setCooldown((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  // 3. DIBUJAR CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split('-').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  }, [pixels]);

  // 4. FUNCIÓN PARA ACTIVAR EL TEMPORIZADOR
  const startTimer = (targetISODate) => {
    const end = new Date(targetISODate).getTime();
    const now = new Date().getTime();
    const secondsLeft = Math.ceil((end - now) / 1000);
    if (secondsLeft > 0) setCooldown(secondsLeft);
  };

  // 5. ENVIAR CAMBIOS
  const paintPixel = async (x, y) => {
    // Si hay cooldown, no hacemos nada (ni llamamos a la API)
    if (cooldown > 0) return; 
    
    if (loading) return;
    setLoading(true);

    const res = await fetch('/api/place/paint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, color: selectedColor })
    });

    const data = await res.json();
    
    // Si pintamos bien O si nos dio error de tiempo: Activamos el reloj
    if (data.cooldownEnd) {
        startTimer(data.cooldownEnd);
    }
    
    setLoading(false);
  };

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const scaleX = GRID_SIZE / rect.width;
    const scaleY = GRID_SIZE / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (!hoverPos || hoverPos.x !== x || hoverPos.y !== y) {
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            setHoverPos({ x, y });
        } else {
            setHoverPos(null);
        }
    }
  };

  const handleMouseDown = (e) => { dragStartPos.current = { x: e.clientX, y: e.clientY }; };

  const handleMouseUp = (e) => {
    const moveX = Math.abs(e.clientX - dragStartPos.current.x);
    const moveY = Math.abs(e.clientY - dragStartPos.current.y);
    if (moveX < 5 && moveY < 5) {
        if (hoverPos) paintPixel(hoverPos.x, hoverPos.y);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center bg-[#d9d4d7] relative overflow-hidden">
      
      {/* HEADER FLOTANTE */}
      <div className="absolute top-4 z-50 flex flex-col items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg pointer-events-auto border border-gray-300 transition-all">
           
           <div className="flex items-center gap-3 justify-center">
             <h1 className="text-2xl font-bold text-gray-800 text-center">d/place</h1>
             
             {/* ⏳ EL CONTADOR VISUAL ⏳ */}
             {cooldown > 0 ? (
                 <div className="bg-red-500 text-white font-mono font-bold px-3 py-1 rounded-md animate-pulse">
                    {cooldown}s
                 </div>
             ) : (
                 <div className="bg-green-500 text-white font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wider">
                    Listo
                 </div>
             )}
           </div>
           
           <div className={`flex gap-1 mt-2 flex-wrap justify-center max-w-md transition-opacity ${cooldown > 0 ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 ${selectedColor === c ? 'border-black scale-125 shadow-md' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2 font-mono">
             {loading ? '⏳...' : `(${hoverPos ? `${hoverPos.x}, ${hoverPos.y}` : '- , -'})`}
          </p>
        </div>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={20}
        centerOnInit={true}
        wheel={{ step: 0.2 }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
                <button onClick={() => zoomIn()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xl">+</button>
                <button onClick={() => zoomOut()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xl">-</button>
                <button onClick={() => resetTransform()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xs">Reset</button>
            </div>

            <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
            >
                <div 
                    className="relative bg-white shadow-2xl"
                    style={{ width: `${BASE_SIZE}px`, height: `${BASE_SIZE}px` }}
                    onMouseLeave={() => setHoverPos(null)}
                >
                    <canvas
                        ref={canvasRef}
                        width={GRID_SIZE}
                        height={GRID_SIZE}
                        className={`w-full h-full ${cooldown > 0 ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                        style={{ imageRendering: 'pixelated' }}
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    />

                    {hoverPos && (
                        <div 
                            className="absolute pointer-events-none border-2 border-white/90 shadow-sm z-10 mix-blend-difference"
                            style={{
                                width: `${BASE_SIZE / GRID_SIZE}px`,
                                height: `${BASE_SIZE / GRID_SIZE}px`,
                                left: `${(hoverPos.x * (BASE_SIZE / GRID_SIZE))}px`,
                                top: `${(hoverPos.y * (BASE_SIZE / GRID_SIZE))}px`,
                                backgroundColor: cooldown > 0 ? 'transparent' : selectedColor, // No mostrar color si hay cooldown
                                borderColor: cooldown > 0 ? 'red' : 'white', // Borde rojo si hay cooldown
                                opacity: 0.6
                            }}
                        />
                    )}
                </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}