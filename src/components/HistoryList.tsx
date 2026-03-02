import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Activity, Droplets, Heart, Thermometer, Pill, Clock } from 'lucide-react';
import { HealthRecord } from '../supabase';

interface HistoryListProps {
  records: HealthRecord[];
}

export function HistoryList({ records }: HistoryListProps) {
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
        <div key={record.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {record.systolic && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Activity className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tensi</p>
                  <p className="text-sm font-bold text-slate-700">{record.systolic}/{record.diastolic}</p>
                </div>
              </div>
            )}
            {record.blood_sugar && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Droplets className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gula Darah</p>
                  <p className="text-sm font-bold text-slate-700">{record.blood_sugar} <span className="text-[10px] font-normal">mg/dL</span></p>
                </div>
              </div>
            )}
            {record.saturation && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saturasi</p>
                  <p className="text-sm font-bold text-slate-700">{record.saturation}%</p>
                </div>
              </div>
            )}
            {record.pulse && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Heart className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nadi</p>
                  <p className="text-sm font-bold text-slate-700">{record.pulse} <span className="text-[10px] font-normal">BPM</span></p>
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
