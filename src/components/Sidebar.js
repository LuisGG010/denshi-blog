'use client'

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

// LISTA DE CANCIONES (Tus links de Discord)
const PLAYLIST = [
  { title: "Castle Funk (DELTARUNE Chapter 3+4 Soundtrack) - Toby Fox", url: "https://cdn.discordapp.com/attachments/1466767907722625211/1466767976840564888/43._Castle_Funk_DELTARUNE_Chapter_34_Soundtrack_-_Toby_Fox.mp3?ex=697df1a0&is=697ca020&hm=ff14a76a0ad8b24dee211daec780f0cb248e463a36b295896d61875e06c3c722&" },
  { title: "My Castle Town (DELTARUNE Chapter 2 Soundtrack) - Toby Fox", url: "https://cdn.discordapp.com/attachments/1466767907722625211/1466771705614827530/3._My_Castle_Town_DELTARUNE_Chapter_2_Soundtrack_-_Toby_Fox.mp3?ex=697df519&is=697ca399&hm=cfb2aa91325b9d93fd4e70d4dc5ef3773b26d3719f2234bfc774c07ae33aa6ba&" },
  { title: "Neon Mixtape Tour - Choose Your Seeds (PvZ2)", url: "https://cdn.discordapp.com/attachments/1466767907722625211/1466772362161688608/Plants_Vs_Zombies_2_Music_Neon_Mixtape_Tour_Choose_Your_Seeds_Extended_HD.mp3?ex=697df5b6&is=697ca436&hm=df29d7e3778009f5a68fa3222a55fef27c54102c8eae8d5bb474f181fde3244d&" }
];

// Función auxiliar para formatear tiempo
const formatTime = (time) => {
  if (!Number.isFinite(time) || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function Sidebar() {
  const pathname = usePathname();
  
  // --- ESTADOS ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false); // Estado del bucle
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [postCount, setPostCount] = useState(0);

  // 1. CARGAR STATS
  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      setPostCount(count || 0);
    };
    fetchStats();
  }, []);

  // 2. CONTROL DE MÚSICA
  const togglePlay = () => {
    if(!audioRef.current) return;
    
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(e => console.error(e));
    
    setIsPlaying(!isPlaying);
  };

  const changeSong = (next) => {
    let newIndex = next ? currentSongIndex + 1 : currentSongIndex - 1;
    if (newIndex >= PLAYLIST.length) newIndex = 0;
    if (newIndex < 0) newIndex = PLAYLIST.length - 1;
    
    setCurrentSongIndex(newIndex);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    
    setTimeout(() => {
        if(audioRef.current) audioRef.current.play().catch(e => console.error(e));
    }, 100);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
        audioRef.current.currentTime = newTime;
    }
  };

  const onTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
    if (Number.isFinite(e.target.duration)) setDuration(e.target.duration);
  };

  const onLoadedMetadata = (e) => {
    if (Number.isFinite(e.target.duration)) setDuration(e.target.duration);
  };

  const linkClass = (path) => 
    `block py-2 px-4 rounded transition mb-1 ${pathname === path ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`;

  // Cálculo seguro del máximo del slider
  const sliderMax = (Number.isFinite(duration) && duration > 0) ? duration : 0;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-black border-r border-gray-800 flex flex-col justify-between z-50">
      
      {/* --- ZONA SUPERIOR --- */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-8 tracking-wider">DENSHI BLOG</h1>
        <nav>
          <Link href="/" className={linkClass('/')}>🏠 Inicio</Link>
          <Link href="/blog" className={linkClass('/blog')}>📝 Blog & Posts</Link>
          <Link href="/social" className={linkClass('/social')}>🌐 Redes Sociales</Link>
          <Link href="/about" className={linkClass('/about')}>😎 Sobre Mí</Link>
          <Link href="/admin" className={linkClass('/admin')}>🔒 Admin</Link>
        </nav>
      </div>

      {/* --- ZONA MEDIA --- */}
      <div className="px-6 py-4 border-t border-b border-gray-800 bg-gray-900/30">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Estadísticas</h3>
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Posts Totales:</span>
          <span className="text-blue-400 font-mono">{postCount}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Vistas:</span>
          <span className="text-green-400 font-mono">---</span>
        </div>
        <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-800">
          Creado desde: 28-Ene-2026
        </div>
      </div>

      {/* --- ZONA INFERIOR: PLAYER DE MÚSICA --- */}
      <div className="p-6 bg-gray-900 border-t border-blue-900/30">
        
        {/* TÍTULO ANIMADO (Requiere globals.css) */}
        <div className="mb-3 overflow-hidden w-full relative group"> 
          <div className="animate-marquee whitespace-nowrap">
             {/* Texto 1 */}
            <span className="text-xs text-blue-400 font-bold mr-8">
              🎵 {PLAYLIST[currentSongIndex]?.title || "Cargando..."}
            </span>
             {/* Texto 2 (Copia) */}
            <span className="text-xs text-blue-400 font-bold mr-8">
              🎵 {PLAYLIST[currentSongIndex]?.title || "Cargando..."}
            </span>
          </div>
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="mb-2">
            <input 
                type="range" 
                min="0" 
                max={sliderMax} 
                value={currentTime} 
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                disabled={!Number.isFinite(duration) || duration === 0}
            />
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>

        {/* CONTROLES */}
        <div className="flex items-center justify-between mb-3">
            <div className="flex gap-4 mx-auto items-center">
                
                {/* BOTÓN LOOP */}
                <button 
                  onClick={() => setIsLooping(!isLooping)}
                  className={`text-xs p-1 rounded transition ${isLooping ? 'text-blue-400 font-bold bg-blue-900/60' : 'text-gray-600 hover:text-white'}`}
                  title="Repetir canción"
                >
                  🔁
                </button>

                <button onClick={() => changeSong(false)} className="text-gray-400 hover:text-white">⏮</button>
                
                <button onClick={togglePlay} className="text-white hover:text-blue-400 text-lg mx-1">
                    {isPlaying ? '⏸' : '▶'}
                </button>
                
                <button onClick={() => changeSong(true)} className="text-gray-400 hover:text-white">⏭</button>
            </div>
        </div>

        {/* VOLUMEN */}
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">🔊</span>
            <input 
                type="range" min="0" max="1" step="0.1" 
                value={volume} onChange={handleVolume}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>

        {/* ELEMENTO AUDIO (CORREGIDO) */}
        <audio 
            ref={audioRef} 
            src={PLAYLIST[currentSongIndex]?.url}
            loop={isLooping} // <--- AQUÍ ESTÁ LA MAGIA QUE FALTABA
            onEnded={() => {
                // Si NO está en bucle, pasa a la siguiente.
                // Si SÍ está en bucle, el navegador la repite solo gracias a loop={true}
                if (!isLooping) changeSong(true);
            }} 
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onError={(e) => console.error("Error audio:", e)}
        />
      </div>

    </aside>
  );
}