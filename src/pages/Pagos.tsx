import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: number;
  payer_name: string;
  amount: number;
  date: string;
  category: string;
  status: string;
  concept: string;
}

export default function Pagos() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    payer_name: '',
    amount: '',
    category: 'CUOTA',
    concept: ''
  });

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPayment,
          amount: parseFloat(newPayment.amount)
        })
      });

      if (res.ok) {
        toast.success('Pago registrado correctamente');
        setShowModal(false);
        setNewPayment({ payer_name: '', amount: '', category: 'CUOTA', concept: '' });
        fetchPayments();
      }
    } catch (err) {
      toast.error('Error al registrar pago');
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Gestión de Pagos</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Administración de ingresos y cuotas</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#FAB005] transition-all flex items-center gap-2 uppercase text-xs"
          >
            <Plus size={18} />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Recaudado</p>
              <h3 className="text-2xl font-black text-[#1D2124]">${totalCollected.toLocaleString()}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
            <ArrowUpRight size={14} />
            <span>+12% este mes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pagos Realizados</p>
              <h3 className="text-2xl font-black text-[#1D2124]">{payments.length}</h3>
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Actualizado hoy</p>
        </div>

        <div className="bg-[#1D2124] p-6 rounded-3xl border border-white/10 shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[#FFD43B] text-[10px] font-black uppercase tracking-widest mb-2">Estado Financiero</p>
            <h3 className="text-white text-2xl font-black italic">SALDO OK</h3>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded-full uppercase tracking-widest">Auditado</span>
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h4 className="font-black text-[#1D2124] uppercase tracking-tight">Historial de Transacciones</h4>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-[#1D2124] transition-colors"><Filter size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-[#1D2124] transition-colors"><Download size={20} /></button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pagador</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-[#1D2124] uppercase">{p.payer_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{p.concept}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-[#1D2124] text-[9px] font-black rounded-full uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-[#1D2124]">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">
                    No hay transacciones registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Nuevo Pago</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Ingresa los detalles del cobro</p>
              
              <form onSubmit={handleAddPayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Pagador</label>
                  <input 
                    required
                    type="text"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={newPayment.payer_name}
                    onChange={(e) => setNewPayment({...newPayment, payer_name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto ($)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                    <select 
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                      value={newPayment.category}
                      onChange={(e) => setNewPayment({...newPayment, category: e.target.value})}
                    >
                      <option value="CUOTA">CUOTA</option>
                      <option value="DONACION">DONACIÓN</option>
                      <option value="CANCHA">CANCHA</option>
                      <option value="EVENTO">EVENTO</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</label>
                  <input 
                    required
                    type="text"
                    placeholder="E.g. Cuota Mayo 2026"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={newPayment.concept}
                    onChange={(e) => setNewPayment({...newPayment, concept: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase text-xs"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all uppercase text-xs"
                  >
                    Confirmar
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
