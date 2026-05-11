/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'motion/react';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import SettingsPage from './pages/Settings';
import Incidencias from './pages/Incidencias';
import Personal from './pages/Personal';
import Flota from './pages/Flota';
import Pagos from './pages/Pagos';
import Cancha from './pages/Cancha';
import Guardia from './pages/Guardia';
import Calendario from './pages/Calendario';
import Subsidios from './pages/Subsidios';
import Mapa from './pages/Mapa';

// Layouts
import AppLayout from './layouts/AppLayout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.status === 401) return; // Wait for login
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setIsAuthenticated(true);
        await fetchSettings();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1D2124]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FFD43B]/30 border-t-[#FFD43B] rounded-full animate-spin" />
          <p className="text-[#FFD43B] text-[10px] font-black uppercase tracking-widest text-center">
            Iniciando Sistema...<br/>
            <span className="opacity-50">v2.0.4-STABLE [882244]</span>
          </p>
        </div>
      </div>
    );
  }

  // Fallback for settings if not loaded yet but authenticated
  const currentSettings = settings || {
    app_name: 'SGP-B',
    institution_name: 'Operaciones Chimpay',
    dashboard_title: 'Dashboard Operativo',
    dashboard_subtitle: 'Cargando...',
    logo_url: ''
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AnimatePresence mode="wait">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} settings={currentSettings} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <Route 
              path="/*" 
              element={
                <AppLayout onLogout={handleLogout} settings={currentSettings} user={user}>
                  <Routes>
                    <Route path="/dashboard" element={<Home settings={currentSettings} />} />
                    <Route path="/ajustes" element={<SettingsPage settings={currentSettings} onUpdate={fetchSettings} />} />
                    
                    <Route path="/incidencias" element={<Incidencias settings={currentSettings} />} />
                    <Route path="/personal" element={<Personal />} />
                    <Route path="/flota" element={<Flota />} />
                    <Route path="/pagos" element={<Pagos />} />
                    <Route path="/cancha" element={<Cancha />} />
                    <Route path="/guardia" element={<Guardia />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/subsidios" element={<Subsidios />} />
                    <Route path="/mapa" element={<Mapa />} />
                    
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              } 
            />
          )}
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
