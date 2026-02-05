'use client' // <--- ESTO ES LA CLAVE

import { useEffect, useRef } from 'react';

export default function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    // Ajustamos la velocidad una sola vez al cargar
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src="https://i.imgur.com/6IIG8Is.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none select-none opacity-40"
    />
  );
}