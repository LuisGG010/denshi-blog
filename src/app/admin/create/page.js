'use client'
import Link from 'next/link'
// Importamos el formulario que tú ya hiciste. 
// Nota los ".." porque estamos dentro de admin/create/
import NewPostForm from '../../blog/NewPostForm' 

export default function CreatePostPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        
        {/* Botón para volver atrás */}
        <Link href="/admin" className="text-gray-400 hover:text-white mb-6 inline-block font-mono bg-gray-800 px-4 py-2 rounded">
          &larr; Volver al Panel
        </Link>

        <h1 className="text-3xl font-bold text-green-500 mb-6 font-mono border-b border-gray-800 pb-4">
          NUEVA ENTRADA
        </h1>

        {/* AQUÍ ESTÁ TU FORMULARIO RECUPERADO */}
        <div className="bg-black border border-gray-800 p-6 rounded-lg shadow-2xl">
            <NewPostForm />
        </div>

      </div>
    </div>
  )
}