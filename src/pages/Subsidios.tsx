import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, AlertTriangle, CheckCircle2, Cloud, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: number;
  title: string;
  category: string;
  status: string;
  expiry_date: string;
  file_url: string | null;
}

export default function Subsidios() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'NACIONAL',
    status: 'PRESENTADO',
    expiry_date: ''
  });

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      toast.error('Error al cargar documentación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        toast.success('Documento registrado');
        setShowModal(false);
        setNewDoc({ title: '', category: 'NACIONAL', status: 'PRESENTADO', expiry_date: '' });
        fetchDocs();
      }
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Gestión de Subsidios</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Documentación y rendiciones ante organismos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
        >
          <Plus size={18} />
          Subir Documento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Cloud size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Almacenamiento</p>
            <h3 className="text-xl font-black text-[#1D2124]">85% LIBRE</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rendiciones</p>
            <h3 className="text-xl font-black text-[#1D2124]">AL DÍA</h3>
          </div>
        </div>
        <div className="bg-[#FA5252] p-6 rounded-3xl flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Próximo Vencimiento</p>
            <h3 className="text-xl font-black italic uppercase">30 Jun 2026</h3>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#FFD43B] transition-all group flex items-start gap-6">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#FFD43B]/10 transition-colors">
              <FileText className="text-gray-400 group-hover:text-[#1D2124]" size={28} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-[#1D2124] uppercase tracking-tight">{doc.title}</h4>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${doc.status === 'APROBADO' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <span className="flex items-center gap-1"><Cloud size={12} /> {doc.category}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Vence: {new Date(doc.expiry_date).toLocaleDateString()}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <button className="px-4 py-1.5 bg-gray-50 text-[10px] font-black uppercase rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2">
                  <Download size={14} /> Descargar
                </button>
              </div>
            </div>
          </div>
        ))}
        {docs.length === 0 && !loading && (
          <div className="md:col-span-2 py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-black uppercase text-xs text-gray-400 tracking-widest">Sin documentación cargada recientemente</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Cargar Documento</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Asegúrate de que el archivo sea legible</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título del Documento</label>
                  <input 
                    required
                    type="text"
                    placeholder="E.G. RENDICIÓN SUBSIDIO NACIONAL 2025"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                    <select 
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                    >
                      <option value="NACIONAL">NACIONAL</option>
                      <option value="PROVINCIAL">PROVINCIAL</option>
                      <option value="MUNICIPAL">MUNICIPAL</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimiento</label>
                    <input 
                      required
                      type="date"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-xs font-black focus:border-[#FFD43B] focus:outline-none transition-all"
                      value={newDoc.expiry_date}
                      onChange={(e) => setNewDoc({...newDoc, expiry_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all group">
                  <Cloud size={32} className="text-gray-300 group-hover:text-[#FFD43B] transition-colors" />
                  <p className="text-[10px] font-black text-gray-400 uppercase group-hover:text-[#1D2124]">Click para seleccionar PDF</p>
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
