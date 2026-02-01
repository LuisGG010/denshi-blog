import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
      
      {/* 1. EL NÚMERO GIGANTE CON EFECTO DE ERROR */}
      <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-t from-blue-900 to-gray-500 leading-none select-none animate-pulse">
        404
      </h1>

      {/* 2. MENSAJE DE SISTEMA */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-widest uppercase">
        ⚠️ Señal Perdida
      </h2>
      
      <p className="text-gray-500 mb-8 font-mono">
        La ruta que intentas explorar no existe en este servidor.
      </p>

      {/* 3. SIMULACIÓN DE TERMINAL DE ERROR */}
      <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg max-w-md w-full text-left font-mono text-sm mb-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <p className="text-red-400">Error: PAGE_NOT_FOUND</p>
        <p className="text-gray-400">at System.Navigation (routes.js:404)</p>
        <p className="text-gray-400">at User.Input (keyboard:0)</p>
        <p className="text-blue-400 mt-2 animate-pulse">console.r("Bueno, parece que estás perdido, o ¿eso es lo que pensabas?, bueno, no está mal que intentes buscar una pagina aleatoria, ya sea por un error o cualquier cosa... pero qué tal si... ¿estás buscando algo?, tal vez estés en el sitio equivocado, o tal vez es el correcto, solo tu puedes saberlo..")</p>
      </div>

      {/* 4. BOTÓN DE REGRESO */}
      <Link 
        href="/"
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition duration-300 shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center gap-2"
      >
        <span>🏠</span>
        <span>Volver a la Base</span>
      </Link>

    </div>
  );
}