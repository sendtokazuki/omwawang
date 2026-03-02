import React, { useState, useEffect } from 'react';
import { supabase, Medication } from '../supabase';
import { Pill, Plus, Trash2, Package, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { differenceInDays } from 'date-fns';

export function MedicationManager() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    initial_stock: '',
    unit: 'Tablet',
    dosage_per_day: '1'
  });

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name');
      if (error) throw error;
      setMeds(data || []);
    } catch (err) {
      console.error('Error fetching meds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('medications').insert([{
        name: newMed.name,
        initial_stock: parseFloat(newMed.initial_stock),
        unit: newMed.unit,
        dosage_per_day: parseFloat(newMed.dosage_per_day),
        created_at: new Date().toISOString() // Reset start date to now
      }]);
      if (error) throw error;
      setNewMed({ name: '', initial_stock: '', unit: 'Tablet', dosage_per_day: '1' });
      setIsAdding(false);
      fetchMeds();
    } catch (err) {
      alert('Gagal menambah obat. Pastikan tabel "medications" sudah dibuat dengan kolom "initial_stock".');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus obat ini dari daftar?')) return;
    await supabase.from('medications').delete().eq('id', id);
    fetchMeds();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Pill className="w-6 h-6 text-indigo-600" />
          Stok Obat Otomatis
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah/Update Stok
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Obat</label>
              <input 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newMed.name}
                onChange={e => setNewMed({...newMed, name: e.target.value})}
                placeholder="Contoh: Amlodipine"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Jumlah Stok Baru</label>
                <input 
                  required
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newMed.initial_stock}
                  onChange={e => setNewMed({...newMed, initial_stock: e.target.value})}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Satuan</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newMed.unit}
                  onChange={e => setNewMed({...newMed, unit: e.target.value})}
                >
                  <option>Tablet</option>
                  <option>Kapsul</option>
                  <option>Strip</option>
                  <option>Botol</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Dosis per Hari (Misal: 2x sehari = isi 2)</label>
            <input 
              required
              type="number"
              step="0.1"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newMed.dosage_per_day}
              onChange={e => setNewMed({...newMed, dosage_per_day: e.target.value})}
              placeholder="2"
            />
          </div>
          <p className="text-[10px] text-slate-400 italic">Menyimpan akan mereset hitungan sisa stok mulai dari hari ini.</p>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Simpan Stok</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : meds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400">Belum ada obat yang dipantau.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meds.map(med => {
            const daysPassed = differenceInDays(new Date(), new Date(med.created_at));
            const currentStock = Math.max(0, med.initial_stock - (daysPassed * med.dosage_per_day));
            const daysLeft = currentStock > 0 ? Math.floor(currentStock / med.dosage_per_day) : 0;
            const isLow = daysLeft <= 3;

            return (
              <div key={med.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    isLow ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                  )}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{med.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-lg font-black",
                        currentStock === 0 ? "text-rose-500" : "text-slate-700"
                      )}>{currentStock}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{med.unit} sisa</span>
                      <span className="text-slate-200">|</span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        isLow ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {currentStock > 0 ? `± ${daysLeft} hari lagi` : 'Habis!'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(med.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
        <RefreshCw className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-800 leading-relaxed">
          <strong>Cara Kerja:</strong> Aplikasi menghitung sisa obat secara otomatis berdasarkan tanggal Anda memasukkan stok dan dosis harian. Anda tidak perlu mencatat setiap kali minum obat. Cukup perbarui jumlahnya jika Anda membeli stok baru.
        </p>
      </div>
    </div>
  );
}
