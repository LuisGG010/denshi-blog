import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto pt-10 px-4">
      
      {/* --- SECCIÓN HERO (FOTO + BIO) --- */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
        
        {/* FOTO DE PERFIL */}
        <div className="shrink-0 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          {/* TRUCO: Si no tienes foto aún, usa este link de placeholder. 
             Cuando tengas tu foto, guárdala en 'public/yo.jpg' y cambia el src a "/yo.jpg"
          */}
          <img 
            src="https://cdn.discordapp.com/attachments/1466758148000973108/1466758533658706112/Denshi_sin-mas.png?ex=697de8d5&is=697c9755&hm=46cff20e0c97a390f818ab8181e6ce88dd216f1ccd5f18404d9bb342769c1e8d&" 
            alt="Foto de perfil" 
            className="relative w-48 h-48 rounded-full border-4 border-black object-cover bg-gray-800"
          />
        </div>

        {/* TEXTO DE BIENVENIDA */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hola, soy <span className="text-blue-500">Denshi</span> 👋
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Desarrollador en proceso, amante de la tecnología y explorador digital. 
            Este blog es mi rincón personal para documentar mi viaje aprendiendo 
            Next.js, Supabase y todo lo que rompo en el camino.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Link href="/social" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition">
              Contáctame
            </Link>
            <Link href="/blog" className="border border-gray-600 hover:border-white text-gray-300 hover:text-white px-6 py-2 rounded-full transition">
              Leer mis posts
            </Link>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN TECH STACK (HABILIDADES) --- */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-purple-500 pl-4">
          🛠️ Mi Arsenal Tecnológico
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tarjeta de Skill */}
          <SkillCard icon="⚛️" name="React / Next.js" level="Aprendiendo" color="border-blue-500" />
          <SkillCard icon="🔥" name="Supabase" level="Explorando" color="border-green-500" />
          <SkillCard icon="🎨" name="Tailwind CSS" level="Me defiendo" color="border-cyan-500" />
          <SkillCard icon="🐍" name="Python" level="Favorito" color="border-yellow-500" />
        </div>
      </div>

      {/* --- SECCIÓN HISTORIA / TIMELINE --- */}
      <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">🚀 Mi Historia</h2>
        <div className="space-y-6 border-l-2 border-gray-700 pl-6 ml-2">
          
          <TimelineItem 
            date="2026 - Presente" 
            title="Creando Denshi Blog" 
            desc="Decidí construir mi propia plataforma desde cero para no depender de nadie." 
          />
          
          <TimelineItem 
            date="2025" 
            title="Descubriendo el Código" 
            desc="Mis primeros pasos con Python y scripts básicos. El inicio de todo." 
          />
          
        </div>
      </div>

    </div>
  );
}

// --- COMPONENTES PEQUEÑOS PARA ORDENAR EL CÓDIGO ---

function SkillCard({ icon, name, level, color }) {
  return (
    <div className={`bg-black p-4 rounded-xl border ${color} hover:bg-gray-900 transition flex items-center gap-3`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-bold text-white text-sm">{name}</h3>
        <p className="text-xs text-gray-500">{level}</p>
      </div>
    </div>
  );
}

function TimelineItem({ date, title, desc }) {
  return (
    <div className="relative">
      <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-black"></span>
      <span className="text-sm text-blue-400 font-mono mb-1 block">{date}</span>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}