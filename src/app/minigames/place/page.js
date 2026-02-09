'use client'

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const GRID_SIZE = 250; 
const BASE_SIZE = 1000;

const PALETTE = [
  { hex: '#6E0000', name: 'Rojo Sangre' },
  { hex: '#ad2e00', name: 'Rojo Marrón' },
  { hex: '#FF4500', name: 'Rojo Naranja' },
  { hex: '#FFA800', name: 'Naranja' },
  { hex: '#ffd900', name: 'Amarillo' },
  { hex: '#006842', name: 'Verde Esmeralda' },
  { hex: '#00A368', name: 'Verde Bosque' },
  { hex: '#7EED56', name: 'Verde Lima' },
  { hex: '#9bffc1', name: 'Verde Menta' },
  { hex: '#51E9F4', name: 'Cian' },
  { hex: '#3690EA', name: 'Azul Cielo' },
  { hex: '#2450A4', name: 'Azul Real' },
  { hex: '#2D4150', name: 'Azul Pizarra' },
  { hex: '#4e1161', name: 'Púrpura oscuro' },
  { hex: '#811E9F', name: 'Púrpura' },
  { hex: '#B44AC0', name: 'Lavanda' },
  { hex: '#f174ff', name: 'Morado pastel' },
  { hex: '#ffb2bf', name: 'Rosa Pastel' },
  { hex: '#ff78b7', name: 'Rosa' },
  { hex: '#ff37b2', name: 'Rosa Fucsia' },
  { hex: '#ff1878', name: 'Magenta' },
  { hex: '#F5F0DC', name: 'Piel Crema' },
  { hex: '#ffcea2', name: 'Piel Pastel' },
  { hex: '#ffaa5f', name: 'Piel naranja' },
  { hex: '#9C6926', name: 'Marrón' },
  { hex: '#5c3e16', name: 'Café Oscuro' },
  { hex: '#000000', name: 'Negro' },
  { hex: '#232323', name: 'Gris Carbón' },
  { hex: '#474747', name: 'Gris Oscuro' },
  { hex: '#898D90', name: 'Gris' },
  { hex: '#D4D7D9', name: 'Gris Claro' },
  { hex: '#FFFFFF', name: 'Blanco' }
];

export default function PlaceGame() {
  const [pixels, setPixels] = useState({});
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]); 
  const [loading, setLoading] = useState(false);
  const [ammo, setAmmo] = useState(3);
  const [nextRefillTime, setNextRefillTime] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const canvasRef = useRef(null);
  const transformRef = useRef(null);
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

  // 2. LÓGICA DE RECARGA
  useEffect(() => {
    if (ammo >= 3) { setSecondsLeft(0); return; }
    const interval = setInterval(() => {
        if (!nextRefillTime) return;
        const now = new Date().getTime();
        const target = new Date(nextRefillTime).getTime();
        const diff = Math.ceil((target - now) / 1000);
        if (diff <= 0) {
            setAmmo(prev => Math.min(3, prev + 1));
            setNextRefillTime(ammo < 2 ? new Date(now + 30000).toISOString() : null);
        } else { setSecondsLeft(diff); }
    }, 1000);
    return () => clearInterval(interval);
  }, [ammo, nextRefillTime]);

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

  // 4. PINTAR
  const paintPixel = async (x, y) => {
    if (ammo <= 0 || loading) return;
    setAmmo(prev => prev - 1);
    setLoading(true);
    const res = await fetch('/api/place/paint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, color: selectedColor.hex })
    });
    const data = await res.json();
    if (res.ok) {
        setAmmo(data.balance);
        if (data.nextRefill) setNextRefillTime(data.nextRefill);
    } else {
        if (data.balance !== undefined) setAmmo(data.balance);
    }
    setLoading(false);
  };

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (GRID_SIZE / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (GRID_SIZE / rect.height));
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) setHoverPos({ x, y });
    else setHoverPos(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#d9d4d7] touch-none overflow-hidden select-none">
      
      {/* COORDENADAS */}
      <div className="fixed top-16 right-2 z-40 pointer-events-none">
        {hoverPos && (
          <div className="bg-black/60 backdrop-blur text-white px-2 py-1 rounded-md text-[10px] font-mono shadow-sm flex flex-col items-end">
            <span>x:{hoverPos.x} y:{hoverPos.y}</span>
            {pixels[`${hoverPos.x}-${hoverPos.y}`] && (
              <span className="text-gray-300">
                {PALETTE.find(c => c.hex === pixels[`${hoverPos.x}-${hoverPos.y}`])?.name || ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* HEADER */}
      <div className="absolute top-2 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg pointer-events-auto border border-gray-200 flex items-center gap-3 scale-90 sm:scale-100 origin-top">
             <h1 className="text-lg font-black text-gray-800 tracking-tighter hidden sm:block">d/place</h1>
             <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="relative flex items-center justify-center">
                          <div className={`w-3 h-6 rounded border-2 transition-all ${i <= ammo ? 'bg-blue-500 border-blue-600' : 'bg-gray-200 border-gray-300'}`} />
                          {i <= ammo && <div className="absolute w-1 h-1 bg-white rounded-full opacity-60" />}
                        </div>
                    ))}
                </div>
                {ammo < 3 && (
                    <span className="text-xs font-bold text-blue-600 w-8 text-right tabular-nums">
                        {secondsLeft}s
                    </span>
                )}
             </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        <TransformWrapper ref={transformRef} minScale={0.1} maxScale={40} centerOnInit={true} limitToBounds={false}>
            {/* 🕹️ CONTROLES DE ZOOM RESTAURADOS */}
            {({ zoomIn, zoomOut, centerView }) => (
            <>
                {/* Botones verticales a la derecha, subidos un poco para no tapar la paleta doble */}
                <div className="absolute bottom-40 right-4 flex flex-col gap-2 z-50">
                    <button onClick={() => zoomIn()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 font-bold text-gray-700 active:bg-gray-100 transition-colors text-xl flex items-center justify-center">+</button>
                    <button onClick={() => zoomOut()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 font-bold text-gray-700 active:bg-gray-100 transition-colors text-xl flex items-center justify-center">-</button>
                    <button onClick={() => centerView(1)} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 font-bold text-xs text-gray-500 active:bg-gray-100 transition-colors flex items-center justify-center">1:1</button>
                </div>

                <TransformComponent wrapperStyle={{ width: "100vw", height: "100vh" }}>
                    <div className="relative bg-white shadow-2xl" style={{ width: `${BASE_SIZE}px`, height: `${BASE_SIZE}px` }}>
                        <canvas
                            ref={canvasRef}
                            width={GRID_SIZE}
                            height={GRID_SIZE}
                            className={`w-full h-full ${ammo <= 0 ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                            style={{ imageRendering: 'pixelated' }}
                            onMouseMove={handleMouseMove}
                            onMouseDown={(e) => { dragStartPos.current = { x: e.clientX, y: e.clientY }; }}
                            onMouseUp={(e) => {
                            const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
                            if (dist < 10 && hoverPos) paintPixel(hoverPos.x, hoverPos.y);
                            }}
                        />
                        {/* CURSOR SELECCIÓN (Estilo Fino) */}
                        {hoverPos && (
                            <div 
                                className="absolute pointer-events-none z-10"
                                style={{
                                    width: `${BASE_SIZE / GRID_SIZE}px`,
                                    height: `${BASE_SIZE / GRID_SIZE}px`,
                                    left: `${hoverPos.x * (BASE_SIZE / GRID_SIZE)}px`,
                                    top: `${hoverPos.y * (BASE_SIZE / GRID_SIZE)}px`,
                                    backgroundColor: ammo <= 0 ? 'transparent' : selectedColor.hex,
                                    border: '1px solid white',
                                    outline: '1px solid black',
                                    opacity: 0.8
                                }}
                            />
                        )}
                    </div>
                </TransformComponent>
            </>
            )}
        </TransformWrapper>
      </div>

      {/* PALETA DOCK DE 2 FILAS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[95%] sm:w-auto">
        <div className="bg-black/4 backdrop-blur-md border border-gray-200/50 p-3 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor.hex }}></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
               {loading ? 'Pintando...' : selectedColor.name}
             </span>
          </div>
          
          {/* GRID para 2 FILAS */}
          {/* PALETA: Grid con scroll en móvil, Flex wrap en PC */}
          <div className="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto w-full px-1 no-scrollbar md:flex md:flex-wrap md:justify-center md:gap-3 md:overflow-visible">
              {PALETTE.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setSelectedColor(c)}
                  // Ajustamos tamaños: w-8 en móvil, w-10 en PC para mejor click
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full shadow-md border-2 shrink-0 transition-transform ${selectedColor.hex === c.hex ? 'border-gray-800 scale-110 shadow-md z-10' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}