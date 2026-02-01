'use client'

import Link from 'next/link';

export default function HomePage() {
  return (
    // CONTENEDOR PRINCIPAL
    <div className="relative min-h-screen text-white p-6 flex flex-col items-center justify-center font-sans">
      
      {/* --- 1. VIDEO DE FONDO (Tu código original mejorado) --- */}
      <video 
        src="https://i.imgur.com/6IIG8Is.mp4" 
        autoPlay 
        loop 
        muted 
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        onTimeUpdate={(e) => e.target.playbackRate = 0.6} 
      >
      </video>

      {/* CAPA OSCURA (Para que el texto se lea bien sobre el video) */}
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>


      {/* --- 2. EL CONTENIDO REAL (z-10 para flotar sobre el video) --- */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8">
        
        {/* ENCABEZADO (Tu Titulo) */}
        <header className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            Denshi Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Un rincón de internet donde publico tonterías, música e ideas.
            <br/>Siéntete libre de explorar.
          </p>
        </header>

        {/* --- 3. EL GRID BENTO (Aquí está tu dibujo) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[500px]">

          {/* CAJA 1: POSTS (Izquierda - Grande) */}
          {/* Ocupa 2 espacios a lo ancho (col-span-2) y 2 a lo alto (row-span-2) */}
          <Link 
            href="/blog"
            className="
              group relative md:col-span-2 md:row-span-2 
              bg-gray-900/50 border border-white/10 rounded-3xl p-8
              hover:bg-gray-900/80 hover:border-blue-500/50 hover:scale-[1.02]
              transition duration-500 backdrop-blur-md overflow-hidden flex flex-col justify-end
            "
          >
            {/* Imagen de fondo decorativa para Posts */}
            <img 
               src="https://images.unsplash.com/photo-1499750310159-5b5f38e31639?q=80&w=1000" 
               className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition duration-700 pointer-events-none"
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-2">📝 Posts</h2>
              <p className="text-gray-300">El diario de vida. Actualizaciones y caos.</p>
            </div>
          </Link>

          {/* CAJA 2: SOBRE MÍ (Derecha Arriba) */}
          <Link 
            href="/about"
            className="
              group relative md:col-span-1 
              bg-gray-900/50 border border-white/10 rounded-3xl p-6
              hover:bg-gray-900/80 hover:border-purple-500/50 hover:-translate-y-1
              transition duration-300 backdrop-blur-md flex flex-col justify-center items-center text-center
            "
          >
            <div className="text-5xl mb-2 group-hover:scale-110 transition">😎</div>
            <h3 className="text-2xl font-bold">Sobre Mí</h3>
          </Link>

          {/* CAJA 3: REDES (Derecha Abajo) */}
          <Link 
            href="/social"
            className="
              group relative md:col-span-1 
              bg-gray-900/50 border border-white/10 rounded-3xl p-6
              hover:bg-gray-900/80 hover:border-green-500/50 hover:-translate-y-1
              transition duration-300 backdrop-blur-md flex flex-col justify-center items-center text-center
            "
          >
            <div className="text-5xl mb-2 group-hover:rotate-12 transition">🌐</div>
            <h3 className="text-2xl font-bold">Redes</h3>
          </Link>

          {/* CAJA 4: MINIJUEGOS (Abajo del todo - Ancho completo) */}
          {/* Ocupa las 3 columnas (col-span-3) */}
          <div 
            className="
              group relative md:col-span-3 h-24
              bg-gray-900/50 border border-white/10 rounded-3xl p-6
              hover:bg-gray-900/80 hover:border-yellow-500/50 
              transition duration-300 backdrop-blur-md flex items-center justify-between cursor-pointer
            "
          >
             <div className="flex items-center md:flex gap-4">
                <span className="text-4xl">🎮</span>
                <h3 className="text-2xl font-bold">Minijuegos</h3>
             </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}