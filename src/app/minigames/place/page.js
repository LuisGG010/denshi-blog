'use client'

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const GRID_SIZE = 250; 
const BASE_SIZE = 1000;
const COLORS = ['#FF4500', '#FFA800', '#FFD635', '#00A368', '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#000000', '#898D90', '#D4D7D9', '#FFFFFF'];

export default function PlaceGame() {
  const [pixels, setPixels] = useState({});
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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

  // 2. RELOJ TIC-TAC
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown(p => p <= 1 ? 0 : p - 1), 1000);
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

  const startTimer = (targetISODate) => {
    const secondsLeft = Math.ceil((new Date(targetISODate).getTime() - new Date().getTime()) / 1000);
    if (secondsLeft > 0) setCooldown(secondsLeft);
  };

  const paintPixel = async (x, y) => {
    if (cooldown > 0) return; 
    if (loading) return;
    setLoading(true);

    const res = await fetch('/api/place/paint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, color: selectedColor })
    });

    const data = await res.json();
    if (data.cooldownEnd) startTimer(data.cooldownEnd);
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

  const handleMouseDown = (e) => { 
      dragStartPos.current = { x: e.clientX, y: e.clientY }; 
  };

  const handleMouseUp = (e) => {
    const moveX = Math.abs(e.clientX - dragStartPos.current.x);
    const moveY = Math.abs(e.clientY - dragStartPos.current.y);
    if (moveX < 10 && moveY < 10) {
        if (hoverPos) paintPixel(hoverPos.x, hoverPos.y);
    }
  };

  return (
    // ⚠️ CAMBIO CRÍTICO AQUÍ 👇
    // 1. Quitamos 'fixed inset-0'.
    // 2. Usamos 'w-full h-[calc(100vh-20px)]' (o h-screen) para llenar SOLO el espacio del contenido.
    // 3. 'relative' asegura que los elementos 'absolute' de adentro (botones, paleta) se queden dentro de este cuadro.
    <div className="relative w-full h-[calc(100vh)] flex flex-col bg-[#d9d4d7] touch-none overflow-hidden">
      
      {/* HEADER FLOTANTE */}
      <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-lg pointer-events-auto border border-gray-300 flex items-center gap-4">
             <h1 className="text-xl font-bold text-gray-800">d/place</h1>
             
             {cooldown > 0 ? (
                 <div className="bg-red-500 text-white font-mono font-bold px-2 py-0.5 rounded text-sm animate-pulse">
                    {cooldown}s
                 </div>
             ) : (
                 <div className="bg-green-500 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    Listo
                 </div>
             )}
        </div>
      </div>

      {/* ÁREA DE JUEGO */}
      <div className="flex-1 w-full h-full relative">
        <TransformWrapper
            initialScale={0.5}
            minScale={0.1}
            maxScale={40}
            centerOnInit={true}
            wheel={{ step: 0.2 }}
            doubleClick={{ disabled: true }}
            // 👇 LA SOLUCIÓN MÁGICA 👇
            // Esto permite mover el mapa libremente, incluso "fuera" de la pantalla.
            // Así puedes traer los bordes al centro cómodamente.
            limitToBounds={false} 
        >
            {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
                <div className="hidden md:flex absolute bottom-32 right-6 flex-col gap-2 z-40">
                    <button onClick={() => zoomIn()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xl">+</button>
                    <button onClick={() => zoomOut()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xl">-</button>
                    
                    {/* 👇 BOTÓN CORREGIDO: Usamos centerView(0.5) 👇 
                        El 0.5 es el zoom al que quieres que regrese (igual que tu initialScale)
                    */}
                    <button onClick={() => centerView(0.5)} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xs">↺</button>
                </div>

                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                    <div 
                        className="relative bg-white shadow-2xl origin-center"
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
                            onTouchStart={(e) => handleMouseDown(e.touches[0])}
                            onTouchEnd={(e) => handleMouseUp(e.changedTouches[0])}
                        />

                        {hoverPos && (
                            <div 
                                className="absolute pointer-events-none border-2 border-white/90 shadow-sm z-10 mix-blend-difference"
                                style={{
                                    width: `${BASE_SIZE / GRID_SIZE}px`,
                                    height: `${BASE_SIZE / GRID_SIZE}px`,
                                    left: `${(hoverPos.x * (BASE_SIZE / GRID_SIZE))}px`,
                                    top: `${(hoverPos.y * (BASE_SIZE / GRID_SIZE))}px`,
                                    backgroundColor: cooldown > 0 ? 'transparent' : selectedColor,
                                    borderColor: cooldown > 0 ? 'red' : 'white',
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

      {/* PALETA DE COLORES RESPONSIVA */}
      <div className="
            bg-white z-50 
            w-full border-t border-gray-300 p-3 pb-6 shrink-0 shadow-lg
            md:absolute md:bottom-8 md:w-auto md:left-1/2 md:-translate-x-1/2 md:rounded-2xl md:border md:pb-3
      ">
        <p className="text-xs text-gray-400 text-center mb-2 font-mono uppercase tracking-widest">
            {loading ? 'Enviando...' : 'Selecciona Color'}
        </p>
        
        <div className="flex gap-2 overflow-x-auto pb-1 px-1 no-scrollbar justify-start md:justify-center">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-9 h-9 rounded-full border-2 shrink-0 transition-all hover:scale-110 ${selectedColor === c ? 'border-gray-800 scale-110 shadow-md ring-2 ring-gray-300' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
        </div>
      </div>

    </div>
  );
}