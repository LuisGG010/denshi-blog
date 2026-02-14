'use client'

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Turnstile } from '@marsidev/react-turnstile';

const GRID_SIZE = 250; 
const BASE_SIZE = 1000;

const PALETTE = [
  { hex: '#6E0000', name: 'Rojo Sangre' }, { hex: '#ad2e00', name: 'Rojo Marrón' },
  { hex: '#ff0000', name: 'Rojo' }, { hex: '#FF4500', name: 'Rojo Naranja' },
  { hex: '#FFA800', name: 'Naranja' }, { hex: '#FFB000', name: 'Oro Viejo' },
  { hex: '#ffd900', name: 'Amarillo' }, { hex: '#3E442C', name: 'Verde Oliva' },
  { hex: '#1F5B4D', name: 'Verde Menta Oscuro' }, { hex: '#006842', name: 'Verde Esmeralda' },
  { hex: '#00A368', name: 'Verde Bosque' }, { hex: '#7EED56', name: 'Verde Lima' },
  { hex: '#9bffc1', name: 'Verde Menta' }, { hex: '#51E9F4', name: 'Cian' },
  { hex: '#3690EA', name: 'Azul Cielo' }, { hex: '#3a3aff', name: 'Azul Aqua' },
  { hex: '#0000ff', name: 'Azul' }, { hex: '#2450A4', name: 'Azul Real' },
  { hex: '#2D4150', name: 'Azul Pizarra' }, { hex: '#0F1B33', name: 'Azul Profundo' },
  { hex: '#3B2147', name: 'Violeta Profundo' }, { hex: '#4e1161', name: 'Púrpura oscuro' },
  { hex: '#811E9F', name: 'Púrpura' }, { hex: '#B44AC0', name: 'Lavanda' },
  { hex: '#f174ff', name: 'Morado pastel' }, { hex: '#ffb2bf', name: 'Rosa Pastel' },
  { hex: '#c58e97', name: 'Rosa marron' }, { hex: '#B8697F', name: 'Rosa Malva' },
  { hex: '#ff78b7', name: 'Rosa' }, { hex: '#ff37b2', name: 'Rosa Fucsia' },
  { hex: '#ff1878', name: 'Magenta' }, { hex: '#EEE6DE', name: 'Blanco Hueso' },
  { hex: '#F5F0DC', name: 'Blanco Crema' }, { hex: '#EEC6B4', name: 'Rosa Albaricoque' },
  { hex: '#ffcea2', name: 'Piel Pastel' }, { hex: '#ffaa5f', name: 'Piel naranja' },
  { hex: '#9C6926', name: 'Marrón' }, { hex: '#5c3e16', name: 'Café Oscuro' },
  { hex: '#703314', name: 'Marrón Rojizo' }, { hex: '#A44A3F', name: 'Terracota' },
  { hex: '#000000', name: 'Negro' }, { hex: '#232323', name: 'Gris Carbón' },
  { hex: '#474747', name: 'Gris Oscuro' }, { hex: '#898D90', name: 'Gris' },
  { hex: '#D4D7D9', name: 'Gris Claro' }, { hex: '#FFFFFF', name: 'Blanco' }
];

export default function PlaceGame() {
  const [pixels, setPixels] = useState({});
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]); 
  const [loading, setLoading] = useState(false);
  
  // 👇 NUEVO ESTADO PARA EL MENÚ DE COLORES
  const [showPalette, setShowPalette] = useState(false);

  // Estados del juego
  const [ammo, setAmmo] = useState(3);
  const [maxAmmo, setMaxAmmo] = useState(3);
  const [prestigeLevel, setPrestigeLevel] = useState(0);

  const [nextRefillTime, setNextRefillTime] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const canvasRef = useRef(null);
  const transformRef = useRef(null);
  const [hoverPos, setHoverPos] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 🛡️ ESTADO DE VERIFICACIÓN
  const [isVerified, setIsVerified] = useState(false); 

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

    const fetchUserStatus = async () => {
      try {
        const res = await fetch('/api/place/sync');
        const data = await res.json();

        setAmmo(data.ammo);
        setMaxAmmo(data.maxAmmo || 3);
        setPrestigeLevel(data.level || 0);
        if(data.nextRefill) setNextRefillTime(data.nextRefill);
        if (data.isVerified) setIsVerified(true);

      } catch (error){ console.error("Error sync:", error) }
    }

    fetchCanvas();
    fetchUserStatus();

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

  // 2. RELOJ DE RECARGA
  useEffect(() => {
    if (ammo >= maxAmmo) { setSecondsLeft(0); return; }
    const interval = setInterval(() => {
        if (!nextRefillTime) return;
        const now = new Date().getTime();
        const target = new Date(nextRefillTime).getTime();
        const diff = Math.ceil((target - now) / 1000);
        if (diff <= 0) {
            setAmmo(prev => Math.min(maxAmmo, prev + 1));
            setNextRefillTime(ammo < (maxAmmo-1) ? new Date(now + 30000).toISOString() : null);
        } else { setSecondsLeft(diff); }
    }, 1000);
    return () => clearInterval(interval);
  }, [ammo, nextRefillTime, maxAmmo]);

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

  // 4. MANEJO DE CAPTCHA EXITOSO
  const handleCaptchaSuccess = async (token) => {
      try {
          const res = await fetch('/api/auth/captcha', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
          });
          
          if (res.ok) setIsVerified(true);
          else alert("Error verificando. Intenta de nuevo.");
      } catch (e) { console.error(e); }
  };

  // 5. PINTAR
  const paintPixel = async (x, y) => {
    if (ammo <= 0 || loading) return;

    setAmmo(prev => Math.max(0, prev - 1));
    setLoading(true);

    try {
        const res = await fetch('/api/place/paint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, y, color: selectedColor.hex })
        });
        
        const data = await res.json();

        if (res.ok) {
            setAmmo(data.balance);
            if (data.maxAmmo) setMaxAmmo(data.maxAmmo);
            if (data.nextRefill) setNextRefillTime(data.nextRefill);
        } else {
            if (res.status === 403) {
                setIsVerified(false); 
                alert("Tu sesión de seguridad expiró. Verifica de nuevo.");
            } else {
                if (data.balance !== undefined) setAmmo(data.balance);
                else setAmmo(prev => prev + 1);
            }
        }
    } catch (e) {
        console.error(e);
        setAmmo(prev => prev + 1);
    } finally {
        setLoading(false);
    }
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
        
        {/* PANTALLA DE BLOQUEO (SI NO ESTÁ VERIFICADO) */}
        {!isVerified && (
            <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-4 animate-in fade-in duration-300">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center max-w-sm w-full">
                    <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">🛡️ Seguridad</h2>
                    <p className="mb-6 text-gray-400 text-center text-sm">Verifica que eres humano para empezar a pintar.</p>
                    <Turnstile 
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        onSuccess={handleCaptchaSuccess}
                        options={{ theme: 'dark', size: 'normal' }}
                    />
                </div>
            </div>
        )}

      {/* HEADER */}
      <div className="absolute top-2 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg pointer-events-auto border border-gray-200 flex items-center gap-3 scale-90 sm:scale-100 origin-top">
             <h1 className="text-lg font-black text-gray-800 tracking-tighter hidden sm:block">
                 d/place <span className="text-xs font-normal text-purple-600"> NVL {prestigeLevel}</span>
             </h1>
             <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {Array.from({ length: maxAmmo }).map((_, i) => (
                        <div key={i} className="relative flex items-center justify-center">
                          <div className={`w-3 h-6 rounded border-2 transition-all ${i + 1 <= ammo ? 'bg-blue-500 border-blue-600' : 'bg-gray-200 border-gray-300'}`} />
                          {i + 1 <= ammo && <div className="absolute w-1 h-1 bg-white rounded-full opacity-60" />}
                        </div>
                    ))}
                </div>
                {ammo < maxAmmo && (
                    <span className="text-xs font-bold text-blue-600 w-8 text-right tabular-nums">{secondsLeft}s</span>
                )}
             </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        <TransformWrapper ref={transformRef} minScale={0.1} maxScale={40} centerOnInit={true} limitToBounds={false}>
            {({ zoomIn, zoomOut, centerView }) => (
            <>
                {/* Botones de Zoom */}
                <div className="absolute bottom-32 right-4 flex flex-col gap-2 z-40">
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

      {/* 👇 NUEVO MENÚ DE PALETA FLOTANTE (Mejorado para móvil) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-[95%] sm:w-auto">
        
        {/* MENÚ DESPLEGABLE (Se muestra solo si showPalette es true) */}
      {showPalette && (
          // 🎨 CAMBIO: Fondo negro semitransparente (bg-black/60) y borde sutil (border-white/10)
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2">
              
              <div className="flex items-center justify-between w-full mb-3 px-2">
                   {/* Texto del nombre del color en BLANCO */}
                   <span className="text-xs font-bold uppercase tracking-widest text-gray-200">
                      {loading ? 'Pintando...' : selectedColor.name}
                   </span>
                   {/* Botón cerrar en gris claro que pasa a blanco */}
                   <button onClick={() => setShowPalette(false)} className="text-gray-400 hover:text-white p-1 transition-colors">✕</button>
              </div>
              
              {/* Grid agrupado de colores */}
              <div className="flex flex-wrap justify-center gap-2 max-w-[320px] sm:max-w-[400px] max-h-[30vh] overflow-y-auto p-1 no-scrollbar">
                  {PALETTE.map(c => (
                      <button
                          key={c.hex}
                          onClick={() => { setSelectedColor(c); }}
                          // Ajustamos el borde activo para que resalte en el fondo oscuro
                          className={`w-9 h-9 rounded-full shadow-sm border-2 transition-all ${selectedColor.hex === c.hex ? 'border-white scale-110 z-10 ring-2 ring-white/50' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c.hex }}
                          aria-label={c.name}
                          title={c.name}
                      />
                  ))}
              </div>
          </div>
      )}

        {/* BOTÓN PRINCIPAL (TOGGLE) */}
        <button 
            onClick={() => setShowPalette(!showPalette)}
            // 🎨 CLASES DINÁMICAS:
            // Si está abierto (showPalette): Borde semitransparente + Efecto Blur
            // Si está cerrado: Borde blanco sólido (estilo bote de pintura)
            className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-transform active:scale-95 hover:scale-105 backdrop-blur-md 
                ${showPalette ? 'border-[6px] border-white/30' : 'border-[6px] border-gray-800/50'}`}
            style={{
                // 🖌️ ESTILOS:
                // Abierto: Negro al 60% de opacidad (Glass Dark)
                // Cerrado: El color que tengas seleccionado
                backgroundColor: showPalette ? 'rgba(0, 0, 0, 0.6)' : selectedColor.hex 
            }}
        >
            {showPalette ? (
                // La X ahora es blanca para resaltar en el fondo oscuro
                <span className="text-white font-black text-2xl">✕</span>
            ) : (
                // Indicador visual simple
                 <div className="absolute inset-0 rounded-full border border-black/10" />
            )}
        </button>
      </div>

    </div>
  );
}