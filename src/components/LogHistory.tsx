import React, { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Gauge, Clock, Trash2, Loader2, Share2, Clipboard, RefreshCw, Car } from 'lucide-react';
import { OdoLog, supabase, Vehicle } from '../supabase';
import { cn } from '../lib/utils';

interface LogHistoryProps {
  logs: OdoLog[];
  vehicles: Vehicle[];
  onDelete: () => void;
}

export function LogHistory({ logs, vehicles, onDelete }: LogHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (log: OdoLog) => {
    if (!window.confirm('Hapus log ini? Ini tidak akan mengupdate angka odometer total kendaraan secara otomatis.')) return;
    
    setDeletingId(log.id);
    try {
      const { error } = await supabase
        .from('odo_logs')
        .delete()
        .eq('id', log.id);

      if (error) throw error;
      onDelete();
    } catch (err) {
      console.error('Error deleting log:', err);
      alert('Gagal menghapus data.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = (log: OdoLog) => {
    const v = vehicles.find(veh => veh.id === log.vehicle_id);
    const dateStr = format(new Date(log.recorded_at), 'EEEE, dd MMM yyyy - HH:mm', { locale: localeId });
    
    let message = `*Laporan Odometer Kendaraan*\n`;
    message += `Kendaraan: ${v?.name || 'Unknown'} (${v?.plate_number || 'N/A'})\n`;
    message += `Waktu: ${dateStr}\n\n`;
    message += `• Jarak Tempuh: ${log.odo_reading} KM\n`;
    message += `• Jenis: ${log.is_oil_change ? 'Ganti Oli + Service' : 'Pencatatan Rutin'}\n`;
    if (log.notes) message += `• Catatan: ${log.notes}\n`;
    
    message += `\n_Dikirim via OdoTrack Online_`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-400">Belum ada riwayat pencatatan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const v = vehicles.find(veh => veh.id === log.vehicle_id);
        
        // Find the previous log for the SAME vehicle to calculate travel distance
        const prevLogForVehicle = logs.slice(index + 1).find(l => l.vehicle_id === log.vehicle_id);
        const distanceTraveled = prevLogForVehicle ? (log.odo_reading - prevLogForVehicle.odo_reading).toFixed(1) : null;

        return (
          <div key={log.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Car className="w-4 h-4" />
                  <span className="text-sm font-bold truncate max-w-[150px]">
                    {v?.name || 'Kendaraan Terhapus'}
                  </span>
                  <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full font-black uppercase text-indigo-700">
                    {v?.plate_number || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                   <Clock className="w-3 h-3" />
                   <span className="text-[10px] font-bold">
                    {format(new Date(log.recorded_at), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleShare(log)}
                  className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Bagikan ke WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(log)}
                  disabled={deletingId === log.id}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                >
                  {deletingId === log.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                       <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Odometer</p>
                      <p className="text-xl font-black text-slate-700">{log.odo_reading} <span className="text-xs font-normal text-slate-400">KM</span></p>
                    </div>
                 </div>
                 {log.is_oil_change && (
                   <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Ganti Oli</span>
                   </div>
                 )}
               </div>

               {distanceTraveled !== null && (
                 <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jarak Perjalanan Ini</span>
                    <span className="text-sm font-black text-indigo-600">+{distanceTraveled} KM</span>
                 </div>
               )}
            </div>

            {log.notes && (
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-start gap-3">
                <Clipboard className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Catatan</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{log.notes}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
