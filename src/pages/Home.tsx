import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  Flame, 
  AlertTriangle,
  Clock,
  Plus,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Home({ settings }: { settings: any }) {
  const [stats, setStats] = useState({
    active_guard: '...',
    ready_units: '...',
    incidents_24h: '...',
    alerts: '...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Point 1: Using Promise.allSettled to handle partial failures
      const endpoints = [
        '/api/stats',
        '/api/alerts/vencimientos',
        '/api/guardia',
        '/api/incidents',
        '/api/personal',
        '/api/flota',
        '/api/finances/balance'
      ];

      try {
        const results = await Promise.allSettled(
          endpoints.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`Fetch failed: ${url}`);
            return res.json();
          }))
        );

        // Process results
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value;
            const url = endpoints[index];

            if (url === '/api/stats') {
              setStats({
                active_guard: data.active_guard.toString(),
                ready_units: `${data.ready_units}/${data.total_units}`,
                incidents_24h: data.incidents_24h.toString(),
                alerts: data.alerts.toString()
              });
            }
          } else {
            console.warn(`Error loading endpoint ${endpoints[index]}:`, result.reason);
          }
        });
      } catch (err) {
        console.error('Fatal error in Dashboard fetch:', err);
        toast.error('Error crítico al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">{settings.dashboard_title}</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{settings.dashboard_subtitle}</p>
        </div>
        <div className="flex gap-4 flex-wrap">
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
    </div>
  );
}
