import React, { useEffect, useState, useCallback } from 'react';
import { supabase, HealthRecord } from './supabase';
import { RecordForm } from './components/RecordForm';
import { HistoryList } from './components/HistoryList';
import { HealthCharts } from './components/HealthCharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, LayoutDashboard, History as HistoryIcon, Activity, Share2 } from 'lucide-react';
import { cn } from './lib/utils';

type ViewMode = 'dashboard' | 'history';
type Period = 'day' | 'week';

export default function App() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [period, setPeriod] = useState<Period>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      let start, end;
      if (period === 'day') {
        start = startOfDay(selectedDate).toISOString();
        end = endOfDay(selectedDate).toISOString();
      } else {
        start = startOfDay(subDays(selectedDate, 7)).toISOString();
        end = endOfDay(selectedDate).toISOString();
      }

      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .gte('recorded_at', start)
        .lte('recorded_at', end)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, period]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => subDays(prev, -1));

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'HealthTrack Online',
        text: 'Pantau kesehatan keluarga secara online.',
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
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight">HealthTrack</h1>
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
        {/* Date Selector */}
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

          {viewMode === 'dashboard' && (
            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
              <button
                onClick={() => setPeriod('day')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  period === 'day' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Harian
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  period === 'week' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Mingguan
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Memuat data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === 'dashboard' ? (
              <HealthCharts records={records} />
            ) : (
              <HistoryList records={records} />
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-center gap-12 z-40">
        <button 
          onClick={() => setViewMode('dashboard')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            viewMode === 'dashboard' ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ringkasan</span>
        </button>
        <button 
          onClick={() => setViewMode('history')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            viewMode === 'history' ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Riwayat</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <RecordForm onSuccess={fetchRecords} />

      {/* Instructions for first-time users */}
      {!loading && records.length === 0 && (
        <div className="max-w-md mx-auto mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
          <p className="text-indigo-900 font-medium mb-2">Belum ada data hari ini</p>
          <p className="text-indigo-600 text-sm">
            Klik tombol <span className="font-bold">+</span> di pojok kanan bawah untuk menambah catatan kesehatan baru.
          </p>
        </div>
      )}
    </div>
  );
}
