import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] }); // Usa la fuente Inter de Google Fonts


export const metadata = {
  title: "Denshi Blog",
  description: "Mi blog personal creado con Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <nav className="p-6 border-b border-gray-800 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-500">
            DenshiBlog
          </Link>

          <div className="space-x-4">
            <Link href="/sobre-mi" className="hover:text-blue-400 transition">
              Sobre Mi
            </Link>
          </div>
        </nav>
      
        <main className="p-10">
          {children}
        </main>
      </body>
    </html>
  );
}
