'use client'

import { useState, useEffect } from 'react';
import NewPostForm from '../blog/NewPostForm';
import AdminList from './AdminList';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// --- FUNCIÓN DE SEGURIDAD (HASHING) ---
// Esta función convierte cualquier texto en una huella digital única (SHA-256)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  
  // --- ZONA DE SEGURIDAD ---
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  
  // YA NO GUARDAMOS "". Guardamos su huella digital.
  // Este chorrero de letras ES el número "" traducido.
  // Si alguien inspecciona el código, verá esto y no sabrá qué números son.
  const SECRET_HASH = "d8094c5e6f6bdcf73f514d0bf240f6fc2808a4776944687bba80cf5b8afcf3cf"; 
  // -------------------------

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setAuthorized(true);
      fetchPosts();
    }
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. Convertimos lo que escribiste en Hash
    const hashedInput = await sha256(pin);

    // TRUCO: Si quieres cambiar tu contraseña en el futuro,
    // abre la consola (F12) y mira lo que sale aquí cuando intentas entrar.
    // Copias ese código nuevo y lo pegas arriba en SECRET_HASH.
    //console.log("El Hash de lo que escribiste es:", hashedInput);

    // 2. Comparamos los Hashes
    if (hashedInput === SECRET_HASH) {
      setAuthorized(true);
      localStorage.setItem('admin_auth', 'true');
      fetchPosts();
    } else {
      alert("PIN Incorrecto. 🚨");
      setPin('');
    }
  };

  const handleLogout = () => {
    setAuthorized(false);
    localStorage.removeItem('admin_auth');
  };

  if (!authorized) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-black text-white p-4'>
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl text-center max-w-sm w-full">
          <h1 className='text-4xl mb-6'>🔒</h1>
          <h2 className="text-xl font-bold text-blue-500 mb-4">Área Restringida</h2>
          <p className="text-gray-400 mb-6 text-sm">Solo personal autorizado.</p>
          
          <form onSubmit={handleLogin} className="flex gap-2">
            <input 
              type="password" 
              placeholder="Ingresa el PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="flex-1 p-2 bg-black border border-gray-700 rounded text-center text-white focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-500 transition">
              Entrar
            </button>
          </form>

          <Link href="/" className='mt-6 block text-gray-500 hover:text-white text-sm'>
            &larr; Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-10 flex flex-col items-center bg-black text-white'>
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className='text-3xl font-bold text-blue-500'>Panel Admin</h1>
        <button onClick={handleLogout} className="text-xs text-red-400 border border-red-900 px-3 py-1 rounded hover:bg-red-900/30">
          Cerrar Sesión 🔒
        </button>
      </div>
      
      <div className='w-full max-w-md mb-8'>
        <NewPostForm />
      </div>

      <AdminList posts={posts} />

      <Link href="/" className='mt-12 text-gray-400 hover:text-white'>
        &larr; Ir a ver el blog público
      </Link>
    </div>
  );
}