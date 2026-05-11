import React, { useState, useEffect } from 'react';
import { Save, Text, Image as ImageIcon, Layout, Users, Shield, History, Plus, Trash2, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  settings: Record<string, string>;
  onUpdate: () => void;
}

interface Operator {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface AuditLog {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

export default function Settings({ settings, onUpdate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'TEXTOS' | 'OPERADORES' | 'AUDITORIA'>('TEXTOS');
  const [localSettings, setLocalSettings] = useState(settings);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showOpModal, setShowOpModal] = useState(false);
  const [newOp, setNewOp] = useState({ username: '', name: '', role: 'OPERADOR' });

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const fetchOperators = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setOperators(data);
  };

  const fetchAudit = async () => {
    const res = await fetch('/api/audit');
    const data = await res.json();
    setAuditLogs(data);
  };

  useEffect(() => {
    if (activeTab === 'OPERADORES') fetchOperators();
    if (activeTab === 'AUDITORIA') fetchAudit();
  }, [activeTab]);

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOp)
      });
      if (res.ok) {
        toast.success('Operador creado');
        setShowOpModal(false);
        setNewOp({ username: '', name: '', role: 'OPERADOR' });
        fetchOperators();
      }
    } catch (err) {
      toast.error('Error al crear operador');
    }
  };

  const handleSaveTextSettings = async () => {
    setLoading(true);
    try {
      // For each key-value in localSettings, update it via /api/settings
      // Since our /api/settings POST expects {key, value}, but the original handleSave logic in other prompts was different, 
      // let's adjust it to send multiple requests if necessary or check if server supports bulk.
      // Based on server.ts view_file from checkpoint, it usually takes {key, value} or an entire object.
      // Let's use the object structure if the server supports it, or individual ones if not.
      // Re-viewing server.ts earlier: it seemed to take {key, value}.
      
      const promises = Object.entries(localSettings).map(([key, value]) => 
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      );
      await Promise.all(promises);
      toast.success('Configuración guardada');
      onUpdate();
    } catch (err) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Configuración del Sistema</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Personalización, seguridad y control de accesos</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('TEXTOS')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'TEXTOS' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          <div className="flex items-center gap-2"><Text size={14} /> Textos</div>
        </button>
        <button 
          onClick={() => setActiveTab('OPERADORES')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OPERADORES' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          <div className="flex items-center gap-2"><Users size={14} /> Operadores</div>
        </button>
        <button 
          onClick={() => setActiveTab('AUDITORIA')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'AUDITORIA' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          <div className="flex items-center gap-2"><History size={14} /> Auditoría</div>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'TEXTOS' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 max-w-2xl">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-[#FFD43B]">
                  <Text size={24} />
               </div>
               <h3 className="text-2xl font-black text-[#1D2124] uppercase italic">Textos Globales</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Cuartel</label>
                  <input 
                    type="text"
                    placeholder="E.G. CUARTEL CENTRAL"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={localSettings.institution_name || ''}
                    onChange={(e) => setLocalSettings({...localSettings, institution_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre de la App (Sidebar)</label>
                  <input 
                    type="text"
                    placeholder="BOMBEROS PRO"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={localSettings.app_name || ''}
                    onChange={(e) => setLocalSettings({...localSettings, app_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Eslogan / Subtítulo Home</label>
                <input 
                  type="text"
                  placeholder="SIEMPRE LISTOS"
                  className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                  value={localSettings.dashboard_subtitle || ''}
                  onChange={(e) => setLocalSettings({...localSettings, dashboard_subtitle: e.target.value})}
                />
              </div>
            </div>
            
            <button 
              disabled={loading}
              onClick={handleSaveTextSettings}
              className="w-full py-4 bg-[#1D2124] text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}

        {activeTab === 'OPERADORES' && (
          <div className="space-y-6">
            <div className="flex justify-start">
              <button 
                onClick={() => setShowOpModal(true)}
                className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
              >
                <Plus size={18} /> Nuevo Operador
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operators.map((op) => (
                <div key={op.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#FFD43B] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-[#FFD43B]">
                       <Shield size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-[#1D2124] uppercase leading-none">{op.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">@{op.username}</span>
                        <span className="px-2 py-0.5 bg-gray-50 text-[8px] font-black rounded text-blue-500 uppercase tracking-widest">{op.role}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
              ))}
              {operators.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <Users size={48} className="mx-auto mb-4 text-gray-100" />
                    <p className="font-black text-gray-300 uppercase text-xs tracking-widest">No hay operadores registrados</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'AUDITORIA' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-[#1D2124] uppercase italic">Registro de Auditoría</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Monitoreo Activo</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 uppercase text-[10px] font-bold">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-6 text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-yellow-50 text-[#FAB005] rounded-full border border-yellow-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-6 text-[#1D2124]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showOpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateOperator} className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Nuevo Operador</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Define las credenciales de acceso</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                  <input required placeholder="E.G. JUAN PEREZ" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase focus:border-[#FFD43B] focus:outline-none transition-all" value={newOp.name} onChange={(e) => setNewOp({...newOp, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre de Usuario</label>
                  <input required placeholder="E.G. JPEREZ" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase focus:border-[#FFD43B] focus:outline-none transition-all" value={newOp.username} onChange={(e) => setNewOp({...newOp, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol asignado</label>
                  <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase focus:border-[#FFD43B] focus:outline-none transition-all" value={newOp.role} onChange={(e) => setNewOp({...newOp, role: e.target.value})}>
                    <option value="OPERADOR">OPERADOR DE SISTEMA</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR TOTAL</option>
                    <option value="AUDITOR">LECTURA / AUDITOR</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setShowOpModal(false)} className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 uppercase text-xs">Cerrar</button>
                 <button type="submit" className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] uppercase text-xs italic">Confirmar Alta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
