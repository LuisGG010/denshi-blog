import './globals.css';
import Sidebar from '@/components/Sidebar'; // Importamos tu nuevo componente

export const metadata = {
  title: 'Denshi Blog - Código y Música', // Título de la pestaña
  description: 'Un blog personal sobre desarrollo web, Next.js y aventuras digitales.', // Lo que sale abajo del título en Google
  openGraph: {
    title: 'Denshi Blog',
    description: 'Un blog personal sobre desarrollo web, Next.js y aventuras digitales.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://denshi-blog.vercel.app', // Pon tu URL real de Vercel aquí
    siteName: 'Denshi Blog',
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-black text-white min-h-screen flex">
        
        {/* 1. LA BARRA LATERAL (FIJA) */}
        <Sidebar />

        {/* 2. EL CONTENIDO PRINCIPAL (A LA DERECHA) */}
        {/* ml-64 deja el margen izquierdo exacto del ancho del sidebar (16rem / 64 tailwind units) */}
        <main className="ml-64 flex-1 p-8 w-full min-h-screen bg-black">
          {children}
        </main>

      </body>
    </html>
  );
}