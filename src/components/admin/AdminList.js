'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminList({ posts }) {
  const router = useRouter()
  // Estado para saber cuál post se está borrando y mostrar "..."
  const [loadingId, setLoadingId] = useState(null)

  const handleDelete = async (id) => {
    const confirmacion = window.confirm("¿Seguro que quieres borrar este post?");
    if (!confirmacion) return;

    setLoadingId(id); // Activamos modo carga para este botón

    try {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'delete_post', 
                id: id 
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Error: " + (data.error || "Error desconocido"));
        } else {
            router.refresh(); // Recargamos la lista visualmente
        }
    } catch (error) {
        alert("Error de conexión");
    } finally {
        setLoadingId(null); // Desactivamos modo carga
    }
  };

  // Si no hay posts, mostramos mensaje
  if (!posts || posts.length === 0) {
    return <div className="text-gray-500 text-center py-10">No hay posts todavía.</div>
  }

  return (
    <div className='w-full space-y-4'>
      <h2 className='text-xl text-blue-500 font-bold border-b border-gray-700 pb-2 mb-6'>
        Gestionar Posts ({posts.length})
      </h2>

      {posts.map((post) => (
        <div key={post.id} className='bg-gray-900 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center border border-gray-800 gap-4 hover:border-gray-600 transition'>
          
          {/* --- ZONA DE CONTENIDO (FOTO + TÍTULO) --- */}
          <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
            
            {/* MINIATURA (Tu código original mejorado) */}
            {post.image_url ? (
              <img 
                src={post.image_url} 
                alt="Miniatura" 
                className="w-16 h-16 rounded object-cover border border-gray-700 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl">
                 📝
              </div>
            )}

            {/* TEXTO DEL POST */}
            <div className="flex flex-col min-w-0">
                <span className='text-white font-bold text-lg truncate'>
                  {post.title}
                </span>
                <span className='text-gray-500 text-xs'>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <span className='text-gray-400 text-sm truncate max-w-[200px] opacity-70'>
                  {post.content}
                </span>
            </div>
          </div>

          {/* --- ZONA DE BOTONES --- */}
          <div className='flex gap-3 shrink-0'>
            {/* 👇 AQUÍ ESTÁ EL ARREGLO DE LA RUTA */}
            <Link 
              href={`/admin/edit/${post.id}`}
              className='bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded text-sm transition shadow-lg shadow-blue-900/20'
            >
              ✏️ EDITAR
            </Link>

            <button
              onClick={() => handleDelete(post.id)}
              disabled={loadingId === post.id}
              className='bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white px-4 py-2 rounded text-sm transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loadingId === post.id ? '...' : '🗑️'}
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}