export default function SocialPage() {
  const socials = [
    { name: "GitHub", url: "https://github.com/tuusuario", icon: "🐙", color: "hover:text-purple-400" },
    { name: "Twitter / X", url: "https://twitter.com/tuusuario", icon: "🐦", color: "hover:text-blue-400" },
    { name: "Instagram", url: "https://instagram.com/tuusuario", icon: "📸", color: "hover:text-pink-500" },
    { name: "LinkedIn", url: "https://linkedin.com/in/tuusuario", icon: "💼", color: "hover:text-blue-600" },
  ];

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-500 border-b border-gray-800 pb-4">
        Conectemos 🔌
      </h1>

      <div className="grid gap-4">
        {socials.map((social) => (
          <a 
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-center gap-4 transition transform hover:scale-105 hover:border-blue-500 ${social.color}`}
          >
            <span className="text-4xl">{social.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{social.name}</h2>
              <p className="text-gray-500 text-sm">Sígueme para ver más</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}