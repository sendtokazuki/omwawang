import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Vehicle, OdoLog } from './supabase';
import { OdoLogForm } from './components/OdoLogForm';
import { LogHistory } from './components/LogHistory';
import { MileageCharts } from './components/MileageCharts';
import { VehicleManager } from './components/VehicleManager';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, LayoutDashboard, History as HistoryIcon, Activity, Share2, Car, Gauge } from 'lucide-react';
import { cn } from './lib/utils';
import { APP_VERSION } from './version';

type ViewMode = 'dashboard' | 'history' | 'vehicles';

export default function App() {
  const [logs, setLogs] = useState<OdoLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion && lastVersion !== APP_VERSION) {
      // New version detected, clear caches and reload
      const clearWork = async () => {
        // Clear all except maybe some critical non-cache settings if they existed
        localStorage.clear();
        
        // Clear service worker caches if available
        if ('caches' in window) {
          const cacheHeader = await caches.keys();
          await Promise.all(cacheHeader.map(name => caches.delete(name)));
        }

        // Add cookies clearing
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        localStorage.setItem('app_version', APP_VERSION);
        window.location.reload();
      };
      clearWork();
    } else {
      localStorage.setItem('app_version', APP_VERSION);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Vehicles
      const { data: vData } = await supabase.from('vehicles').select('*');
      setVehicles(vData || []);

      // Fetch Logs for the selected month/period instead of just one day to show some history
      // For history, we'll fetch more data.
      const start = startOfDay(subDays(selectedDate, 30)).toISOString();
      const end = endOfDay(selectedDate).toISOString();

      const { data, error } = await supabase
        .from('odo_logs')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => subDays(prev, -1));

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'OdoTrack Online',
        text: 'Pantau perawatan kendaraan Anda secara online.',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link aplikasi disalin ke clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col -gap-1">
              <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">OdoTrack</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">v{APP_VERSION}</span>
            </div>
          </div>
          <button 
            onClick={shareApp}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Date Selector only for context, maybe dashboard doesn't need it as much but history might */}
        {viewMode !== 'vehicles' && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={handlePrevDay}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-700">
                  {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: localeId })}
                </span>
              </div>

              <button 
                onClick={handleNextDay}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Memuat data kendaraan...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === 'dashboard' ? (
              <MileageCharts logs={logs} vehicles={vehicles} />
            ) : viewMode === 'history' ? (
              <LogHistory logs={logs} vehicles={vehicles} onDelete={fetchData} />
            ) : (
              <VehicleManager />
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex justify-around items-center z-40">
        <button 
          onClick={() => setViewMode('dashboard')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors px-4 py-1 rounded-2xl",
            viewMode === 'dashboard' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Tren</span>
        </button>
        <button 
          onClick={() => setViewMode('history')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors px-4 py-1 rounded-2xl",
            viewMode === 'history' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Riwayat</span>
        </button>
        <button 
          onClick={() => setViewMode('vehicles')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors px-4 py-1 rounded-2xl",
            viewMode === 'vehicles' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Car className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Kendaraan</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <OdoLogForm onSuccess={fetchData} />

      {/* Empty State */}
      {!loading && logs.length === 0 && viewMode !== 'vehicles' && (
        <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
             <Gauge className="w-8 h-8" />
          </div>
          <p className="text-slate-900 font-bold mb-2">Mulai Catat Perjalanan</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Klik tombol <span className="font-bold text-indigo-600">+</span> untuk mencatat odometer kendaraan Anda dan memantau jadwal ganti oli.
          </p>
        </div>
      )}
    </div>
  );
}
