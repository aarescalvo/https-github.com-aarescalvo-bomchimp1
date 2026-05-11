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
        <button className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs">
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
            <div className="bg-gray-50 p-4 border-t border-gray-50 flex gap-2">
              <button className="flex-1 py-2 bg-white text-[#1D2124] text-[10px] font-black rounded-xl border border-gray-100 hover:shadow-sm transition-all uppercase">Legajo</button>
              <button className="flex-1 py-2 bg-white text-[#1D2124] text-[10px] font-black rounded-xl border border-gray-100 hover:shadow-sm transition-all uppercase">Guardias</button>
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
    </div>
  );
}
