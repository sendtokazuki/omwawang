import React, { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Activity, Droplets, Heart, Thermometer, Pill, Clock, Trash2, Loader2 } from 'lucide-react';
import { HealthRecord, supabase } from '../supabase';
import { cn } from '../lib/utils';

interface HistoryListProps {
  records: HealthRecord[];
  onDelete: () => void;
}

export function HistoryList({ records, onDelete }: HistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
            </div>

            <button
              onClick={() => handleDelete(record.id)}
              disabled={deletingId === record.id}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {deletingId === record.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
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
                  <Thermometer className={cn(
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
