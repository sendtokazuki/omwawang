import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type HealthRecord = {
  id: string;
  created_at: string;
  recorded_at: string;
  systolic: number | null;
  diastolic: number | null;
  blood_sugar: number | null;
  saturation: number | null;
  pulse: number | null;
  temperature: number | null;
  medications: string | null;
  timing: 'Sebelum Makan' | 'Sesudah Makan' | null;
};

export type Medication = {
  id: string;
  name: string;
  initial_stock: number;
  unit: string;
  dosage_per_day: number;
  timing: 'Sebelum Makan' | 'Sesudah Makan';
  created_at: string;
};
