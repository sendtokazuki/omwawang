import React, { useState, useEffect } from 'react';
import { supabase, Vehicle } from '../supabase';
import { Plus, X, Gauge, Clipboard, Calendar, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface OdoLogFormProps {
  onSuccess: () => void;
}

export function OdoLogForm({ onSuccess }: OdoLogFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    odo_reading: '',
    notes: '',
    recorded_at: '',
    is_oil_change: false,
  });

  const fetchVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('*').order('name');
    setVehicles(data || []);
    if (data && data.length > 0 && !formData.vehicle_id) {
      setFormData(prev => ({ ...prev, vehicle_id: data[0].id }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, recorded_at: localISOTime }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id) {
       alert('Pilih kendaraan terlebih dahulu.');
       return;
    }

    setLoading(true);
    try {
      const odoValue = parseFloat(formData.odo_reading);
      
      // 1. Insert Log
      const { error: logError } = await supabase.from('odo_logs').insert([
        {
          vehicle_id: formData.vehicle_id,
          odo_reading: odoValue,
          notes: formData.notes || null,
          is_oil_change: formData.is_oil_change,
          recorded_at: new Date(formData.recorded_at).toISOString(),
        },
      ]);
      if (logError) throw logError;

      // 2. Update Vehicle current_odo and optionally last_oil_change_odo
      const updateData: any = { current_odo: odoValue };
      if (formData.is_oil_change) {
        updateData.last_oil_change_odo = odoValue;
      }

      const { error: updateError } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', formData.vehicle_id);
      
      if (updateError) throw updateError;

      setFormData({
        vehicle_id: vehicles[0]?.id || '',
        odo_reading: '',
        notes: '',
        recorded_at: new Date().toISOString().slice(0, 16),
        is_oil_change: false,
      });
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      console.error('Error saving odo log:', err);
      alert('Gagal menyimpan log. Pastikan tabel "odo_logs" sudah dibuat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50 md:bottom-8 md:right-8"
      >
        <Plus className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Catat Jarak Tempuh</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                 <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                 <p className="text-slate-600 font-medium whitespace-pre-line">
                   {"Tambahkan kendaraan terlebih dahulu\ndi menu Pengaturan."}
                 </p>
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                 >
                   Mengerti
                 </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pilih Kendaraan</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Angka Odometer (KM)</label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="number"
                      step="any"
                      placeholder="Contoh: 12500.5"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                      value={formData.odo_reading}
                      onChange={(e) => setFormData({ ...formData, odo_reading: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu Pencatatan</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="datetime-local"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 font-medium"
                      value={formData.recorded_at}
                      onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl flex items-center justify-between border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                       <RefreshCw className={cn("w-5 h-5", formData.is_oil_change && "animate-spin")} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-indigo-900 uppercase">Input Ganti Oli?</p>
                      <p className="text-[10px] text-indigo-700">Centang jika Anda baru ganti oli</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    className="w-6 h-6 accent-indigo-600"
                    checked={formData.is_oil_change}
                    onChange={(e) => setFormData({ ...formData, is_oil_change: e.target.checked })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catatan (Opsional)</label>
                  <div className="relative">
                    <Clipboard className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <textarea
                      placeholder="Contoh: Oli Yamalube, Service rutin..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] text-slate-700"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Log'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
