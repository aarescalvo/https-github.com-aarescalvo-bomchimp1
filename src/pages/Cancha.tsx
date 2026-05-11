import React, { useState, useEffect } from 'react';
import { Target, Calendar, Clock, User, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Reservation {
  id: number;
  user_name: string;
  field_name: string;
  start_time: string;
  end_time: string;
  status: string;
  price?: number;
}

export default function Cancha() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRes, setNewRes] = useState({
    user_name: '',
    field_name: 'CANCHA PRINCIPAL',
    date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    duration: '60',
    price: '8500'
  });

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const start = new Date(`${newRes.date}T${newRes.start_time}`);
      const end = new Date(start.getTime() + parseInt(newRes.duration) * 60000);

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: newRes.user_name,
          field_name: newRes.field_name,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          price: parseFloat(newRes.price)
        })
      });

      if (res.ok) {
        toast.success('Reserva confirmada');
        setShowModal(false);
        setNewRes({ ...newRes, user_name: '' });
        fetchReservations();
      }
    } catch (err) {
      toast.error('Error al reservar');
    }
  };

  const totalBilling = reservations.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Reserva de Cancha</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Gestión de alquileres y facturación</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recaudación Total</p>
             <span className="text-lg font-black text-[#1D2124]">${totalBilling.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
          >
            <Plus size={18} />
            Nueva Reserva
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 italic">Ocupación Hoy (Timeline)</h4>
        <div className="flex gap-1 h-12 bg-gray-50 rounded-full p-1 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-500 ${i > 5 && i < 8 ? 'bg-[#FFD43B]' : 'bg-gray-100 hover:bg-gray-200'}`}
              title={`${i + 12}:00hs`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 px-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">
          <span>12:00</span>
          <span>15:00</span>
          <span>18:00</span>
          <span>21:00</span>
          <span>23:59</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Availability Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1D2124] p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-[#FFD43B] text-xs font-black uppercase tracking-[0.2em] mb-4">Estado Actual</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                <span className="text-2xl font-black italic uppercase">Cancha Disponible</span>
              </div>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">
                La iluminación automática se activará a las 19:30hs. El riego está programado para las 08:00hs.
              </p>
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Mantenimiento</p>
                  <p className="text-[10px] font-black uppercase">Lunes 08:00hs</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Costo Hora</p>
                  <p className="text-[#FFD43B] text-[10px] font-black uppercase">$8.500 ARS</p>
                </div>
              </div>
            </div>
            <Target className="absolute -right-10 -bottom-10 text-white/5 w-48 h-48 rotate-12" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Reglas de Uso</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                <p className="text-xs font-bold text-[#1D2124] uppercase">Uso exclusivo de calzado adecuado</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                <p className="text-xs font-bold text-[#1D2124] uppercase">Respetar horario de finalización</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="text-[#FFD43B] flex-shrink-0" size={16} />
                <p className="text-xs font-bold text-[#1D2124] uppercase">Prohibido fumar en el predio</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Reservation List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.map((res) => {
              const start = new Date(res.start_time);
              const end = new Date(res.end_time);
              const duration = Math.round((end.getTime() - start.getTime()) / 60000);
              return (
                <div key={res.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#FFD43B] transition-all group flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <Calendar className="text-gray-400" size={14} />
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {start.toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-black text-[#1D2124] uppercase ml-4">${(res.price || 8500).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-[#1D2124] uppercase leading-none">{res.user_name}</p>
                      <p className="text-[10px] font-black text-[#FFD43B] uppercase tracking-widest italic">{res.field_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="text-[#20C997]" size={14} />
                        <span className="text-xs font-black text-[#1D2124]">
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black rounded uppercase">{duration} MIN</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-[#FA5252] transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
            {reservations.length === 0 && !loading && (
              <div className="md:col-span-2 py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase text-xs tracking-widest">No hay reservas para los próximos días</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Nueva Reserva</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Selecciona el horario disponible</p>
              
              <form onSubmit={handleAddReservation} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Responsable</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input 
                      required
                      type="text"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                      value={newRes.user_name}
                      onChange={(e) => setNewRes({...newRes, user_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</label>
                    <input 
                      required
                      type="date"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-xs font-black focus:border-[#FFD43B] focus:outline-none transition-all"
                      value={newRes.date}
                      onChange={(e) => setNewRes({...newRes, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Horario</label>
                    <input 
                      required
                      type="time"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-xs font-black focus:border-[#FFD43B] focus:outline-none transition-all"
                      value={newRes.start_time}
                      onChange={(e) => setNewRes({...newRes, start_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duración (MIN)</label>
                    <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all" value={newRes.duration} onChange={(e) => setNewRes({...newRes, duration: e.target.value})}>
                      <option value="60">60 MIN</option>
                      <option value="90">90 MIN</option>
                      <option value="120">120 MIN</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Importe ($)</label>
                    <input required type="number" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all" value={newRes.price} onChange={(e) => setNewRes({...newRes, price: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase text-xs"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all uppercase text-xs"
                  >
                    Reservar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
