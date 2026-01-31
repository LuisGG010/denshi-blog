import './globals.css';
import Sidebar from '@/components/Sidebar'; // Importamos tu nuevo componente
import ViewCounter from '@/components/ViewCounter'; // <--- IMPORTAR
import { TransitionProvider } from '@/context/TransitionContext'; // <--- IMPORTAR

export const metadata = {
  title: 'Denshi Blog', // Título de la pestaña
  description: 'Un blog personal sobre mi vida personal.', // Lo que sale abajo del título en Google
  openGraph: {
    title: 'Denshi Blog',
    description: 'Un blog personal sobre mi vida personal',
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
        
        {/* ENVOLVEMOS TODO CON EL PROVIDER */}
        <TransitionProvider>
            
            <ViewCounter />
            <Sidebar /> {/* OJO: Tendremos que actualizar el Sidebar */}
            <main className="ml-64 flex-1 p-8 w-full min-h-screen bg-black">
              {children}
            </main>

        </TransitionProvider>

      </body>
    </html>
  );
}