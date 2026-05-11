import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Login({ onLogin, settings }: { onLogin: () => void, settings: any }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin();
        toast.success('Acceso concedido');
      } else {
        toast.error(data.error || 'Credenciales incorrectas');
        setIsLoading(false);
      }
    } catch (err) {
      toast.error('Error de conexión');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1D2124] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-[#FFD43B] rounded-full blur-[150px]" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-[#FA5252] rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 border-2 border-[#1D2124] mx-4"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-[#FFD43B] rounded-2xl shadow-[0_4px_0_0_#FAB005] mb-6 w-20 h-20 items-center justify-center overflow-hidden">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Flame className="text-[#1D2124]" size={40} />
            )}
          </div>
          <h1 className="text-3xl font-black text-[#1D2124] tracking-tight uppercase italic">{settings.app_name}</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">{settings.institution_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Usuario</label>
            <input 
              type="text" 
              value={user}
              onChange={e => setUser(e.target.value)}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-4 text-sm font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#FFD43B]/20"
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Contraseña</label>
            <input 
              type="password" 
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-4 text-sm font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#FFD43B]/20"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#FFD43B] text-[#1D2124] py-5 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#FAB005] hover:translate-y-1 hover:shadow-[0_2px_0_0_#FAB005] active:translate-y-1.5 active:shadow-none transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-[#1D2124]/30 border-t-[#1D2124] rounded-full animate-spin" />
            ) : (
              "INGRESAR AL SISTEMA"
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            SISTEMA BOOT v2.0.4-STABLE © 2026 — CHIMPAY RN
          </p>
          <p className="text-[8px] text-gray-300 font-mono mt-1">BUILD_ID: 20260511_REV4</p>
        </div>
      </motion.div>
    </div>
  );
}
