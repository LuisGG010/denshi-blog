import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      
      <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
        Bienvenido a Denshi Blog
      </h1>
      
      <p className="text-xl text-gray-400 max-w-2xl mb-12">
        El rincón digital donde el código, la música y las ideas convergen.
        Explora las diferentes zonas de este espacio.
      </p>

      {/* Grid de Zonas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        
        <Link href="/blog" className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400">📝 Zona de Posts</h2>
          <p className="text-gray-500">Tutoriales, pensamientos y actualizaciones sobre mis proyectos.</p>
        </Link>

        <Link href="/sobre-mi" className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-green-500 transition">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400">😎 Zona Personal</h2>
          <p className="text-gray-500">Conoce quién está detrás del teclado y mi historia.</p>
        </Link>

        <Link href="/social" className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-pink-500 transition">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400">🌐 Zona Social</h2>
          <p className="text-gray-500">Mis redes y formas de contacto directo.</p>
        </Link>

        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 border-dashed">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">🚧 Zona en Construcción</h2>
          <p className="text-gray-600">Próximamente más herramientas y recursos.</p>
        </div>

      </div>
    </div>
  );
}