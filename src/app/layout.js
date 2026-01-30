import './globals.css';
import Sidebar from '@/components/Sidebar'; // Importamos tu nuevo componente

export const metadata = {
  title: 'Denshi Blog',
  description: 'Blog personal de tecnología',
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