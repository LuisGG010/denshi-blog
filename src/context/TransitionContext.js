'use client'

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stage, setStage] = useState('hidden'); 

  const navigateWithTransition = async (url) => {
    if (url === window.location.pathname) return;
    
    router.push(url); 
    return;

    // 1. TELÓN CAE (GIF de entrada)
    setIsTransitioning(true);
    setStage('entering');
    // Ajusta este tiempo según lo que dure tu GIF de entrada
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    // 2. CAMBIO DE PÁGINA (Invisible detrás del telón)
    router.push(url);
    // Un pequeño respiro para asegurar que la nueva página cargó
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    // 3. TELÓN SUBE (GIF de salida)
    setStage('exiting');
    // Ajusta este tiempo según lo que dure tu GIF de salida
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    // 4. FIN DE LA TRANSICIÓN
    setIsTransitioning(false);
    setStage('hidden');
  };

  return (
    <TransitionContext.Provider value={{ navigateWithTransition, isTransitioning, stage }}>
      {children}
      
      {/* --- EL TELÓN (CONTENEDOR PRINCIPAL) --- */}
      {isTransitioning && (
        // left-64 deja libre el sidebar. 'overflow-hidden' asegura que nada se salga.
        <div className="fixed top-0 bottom-0 right-0 left-64 z-[9999] flex items-center justify-center bg-black pointer-events-none border-l border-gray-800 overflow-hidden">
            
            {/* ETAPA 1: IMAGEN DE ENTRADA (Cerrando) */}
            {stage === 'entering' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    /* PON AQUÍ TU LINK DE GIF DE ENTRADA */
                    src="https://cdn.discordapp.com/attachments/1466758148000973108/1467265027135246613/R7cD.gif?ex=697fc08a&is=697e6f0a&hm=81df39ab975bf206587ccfcb614fb22fd2d521342e9df5c17a5172fe3dd7a53c&"
                    alt="Cargando..."
                    // CLASES CLAVE: w-full h-full object-cover
                    // Esto hace que llene todo el espacio sin deformarse
                    className="w-full h-full object-cover"
                />
            )}

            {/* ETAPA 2: IMAGEN DE SALIDA (Abriendo) */}
            {stage === 'exiting' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    /* PON AQUÍ TU LINK DE GIF DE SALIDA */
                    src="https://cdn.discordapp.com/attachments/1466758148000973108/1467265027135246613/R7cD.gif?ex=697fc08a&is=697e6f0a&hm=81df39ab975bf206587ccfcb614fb22fd2d521342e9df5c17a5172fe3dd7a53c&"
                    alt="Listo"
                    // CLASES CLAVE: w-full h-full object-cover
                    className="w-full h-full object-cover"
                />
            )}

        </div>
      )}

    </TransitionContext.Provider>
  );
};

export const useTransition = () => useContext(TransitionContext);