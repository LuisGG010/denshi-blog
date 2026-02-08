'use client'

import { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { usePlaceGame } from '@/hooks/usePlaceGame'; // 👈 Importamos el hook

const GRID_SIZE = 250; 
const BASE_SIZE = 1000;
const COLORS = ['#FF4500', '#FFA800', '#FFD635', '#00A368', '#7EED56', '#2450A4', '#3690EA', '#51E9F4', '#811E9F', '#B44AC0', '#FF99AA', '#9C6926', '#000000', '#898D90', '#D4D7D9', '#FFFFFF'];

export default function PlaceGame() {
  // Desempaquetamos la lógica
  const { pixels, ammo, secondsLeft, loading, paint } = usePlaceGame();
  
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const canvasRef = useRef(null);
  const transformRef = useRef(null);
  const [hoverPos, setHoverPos] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 1. ZOOM AUTOMÁTICO INICIAL (Visual)
  useEffect(() => {
    setTimeout(() => {
        if (transformRef.current) {
            const initialZoom = window.innerWidth > 768 ? 1 : 0.4;
            transformRef.current.centerView(initialZoom);
        }
    }, 100);
  }, []);

  // 2. DIBUJAR CANVAS (Visual)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fondo blanco base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
    
    // Pintar píxeles
    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split('-').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  }, [pixels]);

  // HANDLERS DE MOUSE (Visual)
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
    // Si no arrastró mucho, es un click -> PINTAR
    if (moveX < 10 && moveY < 10 && hoverPos) {
        paint(hoverPos.x, hoverPos.y, selectedColor);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col bg-[#d9d4d7] touch-none overflow-hidden z-0">
      
      {/* HEADER */}
      <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-lg pointer-events-auto border border-gray-300 flex items-center gap-4">
             <h1 className="text-xl font-bold text-gray-800 hidden sm:block">d/place</h1>
             
             {/* 🔋 UI DE PUNTOS */}
             <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div 
                            key={i} 
                            className={`w-4 h-6 rounded-sm border transition-all ${
                                i <= ammo 
                                ? 'bg-green-500 border-green-600 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                                : 'bg-gray-200 border-gray-300'
                            }`}
                        />
                    ))}
                </div>
                {ammo < 3 && (
                    <span className="text-xs font-mono font-bold text-gray-500 w-12 text-right">
                        {secondsLeft > 0 ? `+${secondsLeft}s` : '...'}
                    </span>
                )}
             </div>
        </div>
      </div>

      {/* ÁREA DE JUEGO */}
      <div className="flex-1 w-full h-full relative">
        <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.1}
            maxScale={40}
            centerOnInit={true}
            wheel={{ step: 0.2 }}
            doubleClick={{ disabled: true }}
            limitToBounds={false} 
        >
            {({ zoomIn, zoomOut, centerView }) => (
            <>
                <div className="hidden md:flex absolute bottom-32 right-6 flex-col gap-2 z-40">
                    <button onClick={() => zoomIn()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xl">+</button>
                    <button onClick={() => zoomOut()} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xl">-</button>
                    <button onClick={() => centerView(window.innerWidth > 768 ? 1 : 0.4)} className="bg-white text-black w-10 h-10 rounded-full shadow-lg font-bold hover:bg-gray-100 text-xs">↺</button>
                </div>

                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                    <div 
                        className="relative bg-white shadow-2xl origin-center shrink-0"
                        style={{ width: `${BASE_SIZE}px`, height: `${BASE_SIZE}px` }}
                        onMouseLeave={() => setHoverPos(null)}
                    >
                        <canvas
                            ref={canvasRef}
                            width={GRID_SIZE}
                            height={GRID_SIZE}
                            className={`w-full h-full ${ammo <= 0 ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                            style={{ imageRendering: 'pixelated' }}
                            onMouseMove={handleMouseMove}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onTouchStart={(e) => handleMouseDown(e.touches[0])}
                            onTouchEnd={(e) => handleMouseUp(e.changedTouches[0])}
                        />
                        {/* Cursor Fantasma */}
                        {hoverPos && (
                            <div 
                                className="absolute pointer-events-none border-2 border-white/90 shadow-sm z-10 mix-blend-difference"
                                style={{
                                    width: `${BASE_SIZE / GRID_SIZE}px`,
                                    height: `${BASE_SIZE / GRID_SIZE}px`,
                                    left: `${(hoverPos.x * (BASE_SIZE / GRID_SIZE))}px`,
                                    top: `${(hoverPos.y * (BASE_SIZE / GRID_SIZE))}px`,
                                    backgroundColor: ammo <= 0 ? 'transparent' : selectedColor,
                                    borderColor: ammo <= 0 ? 'red' : 'white',
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

      {/* PALETA DE COLORES */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 p-3 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:absolute md:bottom-8 md:w-auto md:left-1/2 md:right-auto md:-translate-x-1/2 md:rounded-2xl md:border md:pb-3">
        <p className="text-xs text-gray-400 text-center mb-2 font-mono uppercase tracking-widest">
            {loading ? 'Pintando...' : (ammo > 0 ? 'Selecciona Color' : 'Recargando...')}
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