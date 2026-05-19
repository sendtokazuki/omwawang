import React, { useState, useEffect } from 'react';
import { supabase, Vehicle } from '../supabase';
import { Car, Plus, Trash2, Settings, AlertCircle, Loader2, RefreshCw, Gauge } from 'lucide-react';
import { cn } from '../lib/utils';

export function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plate_number: '',
    current_odo: '',
    oil_change_interval: '2000'
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('name');
      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const odoValue = parseFloat(newVehicle.current_odo) || 0;
      const { error } = await supabase.from('vehicles').insert([{
        name: newVehicle.name,
        plate_number: newVehicle.plate_number || null,
        current_odo: odoValue,
        last_oil_change_odo: odoValue,
        oil_change_interval: parseFloat(newVehicle.oil_change_interval) || 2000,
      }]);
      if (error) throw error;
      setNewVehicle({ name: '', plate_number: '', current_odo: '', oil_change_interval: '2000' });
      setIsAdding(false);
      fetchVehicles();
    } catch (err) {
      alert('Gagal menambah kendaraan. Pastikan tabel "vehicles" sudah dibuat di Supabase.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kendaraan ini? Semua data log terkait akan ikut terhapus.')) return;
    await supabase.from('vehicles').delete().eq('id', id);
    fetchVehicles();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Car className="w-6 h-6 text-indigo-600" />
          Pengaturan Kendaraan
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Kendaraan
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Kendaraan</label>
              <input 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newVehicle.name}
                onChange={e => setNewVehicle({...newVehicle, name: e.target.value})}
                placeholder="Contoh: Honda Vario"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nomor Plat (Opsional)</label>
              <input 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newVehicle.plate_number}
                onChange={e => setNewVehicle({...newVehicle, plate_number: e.target.value})}
                placeholder="Contoh: B 1234 ABC"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Odometer Saat Ini (KM)</label>
              <input 
                required
                type="number"
                step="any"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newVehicle.current_odo}
                onChange={e => setNewVehicle({...newVehicle, current_odo: e.target.value})}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Interval Ganti Oli (KM)</label>
              <input 
                required
                type="number"
                step="any"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newVehicle.oil_change_interval}
                onChange={e => setNewVehicle({...newVehicle, oil_change_interval: e.target.value})}
                placeholder="2000"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400">Belum ada kendaraan yang terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(v => {
            const distanceSinceLastOil = v.current_odo - v.last_oil_change_odo;
            const remaining = v.oil_change_interval - distanceSinceLastOil;
            const isCritical = remaining <= 200;
            const isLate = remaining < 0;

            return (
              <div key={v.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{v.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{v.plate_number || 'Tanpa Plat'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                   <div className="space-y-1">
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Odometer Total</p>
                     <p className="text-lg font-black text-slate-700">{v.current_odo.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">KM</span></p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jarak Sejak Oli</p>
                     <p className="text-lg font-black text-slate-700">{distanceSinceLastOil.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">KM</span></p>
                   </div>
                </div>

                <div className={cn(
                  "p-3 rounded-2xl flex items-center gap-3",
                  isLate ? "bg-rose-50 border border-rose-100" : isCritical ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    isLate ? "bg-rose-100 text-rose-600" : isCritical ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Ganti Oli</p>
                    <p className={cn(
                      "text-xs font-black",
                      isLate ? "text-rose-600" : isCritical ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {isLate ? `Telat ${Math.abs(remaining).toFixed(1)} KM!` : isCritical ? `Hampir Waktu! Sisa ${remaining.toFixed(1)} KM` : `Sisa ${remaining.toFixed(1)} KM lagi`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
        <Gauge className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-800 leading-relaxed">
          <strong>Tips:</strong> Aplikasi ini menghitung sisa jarak menuju ganti oli berikutnya berdasarkan interval yang Anda tentukan. Pastikan untuk mencatat log odometer secara berkala.
        </p>
      </div>
    </div>
  );
}
