'use client'
import Link from 'next/link';

export default function MinigamesPage() {
  return (
    <div className='min-h-screen bg-black/40'>
      <div className="max-w-4xl mx-auto pt-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4 text-yellow-400 drop-shadow-lg">Zona Arcade 🕹️</h1>
        <p className="text-gray-400 mb-12 text-xl">Para cuando te aburras de leer mis tonterías.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* JUEGO 1: CLICKER */}
          <Link href="/minigames/clicker" className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700 p-8 rounded-3xl hover:bg-gray-800 hover:border-yellow-500 transition shadow-lg hover:scale-105 hover:shadow-yellow-500/20">
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition">⚡</div>
            <h2 className="text-3xl font-bold text-white mb-2">Speed Clicker</h2>
            <p className="text-gray-400">Un juego clicker de toda la vida, para vicio.</p>
          </Link>

          {/* JUEGO 2: PRÓXIMAMENTE */}
          <div className="opacity-60 border border-gray-800 p-8 rounded-3xl border-dashed flex flex-col items-center justify-center bg-black/20 cursor-not-allowed">
            <div className="text-6xl mb-4 grayscale">❓</div>
            <h2 className="text-2xl font-bold text-gray-500 mb-2">Próximamente</h2>
            <p className="text-gray-600">Se intentará agregar más minijuegos</p>
          </div>

        </div>
      </div>
    </div>
  );
}