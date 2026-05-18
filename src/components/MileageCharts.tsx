import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { format } from 'date-fns';
import { OdoLog, Vehicle } from '../supabase';

interface MileageChartsProps {
  logs: OdoLog[];
  vehicles: Vehicle[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="text-sm font-bold text-slate-900">
                {entry.value} KM
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function MileageCharts({ logs, vehicles }: MileageChartsProps) {
  if (logs.length === 0) return null;

  // Group logs by vehicle
  return (
    <div className="space-y-8">
      {vehicles.map(v => {
        const vehicleLogs = [...logs]
          .filter(l => l.vehicle_id === v.id)
          .reverse()
          .map(l => ({
            label: format(new Date(l.recorded_at), 'dd/MM HH:mm'),
            odo: l.odo_reading,
            name: v.name
          }));

        if (vehicleLogs.length < 2) return null;

        return (
          <div key={v.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Tren Jarak Tempuh: {v.name}</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vehicleLogs} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorOdo-${v.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis width={40} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="odo" name="Jarak Tempuh" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill={`url(#colorOdo-${v.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
