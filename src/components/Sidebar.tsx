import React from 'react';
import { 
  BarChart3, 
  Flame, 
  ClipboardList, 
  Users, 
  Truck, 
  Map as MapIcon, 
  Settings, 
  LogOut,
  CreditCard,
  Target
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

export default function Sidebar({ settings, onLogout }: { settings: any, onLogout: () => void }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1D2124] flex-shrink-0 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-[#FFD43B] rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#FAB005] overflow-hidden flex-shrink-0">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <Flame className="text-[#1D2124]" size={24} />
          )}
        </div>
        <span className="text-white font-black text-xl tracking-tight uppercase italic truncate">{settings.app_name}</span>
      </div>

      <nav className="flex-1 space-y-2">
        <SidebarLink to="/dashboard" icon={BarChart3} label="Dashboard" active={location.pathname === '/dashboard'} />
        <SidebarLink to="/incidencias" icon={Flame} label="Incidencias" active={location.pathname === '/incidencias'} />
        <SidebarLink to="/guardia" icon={ClipboardList} label="Libreta de Guardia" active={location.pathname === '/guardia'}/>
        <SidebarLink to="/personal" icon={Users} label="Personal" active={location.pathname === '/personal'}/>
        <SidebarLink to="/flota" icon={Truck} label="Flota y Activos" active={location.pathname === '/flota'}/>
        <SidebarLink to="/pagos" icon={CreditCard} label="Pagos" active={location.pathname === '/pagos'}/>
        <SidebarLink to="/cancha" icon={Target} label="Cancha de Fútbol" active={location.pathname === '/cancha'}/>
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD43B] to-[#FA5252] flex items-center justify-center font-black text-[#1D2124] text-xs flex-shrink-0">OR</div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold uppercase tracking-tight truncate">Of. Rodriguez</p>
            <p className="text-gray-500 text-[10px] font-bold truncate">Jefe de Turno</p>
          </div>
        </div>
        <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest border border-white/10">
          PERFIL
        </button>
        <div className="mt-4 text-center">
          <p className="text-[8px] text-white/20 font-mono uppercase tracking-tighter">Versión de Sistema: 2.0.4-STABLE</p>
        </div>
      </div>
    </aside>
  );
}
