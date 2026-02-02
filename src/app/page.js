'use client'

import Link from 'next/link';

export default function HomePage() {
  return (
    // CONTENEDOR PRINCIPAL
    <div className="relative min-h-screen text-white p-6 flex flex-col items-center justify-center font-sans">
      
      {/* --- 1. VIDEO DE FONDO --- */}
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

      {/* CAPA OSCURA */}
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>

      {/* --- 2. EL CONTENIDO REAL --- */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8 pt-10 pb-10">
        
        {/* ENCABEZADO */}
        <header className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            Denshi Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Un rincón de internet donde publico tonterías, música e ideas.
            <br/>Siéntete libre de explorar.
          </p>
        </header>

        {/* --- 3. EL GRID BENTO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[700px]">

          {/* --- CAJA 1: POSTS (DISEÑO DIVIDIDO NUEVO) --- */}
          <Link 
            href="/blog"
            className="
              group relative 
              md:col-span-2 md:row-span-2 
              /* Layout Flex: Columna en móvil, Fila en PC */
              flex flex-col-reverse md:flex-row
              bg-gray-900 border border-white/10 rounded-3xl overflow-hidden
              hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
              transition duration-500
            "
          >
            {/* LADO IZQUIERDO: EL TEXTO (Sólido) */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-gray-900 z-10">
              <div className="group-hover:translate-x-2 transition duration-300">
                <h2 className="text-4xl font-bold mb-4 text-white">📝 Posts</h2>
                <p className="text-gray-400 leading-relaxed">
                  Aquí escribo mi diario de vida, actualizaciones del sitio y caos general. 
                  <br className="hidden md:block"/>
                  <span className="text-blue-400 text-sm font-bold mt-4 block">Leer lo último →</span>
                </p>
              </div>
            </div>

            {/* LADO DERECHO: LA IMAGEN */}
            <div className="w-full md:w-1/2 relative h-48 md:h-auto bg-blue-900/20">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src="https://slnxvatqszcksjvnjach.supabase.co/storage/v1/object/public/blog-media/denshi-posts.png" 
                 className="
                   absolute inset-0 w-full h-full 
                   object-cover object-center 
                   group-hover:scale-110 transition duration-700
                 "
                 alt="Denshi writing"
               />
               {/* Sombra interna para unir la imagen con el borde */}
               <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
            </div>
          </Link>


          {/* CAJA 2: SOBRE MÍ */}
          <Link 
            href="/about"
            className="
              group relative md:col-span-1 
              min-h-[200px] md:min-h-0
              bg-gray-900/50 border border-white/10 rounded-3xl p-6
              hover:bg-gray-900/80 hover:border-purple-500/50 hover:-translate-y-1
              transition duration-300 backdrop-blur-md flex flex-col justify-center items-center text-center
            "
          >
            <div className="text-5xl mb-2 group-hover:scale-110 transition">😎</div>
            <h3 className="text-2xl font-bold">Sobre Mí</h3>
          </Link>

          {/* CAJA 3: REDES */}
          <Link 
            href="/social"
            className="
              group relative md:col-span-1 
              min-h-[200px] md:min-h-0
              bg-gray-900/50 border border-white/10 rounded-3xl p-6
              hover:bg-gray-900/80 hover:border-green-500/50 hover:-translate-y-1
              transition duration-300 backdrop-blur-md flex flex-col justify-center items-center text-center
            "
          >
            <div className="text-5xl mb-2 group-hover:rotate-12 transition">🌐</div>
            <h3 className="text-2xl font-bold">Redes</h3>
          </Link>

          {/* CAJA 4: MINIJUEGOS */}
          <div 
            className="
              group relative md:col-span-3 h-24
              bg-gray-900/50 border border-white/10 rounded-3xl p-6
              hover:bg-gray-900/80 hover:border-yellow-500/50 
              transition duration-300 backdrop-blur-md flex items-center justify-between cursor-pointer
            "
          >
             <div className="flex items-center gap-4">
                <span className="text-4xl">🎮</span>
                <h3 className="text-2xl font-bold">Minijuegos</h3>
             </div>
             <span className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-yellow-400 hidden md:block">
                Próximamente
             </span>
          </div>

        </div>
        
      </div>
    </div>
  );
}