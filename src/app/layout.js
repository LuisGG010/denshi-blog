import './globals.css';
import Sidebar from '@/components/Sidebar'; 
import ViewCounter from '@/components/ViewCounter'; 
// 👇 IMPORTAMOS EL NUEVO COMPONENTE
import BackgroundVideo from '@/components/BackgroundVideo'; 
import { TransitionProvider } from '@/context/TransitionContext'; 
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // IMPORTANTE: Pon aquí tu dominio real de Vercel para que las imágenes funcionen en Twitter/Discord
  metadataBase: new URL('https://denshi-blog.vercel.app'), 

  title: {
    default: 'Denshi Blog | Programación, Juegos y Caos',
    template: '%s | Denshi Blog', // Así las otras páginas dirán "About | Denshi Blog"
  },
  description: 'Un rincón de internet donde publico tonterías, música, código y mis experiencias como desarrollador y gamer.',
  
  keywords: ['Blog', 'Denshi', 'Programación', 'Next.js', 'Furry', 'Gaming', 'Desarrollo Web'],
  
  authors: [{ name: 'Denshi', url: 'https://denshi-blog.vercel.app' }],

  verification: {
    google: '_3jh8lniYRmNeE8LP2XAsd2MrSJ6TCKbnaYru5pNi3M',
  },
  
  openGraph: {
    title: 'Denshi Blog',
    description: 'Programación, arte y vida.',
    url: 'https://denshi-blog.vercel.app',
    siteName: 'Denshi Blog',
    images: [
      {
        url: '/opengraph-image.png', // Puedes subir una imagen llamada así a tu carpeta public
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Quitamos bg-black para evitar conflictos, lo maneja el CSS global o el video */}
      <body className={`${inter.className} text-white min-h-screen flex`}>

        {/* 🎬 VIDEO GLOBAL (Componente Cliente) 🎬 */}
        <BackgroundVideo />

        <TransitionProvider>
            <ViewCounter />
            <Sidebar /> 
            
            {/* Contenido principal */}
            <main className="md:ml-64 flex-1 w-full min-h-screen transition-all duration-300 relative z-10">
              {children}
            </main>

        </TransitionProvider>

      </body>
    </html>
  );
}