import React, { useState } from 'react';
import { Flame, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage({ settings, onUpdate }: { settings: any, onUpdate: () => void }) {
  const [formData, setFormData] = useState(settings);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('El archivo es demasiado grande (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Configuración actualizada correctamente');
        onUpdate();
      }
    } catch (err) {
      toast.error('Error al guardar la configuración');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Configuración del Sistema</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Personaliza la identidad visual y textos de tu aplicación</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border-2 border-[#1D2124] space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white border-2 border-[#1D2124] rounded-xl flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Flame className="text-gray-300" size={32} />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Logo del Cuartel</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#1D2124] file:text-white hover:file:opacity-90 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Formatos: PNG, JPG, WebP. Máximo 2MB.</p>
            </div>
            {formData.logo_url && (
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, logo_url: '' })}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                title="Quitar logo"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Nombre de la App (Sidebar)</label>
            <input 
              type="text" 
              value={formData.app_name || ''}
              onChange={e => setFormData({ ...formData, app_name: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Nombre del Cuartel / Institución</label>
            <input 
              type="text" 
              value={formData.institution_name || ''}
              onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Título del Dashboard</label>
            <input 
              type="text" 
              value={formData.dashboard_title || ''}
              onChange={e => setFormData({ ...formData, dashboard_title: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#1D2124]/60 uppercase mb-1 ml-1">Subtítulo del Dashboard</label>
            <input 
              type="text" 
              value={formData.dashboard_subtitle || ''}
              onChange={e => setFormData({ ...formData, dashboard_subtitle: e.target.value })}
              className="w-full bg-white border-2 border-[#1D2124] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-[#FFD43B] text-[#1D2124] py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#FAB005] hover:translate-y-1 hover:shadow-[0_2px_0_0_#FAB005] transition-all"
        >
          GUARDAR CAMBIOS
        </button>
      </form>
    </div>
  );
}
