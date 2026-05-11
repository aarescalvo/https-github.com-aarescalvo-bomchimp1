import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Phone, Mail, Award, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Person {
  id: number;
  name: string;
  rank: string;
  dni: string;
  phone: string;
  status: string;
}

export default function Personal() {
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    rank: 'BOMBERO',
    dni: '',
    phone: '',
    status: 'ACTIVO'
  });

  const fetchPersonnel = async () => {
    try {
      const res = await fetch('/api/personnel');
      const data = await res.json();
      setPersonnel(data);
    } catch (err) {
      toast.error('Error al cargar personal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPerson)
      });
      if (res.ok) {
        toast.success('Personal registrado correctamente');
        setShowModal(false);
        setNewPerson({ name: '', rank: 'BOMBERO', dni: '', phone: '', status: 'ACTIVO' });
        fetchPersonnel();
      }
    } catch (err) {
      toast.error('Error al registrar personal');
    }
  };

  const filtered = personnel.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.dni.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Gestión de Personal</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Listado y legajos de bomberos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
        >
          <UserPlus size={18} />
          Alta de Personal
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE, RANGO O DNI..."
            className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#FFD43B] focus:outline-none transition-all uppercase"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:border-[#FFD43B] transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-2xl text-gray-300 group-hover:text-[#FFD43B] transition-colors uppercase">
                  {p.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 ${p.status === 'ACTIVO' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'} text-[8px] font-black rounded-full uppercase tracking-widest`}>
                    {p.status}
                  </span>
                  <button className="p-1 text-gray-300 hover:text-[#1D2124] transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-black text-[#1D2124] uppercase tracking-tight leading-tight">{p.name}</h4>
                  <div className="flex items-center gap-2 text-[#FFD43B]">
                    <Award size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{p.rank}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 space-y-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-[10px] font-black uppercase tracking-widest w-12 flex-shrink-0">DNI</span>
                    <span className="text-xs font-bold text-[#1D2124]">{p.dni}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone size={14} className="w-12 flex-shrink-0" />
                    <span className="text-xs font-bold text-[#1D2124]">{p.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-xs">No se encontró personal con esos criterios</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Alta de Personal</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Registra un nuevo bombero en el sistema</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                  <input 
                    required
                    type="text"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DNI</label>
                    <input 
                      required
                      type="text"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all"
                      value={newPerson.dni}
                      onChange={(e) => setNewPerson({...newPerson, dni: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jerarquía / Rango</label>
                    <select 
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                      value={newPerson.rank}
                      onChange={(e) => setNewPerson({...newPerson, rank: e.target.value})}
                    >
                      <option value="BOMBERO">BOMBERO</option>
                      <option value="CABO">CABO</option>
                      <option value="SARGENTO">SARGENTO</option>
                      <option value="OFICIAL">OFICIAL</option>
                      <option value="COMANDANTE">COMANDANTE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono de Contacto</label>
                  <input 
                    required
                    type="text"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                  />
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
