import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  Flame, 
  AlertTriangle,
  Clock,
  Plus,
  Activity,
  MapPin,
  Save,
  CalendarRange,
  FileText,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function Home({ settings }: { settings: any }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    active_guard: '...',
    ready_units: '...',
    incidents_24h: '...',
    alerts: '...'
  });
  const [loading, setLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'INCENDIO',
    description: '',
    location: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          active_guard: data.active_guard.toString(),
          ready_units: `${data.ready_units}/${data.total_units}`,
          incidents_24h: data.incidents_24h.toString(),
          alerts: data.alerts.toString()
        });
      }
    } catch (err) {
      console.warn('Dashboard stats error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWhatsAppDispatch = (inc: any) => {
    const message = `🚨 *DESPACHO DE EMERGENCIA BVC* 🚨\n\n` + 
                    `📍 *UBICACIÓN:* ${inc.location}\n` +
                    `🔥 *TIPO:* ${inc.type}\n` +
                    `📝 *INFO:* ${inc.description}\n` +
                    `⏰ *SALIDA:* ${new Date().toLocaleTimeString()}\n\n` +
                    `*POR FAVOR REPORTARSE AL CUARTEL INMEDIATAMENTE*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleQuickIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident)
      });
      if (res.ok) {
        toast.success('Incidencia despachada');
        handleWhatsAppDispatch(newIncident);
        setShowIncidentModal(false);
        setNewIncident({ type: 'INCENDIO', description: '', location: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Error al despachar');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">{settings.institution_name || 'Cuartel Central'}</h2>
            <span className="bg-[#1D2124] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">SISTEMA ACTIVO</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{settings.dashboard_subtitle || 'Gestión de Emergencias y Operaciones'}</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={() => navigate('/guardia')}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#1D2124] rounded-full text-sm font-bold hover:bg-gray-50 transition-all active:translate-y-0.5"
          >
            <Clock size={16} />
            Libreta de Guardia
          </button>
          <button 
            onClick={() => setShowIncidentModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FA5252] text-white rounded-full text-sm font-bold shadow-[0_4px_0_0_#C92A2A] hover:bg-[#F03E3E] active:shadow-none active:translate-y-1 transition-all uppercase"
          >
            <Plus size={16} />
            Nueva Incidencia
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
            className={`p-6 bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border-b-4 ${stat.borderColor} relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 text-current`}>
              <stat.icon size={48} />
            </div>
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
            {loading ? (
              <div className="flex justify-center p-8">
                <Activity className="animate-spin text-[#FFD43B]" />
              </div>
            ) : (
              [
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
              ))
            )}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/calendario" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-[#FFD43B] transition-all group">
           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#FFD43B]/10 group-hover:text-[#FFD43B] mb-6 transition-all">
              <CalendarRange size={24} />
           </div>
           <h4 className="text-xl font-black text-[#1D2124] uppercase italic mb-2">Cronograma Visual</h4>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Planifica las guardias del mes</p>
        </Link>
        <Link to="/subsidios" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-400 transition-all group">
           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 mb-6 transition-all">
              <FileText size={24} />
           </div>
           <h4 className="text-xl font-black text-[#1D2124] uppercase italic mb-2">Subsidios y Archivo</h4>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Gestión documental y rendiciones</p>
        </Link>
        <Link to="/guardia" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-green-400 transition-all group">
           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-green-50 group-hover:text-green-500 mb-6 transition-all">
              <UserCheck size={24} />
           </div>
           <h4 className="text-xl font-black text-[#1D2124] uppercase italic mb-2">Control de Personal</h4>
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ingresos y egresos en tiempo real</p>
        </Link>
      </div>

      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleQuickIncident} className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1 underline decoration-red-500 decoration-4">Despacho Rápido</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Alerta inmediata al sistema de despacho</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</label>
                  <select 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FA5252] focus:outline-none transition-all"
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  >
                    <option value="INCENDIO">INCENDIO</option>
                    <option value="ACCIDENTE">ACCIDENTE</option>
                    <option value="RESCATE">RESCATE</option>
                    <option value="MATERIALES PELIGROSOS">MAT-PEL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input required placeholder="DIRECCION O INTERSECCION" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 text-sm font-bold uppercase focus:border-[#FA5252] focus:outline-none transition-all" value={newIncident.location} onChange={(e) => setNewIncident({...newIncident, location: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Breve descripción</label>
                  <input required placeholder="E.G. HUMO EN VIVIENDA" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase focus:border-[#FA5252] focus:outline-none transition-all" value={newIncident.description} onChange={(e) => setNewIncident({...newIncident, description: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setShowIncidentModal(false)} className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 uppercase text-xs">Cerrar</button>
                 <button type="submit" className="flex-1 h-12 bg-[#FA5252] text-white font-black rounded-xl shadow-[0_4px_0_0_#C92A2A] uppercase text-xs flex items-center justify-center gap-2">
                   <Flame size={18} />
                   SALIDA YA
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
