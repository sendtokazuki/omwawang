import React, { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Activity, Droplets, Heart, Thermometer, Pill, Clock, Trash2, Loader2, Share2, Wind } from 'lucide-react';
import { HealthRecord, supabase } from '../supabase';
import { cn } from '../lib/utils';

interface HistoryListProps {
  records: HealthRecord[];
  onDelete: () => void;
}

export function HistoryList({ records, onDelete }: HistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleShare = (record: HealthRecord) => {
    const dateStr = format(new Date(record.recorded_at), 'EEEE, dd MMM yyyy - HH:mm', { locale: localeId });
    
    let message = `*Laporan Kesehatan Pak Wawang*\n`;
    message += `Waktu: ${dateStr}\n`;
    if (record.timing) message += `Kondisi: ${record.timing}\n`;
    message += `\n`;
    
    if (record.systolic) {
      const status = record.systolic >= 140 || (record.diastolic && record.diastolic >= 90) ? "Tinggi" : 
                     record.systolic >= 120 || (record.diastolic && record.diastolic >= 80) ? "Pre-Hipertensi" : "Normal";
      message += `• Tensi: ${record.systolic}/${record.diastolic} mmHg (${status})\n`;
    }
    
    if (record.blood_sugar) {
      const status = record.blood_sugar >= 140 ? "Tinggi" : record.blood_sugar >= 100 ? "Pre-Diabetes" : "Normal";
      message += `• Gula Darah: ${record.blood_sugar} mg/dL (${status})\n`;
    }
    
    if (record.saturation) {
      const status = record.saturation < 95 ? "Rendah" : "Normal";
      message += `• Saturasi O2: ${record.saturation}% (${status})\n`;
    }

    if (record.temperature) {
      const status = record.temperature >= 37.5 ? "Demam" : record.temperature < 36 ? "Hipotermia" : "Normal";
      message += `• Suhu: ${record.temperature} °C (${status})\n`;
    }
    
    if (record.pulse) {
      message += `• Nadi: ${record.pulse} BPM\n`;
    }
    
    if (record.medications) {
      message += `• Obat: ${record.medications}\n`;
    }
    
    message += `\n_Dikirim via HealthTrack Online_`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onDelete();
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Gagal menghapus data.');
    } finally {
      setDeletingId(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-400">Belum ada catatan kesehatan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">
                {format(new Date(record.recorded_at), 'HH:mm', { locale: localeId })}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {format(new Date(record.recorded_at), 'dd MMM yyyy', { locale: localeId })}
              </span>
              {record.timing && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  record.timing === 'Sesudah Makan' ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                )}>
                  {record.timing}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => handleShare(record)}
                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Bagikan ke WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(record.id)}
                disabled={deletingId === record.id}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
              >
                {deletingId === record.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {record.systolic && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  record.systolic >= 140 || (record.diastolic && record.diastolic >= 90) ? "bg-rose-100" : 
                  record.systolic >= 120 || (record.diastolic && record.diastolic >= 80) ? "bg-amber-100" : "bg-emerald-100"
                )}>
                  <Activity className={cn(
                    "w-4 h-4",
                    record.systolic >= 140 || (record.diastolic && record.diastolic >= 90) ? "text-rose-600" : 
                    record.systolic >= 120 || (record.diastolic && record.diastolic >= 80) ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tensi</p>
                  <p className={cn(
                    "text-sm font-bold",
                    record.systolic >= 140 || (record.diastolic && record.diastolic >= 90) ? "text-rose-600" : "text-slate-700"
                  )}>
                    {record.systolic}/{record.diastolic}
                    {(record.systolic >= 140 || (record.diastolic && record.diastolic >= 90)) && <span className="ml-1 text-[8px] uppercase">! Tinggi</span>}
                  </p>
                </div>
              </div>
            )}
            {record.blood_sugar && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  record.blood_sugar >= 140 ? "bg-rose-100" : record.blood_sugar >= 100 ? "bg-amber-100" : "bg-emerald-100"
                )}>
                  <Droplets className={cn(
                    "w-4 h-4",
                    record.blood_sugar >= 140 ? "text-rose-600" : record.blood_sugar >= 100 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gula Darah</p>
                  <p className={cn(
                    "text-sm font-bold",
                    record.blood_sugar >= 140 ? "text-rose-600" : "text-slate-700"
                  )}>
                    {record.blood_sugar} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                    {record.blood_sugar >= 140 && <span className="ml-1 text-[8px] uppercase">! Tinggi</span>}
                  </p>
                </div>
              </div>
            )}
            {record.saturation && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  record.saturation < 95 ? "bg-rose-100" : "bg-blue-100"
                )}>
                  <Wind className={cn(
                    "w-4 h-4",
                    record.saturation < 95 ? "text-rose-600" : "text-blue-600"
                  )} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saturasi</p>
                  <p className={cn(
                    "text-sm font-bold",
                    record.saturation < 95 ? "text-rose-600" : "text-slate-700"
                  )}>
                    {record.saturation}%
                    {record.saturation < 95 && <span className="ml-1 text-[8px] uppercase">! Rendah</span>}
                  </p>
                </div>
              </div>
            )}
            {record.temperature && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  record.temperature >= 37.5 ? "bg-rose-100" : record.temperature < 36 ? "bg-amber-100" : "bg-emerald-100"
                )}>
                  <Thermometer className={cn(
                    "w-4 h-4",
                    record.temperature >= 37.5 ? "text-rose-600" : record.temperature < 36 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Suhu</p>
                  <p className={cn(
                    "text-sm font-bold",
                    record.temperature >= 37.5 ? "text-rose-600" : "text-slate-700"
                  )}>
                    {record.temperature} <span className="text-[10px] font-normal text-slate-400">°C</span>
                    {record.temperature >= 37.5 && <span className="ml-1 text-[8px] uppercase">! Demam</span>}
                  </p>
                </div>
              </div>
            )}
            {record.pulse && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  record.pulse > 100 || record.pulse < 60 ? "bg-amber-100" : "bg-emerald-100"
                )}>
                  <Heart className={cn(
                    "w-4 h-4",
                    record.pulse > 100 || record.pulse < 60 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nadi</p>
                  <p className="text-sm font-bold text-slate-700">{record.pulse} <span className="text-[10px] font-normal text-slate-400">BPM</span></p>
                </div>
              </div>
            )}
          </div>

          {record.medications && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-start gap-3">
              <Pill className="w-4 h-4 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Obat</p>
                <p className="text-sm text-slate-600 leading-relaxed">{record.medications}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
