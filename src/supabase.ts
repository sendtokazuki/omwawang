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

export type Vehicle = {
  id: string;
  name: string;
  plate_number: string | null;
  current_odo: number;
  last_oil_change_odo: number;
  oil_change_interval: number;
  created_at: string;
};

export type OdoLog = {
  id: string;
  vehicle_id: string;
  odo_reading: number;
  recorded_at: string;
  notes: string | null;
  is_oil_change: boolean;
};
