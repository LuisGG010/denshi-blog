'use client'

export default function SocialPage() {

  const socials = [
    { 
      name: "Discord", 
      url: "https://discord.com/users/365965739984945165", 
      icon: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" 
    },
    { 
      name: "Steam", 
      url: "https://steamcommunity.com/profiles/76561198440071041/", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/960px-Steam_icon_logo.svg.png" 
    },
    { 
      name: "Youtube", 
      url: "https://www.youtube.com/@luis_gg0102", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" 
    },
    { 
      name: "Twitch", 
      url: "https://www.twitch.tv/luis_gg010", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Twitch_Glitch_Logo_Purple.svg" 
    },
    { 
      name: "Kick", 
      url: "https://kick.com/denshi010", 
      icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/kick-streaming-platform-logo-icon.png"
    },
    { 
      name: "Twitter / X", 
      url: "https://x.com/Luis_GG010", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" 
    },
    { 
      name: "Instagram", 
      url: "https://www.instagram.com/luis_gg010/", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
    },
    { 
      name: "GitHub", 
      url: "https://github.com/LuisGG010", 
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg" 
    },
  ];

  return (
    <div className="min-h-screen bg-black/40"> 
      
      
      {/* --- 2. CAPA CONTENIDO (z-10) --- */}
      {/* Todo lo que esté dentro de este div estará ENCIMA del video */}
      <div className="relative z-10 max-w-4xl mx-auto pt-24 px-6 pb-20">
        
        <h1 className="text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Visítame y háblame
          <span className="block text-xl text-gray-400 font-normal mt-3">Sígueme en mis redes</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {socials.map((social) => (
            <a 
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                group relative
                bg-gray-900/50 backdrop-blur-sm 
                p-8 rounded-2xl border border-gray-800
                flex flex-col items-center justify-center text-center
                transition duration-300 transform hover:scale-[1.02] hover:-translate-y-1
                hover:bg-gray-900 hover:border-gray-600 hover:shadow-xl
                shadow-[0_0_20px_rgba(0,255,255,0.1)] /* Sombra sutil por defecto */
                overflow-hidden
              `}
            >
              {/* Círculo del icono */}
              <div className="
                  mb-6 h-32 w-32 
                  flex justify-center items-center
                  bg-blue-400/20 rounded-full p-6 
                  shadow-[0_0_20px_rgba(255,255,255,0.1)]
                  transition duration-500 
                  group-hover:bg-white group-hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
              ">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                      src={social.icon} 
                      alt={`${social.name} logo`}
                      className="
                          h-full w-full 
                          object-contain 
                          filter drop-shadow-md
                          transition duration-300 group-hover:scale-110
                      "
                  />
              </div>

              <div className="w-full border-t border-gray-800 pt-4 mt-2 relative z-10">
                <h2 className="text-2xl font-bold text-white transition group-hover:text-blue-400">
                  {social.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1 group-hover:text-gray-400 transition">
                  Click para visitar
                </p>
              </div>

            </a>
          ))}

        </div>
      </div>
    </div>
  );
}