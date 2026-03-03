import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Activity, Droplets, Heart, Thermometer, Pill, Plus, X, Wind } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecordFormProps {
  onSuccess: () => void;
}

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    blood_sugar: '',
    saturation: '',
    pulse: '',
    temperature: '',
    medications: '',
    recorded_at: '',
    timing: 'Sesudah Makan' as 'Sebelum Makan' | 'Sesudah Makan'
  });

  // Set current time when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Adjust for local timezone offset to get YYYY-MM-DDTHH:mm format for input
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
      
      setFormData(prev => ({
        ...prev,
        recorded_at: localISOTime
      }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('health_records').insert([
        {
          systolic: formData.systolic ? parseInt(formData.systolic) : null,
          diastolic: formData.diastolic ? parseInt(formData.diastolic) : null,
          blood_sugar: formData.blood_sugar ? parseInt(formData.blood_sugar) : null,
          saturation: formData.saturation ? parseInt(formData.saturation) : null,
          pulse: formData.pulse ? parseInt(formData.pulse) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          medications: formData.medications || null,
          timing: formData.timing,
          recorded_at: new Date(formData.recorded_at).toISOString(),
        },
      ]);

      if (error) throw error;

      setFormData({
        systolic: '',
        diastolic: '',
        blood_sugar: '',
        saturation: '',
        pulse: '',
        temperature: '',
        medications: '',
        recorded_at: new Date().toISOString().slice(0, 16),
        timing: 'Sesudah Makan'
      });
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      console.error('Error saving record:', err);
      alert('Gagal menyimpan data. Pastikan tabel Supabase sudah dibuat dengan kolom "timing".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Tambah Catatan</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tensi (Sistolik)</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="120"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tensi (Diastolik)</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="80"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gula Darah</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="mg/dL"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.blood_sugar}
                      onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saturasi O2</label>
                  <div className="relative">
                    <Wind className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="%"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.saturation}
                      onChange={(e) => setFormData({ ...formData, saturation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suhu (°C)</label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nadi (BPM)</label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="72"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.pulse}
                      onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.recorded_at}
                    onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kondisi Makan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, timing: 'Sesudah Makan' })}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                      formData.timing === 'Sesudah Makan' 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Sesudah Makan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, timing: 'Sebelum Makan' })}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                      formData.timing === 'Sebelum Makan' 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Sebelum Makan
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Obat yang Diminum</label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    placeholder="Contoh: Paracetamol, Vitamin C..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
