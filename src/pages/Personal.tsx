import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Phone, Mail, Award, MoreVertical, Calendar, MapPin, Droplet, BookOpen, MessageSquare, Plus, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Person {
  id: number;
  name: string;
  rank: string;
  dni: string;
  phone: string;
  status: string;
  birthdate?: string;
  address?: string;
  email?: string;
  blood_group?: string;
}

interface PersonalRecord {
  id: number;
  personnel_id: number;
  type: 'NOVEDAD' | 'CAPACITACION';
  title: string;
  description: string;
  date: string;
}

export default function Personal() {
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personRecords, setPersonRecords] = useState<PersonalRecord[]>([]);
  const [personStats, setPersonStats] = useState<any[]>([]);
  
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: 'NOVEDAD', title: '', description: '' });

  const [newPerson, setNewPerson] = useState({
    name: '',
    rank: 'BOMBERO',
    dni: '',
    phone: '',
    status: 'ACTIVO',
    birthdate: '',
    address: '',
    email: '',
    blood_group: 'A+'
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

  const fetchRecords = async (personId: number) => {
    const res = await fetch(`/api/personnel/${personId}/records`);
    const data = await res.json();
    setPersonRecords(data);
  };

  const fetchStats = async (personId: number) => {
    try {
      const res = await fetch(`/api/personnel/${personId}/attendance-stats`);
      const data = await res.json();
      setPersonStats(data);
    } catch (err) {
      console.error('Error fetching stats');
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
        setNewPerson({ name: '', rank: 'BOMBERO', dni: '', phone: '', status: 'ACTIVO', birthdate: '', address: '', email: '', blood_group: 'A+' });
        fetchPersonnel();
      }
    } catch (err) {
      toast.error('Error al registrar personal');
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    try {
      const res = await fetch('/api/personnel/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRecord, personnel_id: selectedPerson.id })
      });
      if (res.ok) {
        toast.success('Registro añadido');
        setShowRecordModal(false);
        setNewRecord({ type: 'NOVEDAD', title: '', description: '' });
        fetchRecords(selectedPerson.id);
      }
    } catch (err) {
      toast.error('Error al añadir registro');
    }
  };

  const calculateAge = (birthdate?: string) => {
    if (!birthdate) return 'S/D';
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const filtered = personnel.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.dni.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Legajos del Personal</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Gestión integral de bomberos y capacitación</p>
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
          <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:border-[#FFD43B] transition-all flex flex-col">
            <div className={`h-1.5 ${
              p.status === 'ACTIVO' ? 'bg-[#20C997]' : 
              p.status === 'RESERVA' ? 'bg-[#228BE6]' : 
              p.status === 'LICENCIA' ? 'bg-[#FFD43B]' : 
              'bg-[#FA5252]'
            }`} />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-2xl text-gray-300 group-hover:text-[#FFD43B] transition-colors uppercase">
                  {p.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 ${
                    p.status === 'ACTIVO' ? 'bg-green-50 text-green-500' : 
                    p.status === 'RESERVA' ? 'bg-blue-50 text-blue-500' : 
                    p.status === 'LICENCIA' ? 'bg-yellow-50 text-[#FAB005]' : 
                    'bg-red-50 text-red-500'
                  } text-[8px] font-black rounded-full uppercase tracking-widest`}>
                    {p.status}
                  </span>
                  <div className="px-2 py-1 bg-yellow-50 text-[#FAB005] text-[8px] font-black rounded uppercase">GRUPO {p.blood_group}</div>
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-xl font-black text-[#1D2124] uppercase tracking-tight leading-tight">{p.name}</h4>
                  <div className="flex items-center gap-2 text-[#FFD43B]">
                    <Award size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{p.rank}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">DNI</p>
                    <p className="text-xs font-bold text-[#1D2124]">{p.dni}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Edad</p>
                    <p className="text-xs font-bold text-[#1D2124]">{calculateAge(p.birthdate)} AÑOS</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={14} />
                    <span className="text-[10px] font-bold text-[#1D2124]">{p.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail size={14} />
                    <span className="text-[10px] font-bold text-[#1D2124] lowercase">{p.email || 'sin@correo.com'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSelectedPerson(p);
                  fetchRecords(p.id);
                  fetchStats(p.id);
                }}
                className="mt-6 w-full py-4 bg-[#F8F9FA] hover:bg-[#1D2124] hover:text-white text-[#1D2124] text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Ver Legajo Digital <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 italic">
            <Users size={48} className="mx-auto mb-4 text-gray-100" />
            <p className="font-black uppercase tracking-widest text-xs text-gray-300">No se encontraron resultados</p>
          </div>
        )}
      </div>

      {/* MODAL ALTA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreate} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-[#1D2124] uppercase mb-1">Nuevo Legajo</h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Carga de datos filiatorios</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                    <input required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase focus:border-[#FFD43B] focus:outline-none transition-all" value={newPerson.name} onChange={(e) => setNewPerson({...newPerson, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DNI</label>
                      <input required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold" value={newPerson.dni} onChange={(e) => setNewPerson({...newPerson, dni: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jerarquía</label>
                      <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newPerson.rank} onChange={(e) => setNewPerson({...newPerson, rank: e.target.value})}>
                        <option value="ASPIRANTE">ASPIRANTE</option>
                        <option value="BOMBERO">BOMBERO</option>
                        <option value="CABO">CABO</option>
                        <option value="CABO 1RO">CABO 1RO</option>
                        <option value="SARGENTO">SARGENTO</option>
                        <option value="SARGENTO 1RO">SARGENTO 1RO</option>
                        <option value="OFICIAL">OFICIAL</option>
                        <option value="SUBCOMANDANTE">SUBCOMANDANTE</option>
                        <option value="COMANDANTE">COMANDANTE</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Nacimiento</label>
                    <input type="date" required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold" value={newPerson.birthdate} onChange={(e) => setNewPerson({...newPerson, birthdate: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                    <input type="email" placeholder="E.G. CONTACTO@MAIL.COM" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold lowercase" value={newPerson.email} onChange={(e) => setNewPerson({...newPerson, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección</label>
                    <input placeholder="E.G. CALLE 123, CHIMPAY" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase" value={newPerson.address} onChange={(e) => setNewPerson({...newPerson, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Factor Sanguíneo</label>
                      <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newPerson.blood_group} onChange={(e) => setNewPerson({...newPerson, blood_group: e.target.value})}>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="0+">0+</option><option value="0-">0-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono</label>
                      <input className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold" value={newPerson.phone} onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</label>
                       <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newPerson.status} onChange={(e) => setNewPerson({...newPerson, status: e.target.value})}>
                         <option value="ACTIVO">ACTIVO (CUARTEL)</option>
                         <option value="RESERVA">RESERVA</option>
                         <option value="LICENCIA">LICENCIA</option>
                         <option value="RETIRADO">RETIRADO</option>
                         <option value="BAJA">BAJA</option>
                       </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-10">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-16 border-2 border-gray-100 rounded-2xl font-black uppercase text-xs italic">Cerrar</button>
                  <button type="submit" className="flex-1 h-16 bg-[#1D2124] text-[#FFD43B] font-black rounded-2xl uppercase text-xs italic shadow-xl">Guardar Legajo</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEGAJO DETALLE MODAL */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-10">
            <div className="p-10 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center font-black text-4xl text-[#1D2124] italic">
                  {selectedPerson.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-4xl font-black text-[#1D2124] uppercase italic tracking-tight">{selectedPerson.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="bg-[#FFD43B] text-[#1D2124] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPerson.rank}</span>
                     <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">ID: {selectedPerson.id}000{selectedPerson.dni.slice(-3)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPerson(null)} className="p-3 bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all font-black text-xs uppercase px-6">Cerrar</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 italic">Información Personal</h4>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <Droplet className="text-red-500" size={16} />
                          <span className="text-xs font-black uppercase tracking-widest">Grupo Sanguíneo: <span className="text-red-500">{selectedPerson.blood_group}</span></span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Calendar className="text-gray-400" size={16} />
                          <span className="text-xs font-black uppercase tracking-widest">Nacimiento: {selectedPerson.birthdate}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <MapPin className="text-gray-400" size={16} />
                          <span className="text-xs font-black uppercase tracking-widest">{selectedPerson.address || 'CHIMPAY, RIO NEGRO'}</span>
                       </div>
                    </div>
                 </div>
                 <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                    <AlertTriangle className="text-red-500 mb-2" />
                    <p className="text-[10px] font-black text-red-500 uppercase">Sin Alergias Registradas</p>
                    <p className="text-[8px] font-black text-red-300 uppercase mt-1">Legajo médico completo</p>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 italic">Estadísticas de Servicio</h4>
                    <div className="grid grid-cols-2 gap-2">
                       {personStats.map(stat => (
                          <div key={stat.type} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                             <p className="text-[8px] font-black text-gray-400 uppercase">{stat.type}</p>
                             <p className="text-xl font-black text-[#1D2124] italic">{Math.round(stat.total_hours || 0)} <span className="text-[10px]">HRS</span></p>
                          </div>
                       ))}
                       {personStats.length === 0 && <p className="text-[10px] font-black text-gray-300 italic uppercase">Sin horas acumuladas</p>}
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-[#1D2124] uppercase tracking-widest italic">Novedades y Capacitaciones</h4>
                    <button 
                      onClick={() => setShowRecordModal(true)}
                      className="px-4 py-2 bg-[#1D2124] text-white text-[8px] font-black rounded-lg uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                    >
                       <Plus size={12} /> Añadir Registro
                    </button>
                 </div>

                 <div className="space-y-4">
                   {personRecords.map(rec => (
                     <div key={rec.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 relative group overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${rec.type === 'CAPACITACION' ? 'bg-[#FFD43B]' : 'bg-blue-400'}`} />
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              {rec.type === 'CAPACITACION' ? <BookOpen size={14} className="text-[#FAB005]" /> : <MessageSquare size={14} className="text-blue-400" />}
                              <span className={`text-[8px] font-black uppercase tracking-widest ${rec.type === 'CAPACITACION' ? 'text-[#FAB005]' : 'text-blue-400'}`}>
                                 {rec.type}
                              </span>
                           </div>
                           <span className="text-[8px] font-black text-gray-300 font-mono">{new Date(rec.date).toLocaleDateString()}</span>
                        </div>
                        <h5 className="text-sm font-black text-[#1D2124] uppercase mb-1">{rec.title}</h5>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{rec.description}</p>
                     </div>
                   ))}
                   {personRecords.length === 0 && (
                     <div className="py-20 text-center text-gray-300 font-black uppercase text-xs border-2 border-dashed border-gray-50 rounded-3xl italic">
                        No hay historial registrado
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO REGISTRO */}
      {showRecordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
             <form onSubmit={handleCreateRecord} className="space-y-6">
                <h3 className="text-xl font-black text-[#1D2124] uppercase italic">Añadir Registro</h3>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</label>
                      <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value as any})}>
                        <option value="NOVEDAD">NOVEDAD / COMENTARIO</option>
                        <option value="CAPACITACION">CAPACITACIÓN / CURSO</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título / Asunto</label>
                      <input required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase" value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</label>
                      <textarea required className="w-full h-32 bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold uppercase" value={newRecord.description} onChange={e => setNewRecord({...newRecord, description: e.target.value})} />
                   </div>
                </div>
                <div className="flex gap-4">
                   <button type="button" onClick={() => setShowRecordModal(false)} className="flex-1 h-12 font-black uppercase text-xs">Cerrar</button>
                   <button type="submit" className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl uppercase text-xs">Añadir</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
