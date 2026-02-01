import './globals.css';
import Sidebar from '@/components/Sidebar'; 
import ViewCounter from '@/components/ViewCounter'; 
import { TransitionProvider } from '@/context/TransitionContext'; 

export const metadata = {
  title: 'Denshi Blog',
  description: 'Un blog personal sobre mi vida personal.',
  openGraph: {
    title: 'Denshi Blog',
    description: 'Un blog personal sobre mi vida personal',
    type: 'website',
    locale: 'es_ES',
    url: 'https://denshi-blog.vercel.app', 
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
            <Sidebar /> 
            
            {/* --- CORRECCIÓN AQUÍ --- */}
            {/* Antes: ml-64 (siempre dejaba hueco) */}
            {/* Ahora: md:ml-64 (solo deja hueco en PC) */}
            <main className="md:ml-64 flex-1 p-8 w-full min-h-screen bg-black transition-all duration-300">
              {children}
            </main>

        </TransitionProvider>

      </body>
    </html>
  );
}