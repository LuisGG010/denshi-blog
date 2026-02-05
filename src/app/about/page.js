'use client'

import Link from 'next/link';

export default function AboutPage() {
  return (
    // 1. WRAPPER GENERAL (Sin límites de ancho para que el video cubra todo)
    <div className="min-h-screen bg-black/40"> 

      
      
      {/* --- CAPA CONTENIDO (z-10) --- */}
      {/* Aquí movemos las clases de layout (max-w-4xl, padding, etc) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-24 px-4 pb-20">
        
        {/* --- SECCIÓN HERO (FOTO + BIO) --- */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 mb-12 md:mb-16">
          
          {/* FOTO DE PERFIL */}
          <div className="shrink-0 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            {/* FOTO RESPONSIVA */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://slnxvatqszcksjvnjach.supabase.co/storage/v1/object/public/blog-media/Denshi_sin-mas.png" 
              alt="Foto de perfil" 
              className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-black object-cover bg-gray-800"
            />
          </div>

          {/* TEXTO DE BIENVENIDA */}
          <div className="text-center md:text-left w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hola, soy <span className="text-blue-500">Denshi</span>
            </h1>
            
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
              Soy un estudiante universitario de 23 años nacido el 24 de Octubre del 2002 en México. Curioso por naturaleza, me encanta explorar nuevas cosas y quiero compartir mis aprendizajes a través de este blog.
              <br className="hidden md:block" />
              <span className="block mt-2">
               Me encanta la programación, el arte digital, la música y los videojuegos. Espero que al menos esto sea de tu agrado.
              </span>
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/social" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition shadow-lg hover:scale-105 transform">
                Contáctame
              </Link>
              <Link href="/blog" className="border border-gray-600 hover:border-white text-gray-300 hover:text-white px-6 py-2 rounded-full transition hover:bg-white/5">
                Leer mis posts
              </Link>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN TECH STACK (HABILIDADES) --- */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-purple-500 pl-4">
            🛠️ Datos generales
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <SkillCard icon="🎮" name="Gamer" level="Favorito" color="border-yellow-500" />
            <SkillCard icon="🦊" name="Furry/Brony" level="Mediano" color="border-blue-500" />
            <SkillCard icon="🖌️" name="Dibujante" level="Me defiendo" color="border-cyan-500" />
            <SkillCard icon="🔥" name="Calentón" level="Explorando" color="border-green-500" />
          </div>
        </div>

        {/* --- SECCIÓN HISTORIA / TIMELINE --- */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-8 text-center md:text-left">🚀 Mi Historia</h2>
          
          <div className="space-y-8 border-l-2 border-gray-700 pl-4 md:pl-6 ml-2 md:ml-2">
            
            <TimelineItem 
              date="2026 - Presente" 
              title="Creando Denshi Blog" 
              desc="Decidí construir mi propia plataforma desde cero para no depender de nadie." 
            />

            <TimelineItem 
              date="2025" 
              title="Full directo a la comunidad Furry"
              desc="Fue el año donde me adentré de lleno a la comunidad furry, conociendo a mucha gente, varios amigos, y liberando mi bisexualidad." 
            />

            <TimelineItem 
              date="2024" 
              title="Un año algo interesante"
              desc="Este año lo sentí demasiado rápido, entre amigos y proyectos no hubo mucho que destacar." 
            />
            
            <TimelineItem 
              date="2023" 
              title="Entrando a la comunidad Furry"
              desc="Me metí de lleno a la comunidad furry y brony, conociendo gente increíble." 
            />

            <TimelineItem 
              date="2022" 
              title="Convirtiéndome en Brony"
              desc="Por medio de un streamer me interesé en MLP y su historia profunda." 
            />

            <TimelineItem 
              date="2020 (Parte 2)" 
              title="Creación de Contenido"
              desc="Entré de lleno a internet, comunidades de videojuegos y streams en Twitch." 
            />

            <TimelineItem 
              date="2020" 
              title="Salida de la Prepa" 
              desc="Me tocó vivirla en pandemia, pero logré graduarme y seguir adelante." 
            />

            <TimelineItem 
              date="2019" 
              title="Estudio de idiomas" 
              desc="Me metí a estudiar inglés y japonés, influenciado por Vtubers." 
            />

            <TimelineItem 
              date="2018" 
              title="De todo a nada" 
              desc="El peor año, aburrido, aparte de la muerte de Minecraft por Fortnite." 
            />

            <TimelineItem 
              date="2017" 
              title="Mejor año de mi vida" 
              desc="Primera interacción en Discord, Steam y juegos que me encantaron." 
            />

            <TimelineItem 
              date="2016" 
              title="Etapa Otaku" 
              desc="Me adentré en el anime: Suzumiya Haruhi, Attack on Titan y K-On!." 
            />

            <TimelineItem 
              date="2015" 
              title="Primera laptop propia" 
              desc="El gobierno nos regaló una laptop. Jugué Minecraft con mods y juegos Flash."
            />

            <TimelineItem 
              date="2014" 
              title="Primera vez en Minecraft" 
              desc="Conocí a Vegetta777 y TheWillyrex. Jugaba en una tablet." 
            />
            
            <TimelineItem 
              date="2013" 
              title="Más contacto con internet" 
              desc="Cuentas antiguas de Facebook, Metin2, San Andreas, L4D y CoD." 
            />
            
            <TimelineItem 
              date="2011" 
              title="Primeros videojuegos" 
              desc="Arcades tipo KOF, Snow Bros y Metal Slug en el ciber." 
            />

            <TimelineItem 
              date="2008" 
              title="El Nokia 1100" 
              desc="Juegos básicos como la serpiente (Snake) y Tetris." 
            />
            
            <TimelineItem 
              date="2002" 
              title="Nací - duh" 
              desc="Muerto viviente sin capacidad de razonar (todavía)." 
            />
            
          </div>
        </div>

      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function SkillCard({ icon, name, level, color }) {
  return (
    <div className={`bg-black/40 backdrop-blur-md p-3 md:p-4 rounded-xl border ${color} hover:bg-gray-800 transition flex items-center gap-3`}>
      <span className="text-xl md:text-2xl">{icon}</span>
      <div className="overflow-hidden">
        <h3 className="font-bold text-white text-xs md:text-sm truncate">{name}</h3>
        <p className="text-[10px] md:text-xs text-gray-400 truncate">{level}</p>
      </div>
    </div>
  );
}

function TimelineItem({ date, title, desc }) {
  return (
    <div className="relative group">
      <span className="absolute -left-[25px] md:-left-[33px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-900 group-hover:scale-125 transition"></span>
      <span className="text-xs md:text-sm text-blue-400 font-mono mb-1 block">{date}</span>
      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-blue-300 transition">{title}</h3>
      <p className="text-sm md:text-base text-gray-400 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}