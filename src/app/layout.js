import './globals.css';
import Sidebar from '@/components/Sidebar';
import ViewCounter from '@/components/ViewCounter';
import { TransitionProvider } from '@/context/TransitionContext';
import Script from 'next/script'; // <--- 1. IMPORTANTE: Necesario para los scripts de OneSignal

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
        
        {/* --- 2. INTEGRACIÓN DE ONESIGNAL (NOTIFICACIONES) --- */}
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="lazyOnload" // Carga sin bloquear la página
        />
        
        <Script id="onesignal-init" strategy="lazyOnload">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "99aa14a7-72cd-479c-90f3-6ec6e1319bd1",
                safari_web_id: "web.onesignal.auto.37bbdda8-1be5-416a-8d2a-3d51b0669a43",
                notifyButton: {
                  enable: true,
                },
              });
            });
          `}
        </Script>
        {/* ---------------------------------------------------- */}

        <TransitionProvider>
            
            <ViewCounter />
            <Sidebar />
            
            <main className="ml-64 flex-1 p-8 w-full min-h-screen bg-black">
              {children}
            </main>

        </TransitionProvider>

      </body>
    </html>
  );
}