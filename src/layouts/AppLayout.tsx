import React from 'react';
import { Search, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function AppLayout({ children, onLogout, settings }: { children: React.ReactNode, onLogout: () => void, settings: any }) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      <Sidebar settings={settings} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-2xl font-black text-[#1D2124] uppercase italic truncate mr-4">{settings.institution_name}</h1>
          <div className="hidden lg:flex items-center gap-6">
            <div className="bg-gray-50 border-2 border-gray-100 flex items-center gap-3 px-4 py-2 rounded-full w-80 focus-within:border-[#FFD43B] transition-all">
              <Search className="text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="BUSCAR MÓVIL O GUARDIA..." 
                className="bg-transparent border-none text-[10px] italic font-black w-full focus:outline-none placeholder:text-gray-300 text-[#1D2124] uppercase"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#F8F9FA] border border-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-[#20C997] rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SISTEMA OK</span>
              </div>
              <button className="p-3 bg-gray-50 text-gray-400 hover:bg-[#FFD43B] hover:text-[#1D2124] rounded-full transition-all relative flex-shrink-0">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FA5252] rounded-full border-2 border-white" />
              </button>
            </div>
          </div>
          {/* Mobile indicator or menu button could go here */}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
