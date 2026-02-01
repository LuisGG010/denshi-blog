'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Intentamos iniciar sesión con Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('❌ ACCESO DENEGADO: Credenciales inválidas');
      setLoading(false);
    } else {
      // Si todo sale bien, vamos al panel de admin
      router.push('/admin');
      router.refresh(); // Refrescamos para que la Sidebar sepa que entramos
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-blue-900/50 p-8 rounded-xl shadow-[0_0_50px_rgba(30,58,138,0.2)]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2 tracking-wider">
            SYSTEM ACCESS
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            // AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-xs font-mono text-blue-400 mb-2">IDENTIFIER_ID (EMAIL)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition font-mono"
              placeholder="admin@denshi.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-blue-400 mb-2">PASSCODE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition font-mono"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">VERIFYING...</span>
            ) : (
              <>
                <span>🔓</span> UNLOCK SYSTEM
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}