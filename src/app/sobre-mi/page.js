import Link from 'next/link';

export default function SobreMi(){
  return(
    
    <div className="min-h-screen p-10 bg-gray-900 text-white">
      <div className="mb-6">
        <Link href="/" className="text-gray-400 hover:text-white underline">
          &larr; Volver al inicio
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-green-400">
        ¿Quien soy?
      </h1>
      <p className="mt-5 text-lg">
        Soy un desarrollador aprendiendo Next.js y Verceñ.
        Este blog es mi proyecto personal para documentar mis cosas.
      </p>
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <h3 className="font-bold text-xl mb-2">Mis metas:</h3>
        <ul classname="list-disc list-inside text-gray-300">
          <li>Aprender Next.js a fondo</li>
          <li>Dominar el despliegue de la nube</li>
          <li>Crear contenido bueno</li>
        </ul>
      </div>
    </div>
  );
}