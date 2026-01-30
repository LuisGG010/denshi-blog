'use client'

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

// LISTA DE CANCIONES (Puedes poner links de MP3 o archivos en tu carpeta public)
const PLAYLIST = [
  { title: "Lofi Chill", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { title: "Cyberpunk Vibe", url: "https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3" },
  { title: "Piano Dream", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_24840eb357.mp3" }
];

export default function Sidebar() {
  const pathname = usePathname(); // Para saber en qué página estás
  
  // --- ESTADO DE MÚSICA ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);

  // --- ESTADO DE STATS ---
  const [postCount, setPostCount] = useState(0);

  // 1. CARGAR STATS
  useEffect(() => {
    const fetchStats = async () => {
      // Contamos los posts en Supabase
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      setPostCount(count || 0);
    };
    fetchStats();
  }, []);

  // 2. CONTROL DE MÚSICA
  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const changeSong = (next) => {
    let newIndex = next ? currentSongIndex + 1 : currentSongIndex - 1;
    if (newIndex >= PLAYLIST.length) newIndex = 0;
    if (newIndex < 0) newIndex = PLAYLIST.length - 1;
    
    setCurrentSongIndex(newIndex);
    setIsPlaying(true); // Auto-play al cambiar
    // Pequeño timeout para dar tiempo a cargar la nueva URL
    setTimeout(() => audioRef.current.play(), 100);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  // Clases para links activos
  const linkClass = (path) => 
    `block py-2 px-4 rounded transition mb-1 ${pathname === path ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-black border-r border-gray-800 flex flex-col justify-between z-50">
      
      {/* --- ZONA SUPERIOR: LOGO Y MENÚ --- */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-8 tracking-wider">DENSHI BLOG</h1>
        
        <nav>
          <Link href="/" className={linkClass('/')}>🏠 Inicio</Link>
          <Link href="/blog" className={linkClass('/blog')}>📝 Blog & Posts</Link>
          <Link href="/social" className={linkClass('/social')}>🌐 Redes Sociales</Link>
          <Link href="/sobre-mi" className={linkClass('/about')}>😎 Sobre Mí</Link>
          {/* El admin solo tú sabes el link, pero puedes ponerlo si quieres */}
          <Link href="/admin" className={linkClass('/admin')}>🔒 Admin</Link>
        </nav>
      </div>

      {/* --- ZONA MEDIA: STATS --- */}
      <div className="px-6 py-4 border-t border-b border-gray-800 bg-gray-900/30">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Estadísticas</h3>
        
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Posts Totales:</span>
          <span className="text-blue-400 font-mono">{postCount}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Vistas:</span>
          <span className="text-green-400 font-mono">1.2k</span> {/* Hardcodeado por ahora */}
        </div>
        
        <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-800">
          Creado desde: 28-Ene-2026
        </div>
      </div>

      {/* --- ZONA INFERIOR: PLAYER DE MÚSICA --- */}
      <div className="p-6 bg-gray-900 border-t border-blue-900/30">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-400 font-bold truncate w-32">
                🎵 {PLAYLIST[currentSongIndex].title}
            </span>
            <div className="flex gap-2">
                <button onClick={() => changeSong(false)} className="text-gray-400 hover:text-white">⏮</button>
                <button onClick={togglePlay} className="text-white hover:text-blue-400">
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={() => changeSong(true)} className="text-gray-400 hover:text-white">⏭</button>
            </div>
        </div>

        {/* Barra de Volumen */}
        <input 
            type="range" min="0" max="1" step="0.1" 
            value={volume} onChange={handleVolume}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        {/* Elemento de audio invisible */}
        <audio 
            ref={audioRef} 
            src={PLAYLIST[currentSongIndex].url} 
            onEnded={() => changeSong(true)} // Auto siguiente canción
        />
      </div>

    </aside>
  );
}