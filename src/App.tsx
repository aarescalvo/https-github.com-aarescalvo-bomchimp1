/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Flame, 
  Users, 
  Truck, 
  ClipboardList, 
  Settings, 
  LogOut, 
  BarChart3, 
  Map as MapIcon, 
  AlertTriangle,
  Clock,
  ChevronRight,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

// --- Mock Components for Pages ---

const SettingsPage = ({ settings, onUpdate }: { settings: any, onUpdate: () => void }) => {
  const [formData, setFormData] = useState(settings);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('El archivo es demasiado grande (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Configuración actualizada correctamente');
        onUpdate();
      }
    } catch (err) {
      toast.error('Error al guardar la configuración');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Configuración del Sistema</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Personaliza la identidad visual y textos de tu aplicación</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border-2 border-[#1D2124] space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white border-2 border-[#1D2124] rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Flame className="text-gray-300" size={32} />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Logo del Cuartel</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#1D2124] file:text-white hover:file:opacity-90 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Formatos: PNG, JPG, WebP. Máximo 2MB.</p>
            </div>
            {formData.logo_url && (
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, logo_url: '' })}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Quitar logo"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Nombre de la App (Sidebar)</label>
            <input 
              type="text" 
              value={formData.app_name || ''}
              onChange={e => setFormData({ ...formData, app_name: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Nombre del Cuartel / Institución</label>
            <input 
              type="text" 
              value={formData.institution_name || ''}
              onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Título del Dashboard</label>
            <input 
              type="text" 
              value={formData.dashboard_title || ''}
              onChange={e => setFormData({ ...formData, dashboard_title: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Subtítulo del Dashboard</label>
            <input 
              type="text" 
              value={formData.dashboard_subtitle || ''}
              onChange={e => setFormData({ ...formData, dashboard_subtitle: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-[#FFD43B] text-[#1D2124] py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#FAB005] hover:translate-y-1 hover:shadow-[0_2px_0_0_#FAB005] transition-all"
        >
          GUARDAR CAMBIOS
        </button>
      </form>
    </div>
  );
};

const Dashboard = ({ settings }: { settings: any }) => {
  const [stats, setStats] = useState({
    active_guard: '...',
    ready_units: '...',
    incidents_24h: '...',
    alerts: '...'
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          active_guard: data.active_guard.toString(),
          ready_units: `${data.ready_units}/${data.total_units}`,
          incidents_24h: data.incidents_24h.toString(),
          alerts: data.alerts.toString()
        });
      })
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">{settings.dashboard_title}</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{settings.dashboard_subtitle}</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#1D2124] rounded-full text-sm font-bold hover:bg-gray-50 transition-all active:translate-y-0.5">
            <Clock size={16} />
            Cierre de Guardia
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#20C997] text-white rounded-full text-sm font-bold shadow-[0_4px_0_0_#12B886] hover:opacity-90 active:shadow-none active:translate-y-1 transition-all">
            <Plus size={16} />
            NUEVA INCIDENCIA
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Guardia Activa', value: stats.active_guard, icon: Users, borderColor: 'border-[#4C6EF5]', diff: '↑ 2 hoy' },
          { label: 'Unidades Listas', value: stats.ready_units, icon: Truck, borderColor: 'border-[#FAB005]', diff: '100% flota' },
          { label: 'Incidencias (24h)', value: stats.incidents_24h, icon: Flame, borderColor: 'border-[#FA5252]', diff: 'Normal' },
          { label: 'Alertas Críticas', value: stats.alerts, icon: AlertTriangle, borderColor: 'border-[#15AABF]', diff: 'Sin riesgo' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border-b-4 ${stat.borderColor}`}
          >
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-[#1D2124]">{stat.value}</h3>
            <p className="text-green-500 text-xs font-bold mt-2">{stat.diff}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#1D2124] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <span className="bg-[#FFD43B] text-[#1D2124] text-[10px] font-black px-3 py-1 rounded-full uppercase">Libreta en Vivo</span>
          </div>
          <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#20C997]">●</span> Libreta de Guardia Reciente
          </h4>
          <div className="space-y-4">
            {[
              { time: '21:30', event: 'Cambio de guardia - Turno Noche', user: 'Of. Inspector Rodriguez', icon: '👤' },
              { time: '18:45', event: 'Salida de Móvil 5 - Incendio de Pastizales', user: 'Cabo 1ro Gonzalez', icon: '🔥' },
              { time: '14:20', event: 'Revisión técnica Móvil 2 completada', user: 'Mecánico Martinez', icon: '🛠️' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{activity.icon}</div>
                  <div>
                    <p className="font-bold text-sm">{activity.event}</p>
                    <p className="text-gray-500 text-xs">{activity.user}</p>
                  </div>
                </div>
                <span className="text-gray-400 font-mono text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status */}
        <div className="bg-[#FFD43B] rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(250,176,5,0.2)] flex flex-col">
          <h4 className="text-[#1D2124] text-xl font-black mb-6 uppercase italic tracking-tight">Estado de Flota</h4>
          <div className="space-y-6 flex-1">
            {[
              { name: 'Móvil 2 - Autobomba', status: 'Operativo', health: 100 },
              { name: 'Móvil 5 - Abastecimiento', status: 'Operativo', health: 100 },
              { name: 'Móvil 1 - Rescate', status: 'En Mantenimiento', health: 45 },
            ].map((truck, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase">{truck.name}</label>
                  <span className="text-[10px] font-black uppercase">{truck.status}</span>
                </div>
                <div className="w-full bg-white h-2.5 rounded-full border border-[#1D2124]/10 overflow-hidden">
                  <div 
                    className="bg-[#1D2124] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${truck.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full bg-[#1D2124] text-white py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#000] hover:translate-y-1 hover:shadow-[0_2px_0_0_#000] transition-all">
            GESTIONAR FLOTA
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin, settings }: { onLogin: () => void, settings: any }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (user === 'admin' && pass === 'admin123') {
        onLogin();
        toast.success('Acceso concedido');
      } else {
        toast.error('Credenciales incorrectas');
        setIsLoading(false);
      }
    }, 1000);
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
        className="w-full max-w-md p-10 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 border-2 border-[#1D2124]"
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
            SISTEMA BOOT v2.0 © 2026 — CHIMPAY RN
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold ${
      active 
        ? 'bg-[#FFD43B] text-[#1D2124] shadow-[0_4px_0_0_#FAB005]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 3 : 2} />
    <span>{label}</span>
  </Link>
);

const AppLayout = ({ onLogout, settings, onUpdate }: { onLogout: () => void, settings: any, onUpdate: () => void }) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1D2124] flex-shrink-0 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#FFD43B] rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#FAB005] overflow-hidden">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Flame className="text-[#1D2124]" size={24} />
            )}
          </div>
          <span className="text-white font-black text-xl tracking-tight uppercase italic">{settings.app_name}</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={BarChart3} label="Dashboard" active={location.pathname === '/dashboard'} />
          <SidebarLink to="/incidencias" icon={Flame} label="Incidencias" active={location.pathname === '/incidencias'} />
          <SidebarLink to="/guardia" icon={ClipboardList} label="Libreta de Guardia" active={location.pathname === '/guardia'}/>
          <SidebarLink to="/personal" icon={Users} label="Personal" active={location.pathname === '/personal'}/>
          <SidebarLink to="/flota" icon={Truck} label="Flota y Activos" active={location.pathname === '/flota'}/>
          <SidebarLink to="/mapa" icon={MapIcon} label="Mapa Operativo" active={location.pathname === '/mapa'}/>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
          <SidebarLink to="/ajustes" icon={Settings} label="Configuración" active={location.pathname === '/ajustes'} />
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#FA5252] hover:bg-white/5 rounded-lg font-bold transition-all"
          >
            <LogOut size={20} />
            <span>SALIR</span>
          </button>
        </div>

        <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD43B] to-[#FA5252] flex items-center justify-center font-black text-[#1D2124] text-xs">OR</div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-tight">Of. Rodriguez</p>
              <p className="text-gray-500 text-[10px] font-bold">Jefe de Turno</p>
            </div>
          </div>
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest border border-white/10">
            PERFIL
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <h1 className="text-2xl font-black text-[#1D2124] uppercase italic">{settings.institution_name}</h1>
          <div className="flex items-center gap-6">
            <div className="bg-gray-50 border-2 border-gray-100 flex items-center gap-3 px-4 py-2 rounded-full w-80 focus-within:border-[#FFD43B] transition-all">
              <Search className="text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="BUSCAR MÓVIL O GUARDIA..." 
                className="bg-transparent border-none text-[10px] italic font-black w-full focus:outline-none placeholder:text-gray-300 text-[#1D2124] uppercase"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#F8F9FA] border border-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-[#20C997] rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SISTEMA OK</span>
              </div>
              <button className="p-3 bg-gray-50 text-gray-400 hover:bg-[#FFD43B] hover:text-[#1D2124] rounded-full transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FA5252] rounded-full border-2 border-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard settings={settings} />} />
            <Route path="/ajustes" element={<SettingsPage settings={settings} onUpdate={onUpdate} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check state on boot
  useEffect(() => {
    const auth = localStorage.getItem('sgp_auth');
    if (auth === 'true') setIsAuthenticated(true);
    fetchSettings();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('sgp_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sgp_auth');
  };

  if (isLoading || !settings) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1D2124]">
        <div className="w-12 h-12 border-4 border-[#FFD43B]/30 border-t-[#FFD43B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AnimatePresence mode="wait">
        <Routes>
          {!isAuthenticated ? (
            <Route path="/login" element={<LoginPage onLogin={handleLogin} settings={settings} />} />
          ) : (
            <Route path="/*" element={<AppLayout onLogout={handleLogout} settings={settings} onUpdate={fetchSettings} />} />
          )}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
