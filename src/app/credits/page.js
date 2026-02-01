export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      
      {/* 1. LA TARJETA MAESTRA */}
      <div className="relative w-full max-w-xl bg-gray-900 rounded-3xl overflow-visible border border-gray-800 shadow-2xl mt-20">
        
        {/* 2. LA PORTADA (Cover Image) - Altura Fija h-64 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop" 
          alt="Portada"
          className="w-full h-64 object-cover rounded-t-3xl opacity-80"
        />

        {/* 3. LA FOTO DE PERFIL (Avatar) - CORREGIDO ✅ */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs9U0v7xQRju4V_DsntYoCpwZV_V6VaBcruA&s" 
          alt="Avatar"
          className="
            absolute 
            top-48
            left-1/2
            -translate-x-1/2
            w-32 h-32 
            rounded-full 
            border-4 border-black 
            bg-gray-800
            shadow-xl
            z-10
          "
        />
        {/* EXPLICACIÓN:
            top-48: La portada mide 64. Queremos que la foto suba un poco. 
            64 (portada) - 16 (mitad de foto) = 48. ¡Ahí se queda clavada!
        */}

        {/* 4. INFORMACIÓN (Texto) */}
        {/* Usamos 'pt-20' para que el texto baje y deje espacio a la foto de arriba */}
        <div className="px-8 pb-8 pt-20 text-center relative z-0">
          
          {/* ENCABEZADO: Nombre y Botón */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Bloque del Nombre */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white">Denshi Blog</h1>
              <p className="text-blue-400 font-mono text-sm">@denshi_dev</p>
            </div>
            
            {/* Botón */}
            <button className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition shadow-lg hover:scale-105 whitespace-nowrap">
              Seguir
            </button>
          </div>

          {/* DESCRIPCIÓN */}
          <p className="text-gray-400 mt-6 leading-relaxed text-center md:text-left">
            Desarrollador web, amante de la música y arquitecto de este sitio. 
            Probando cosas nuevas en Next.js y rompiendo el código 
            para aprender a arreglarlo. 🛠️
          </p>

          {/* ESTADÍSTICAS */}
          <div className="flex justify-center md:justify-start gap-8 mt-8 pt-6 border-t border-gray-800">
            <div className="text-center">
              <span className="block font-bold text-white text-xl">15</span>
              <span className="text-xs text-gray-500 uppercase">Posts</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-white text-xl">1.2k</span>
              <span className="text-xs text-gray-500 uppercase">Vistas</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-white text-xl">3</span>
              <span className="text-xs text-gray-500 uppercase">Proyectos</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}