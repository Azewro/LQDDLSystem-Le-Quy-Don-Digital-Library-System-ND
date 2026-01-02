
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'T2', count: 120 },
  { name: 'T3', count: 350 },
  { name: 'T4', count: 420 },
  { name: 'T5', count: 300 },
  { name: 'T6', count: 500 },
  { name: 'T7', count: 150 },
  { name: 'CN', count: 80 },
];

const LibraryStats: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Lượt đọc trong tuần</h2>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs tuần trước</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12}}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 4 ? '#4f46e5' : '#e2e8f0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Tổng lượt đọc</p>
          <p className="text-xl font-bold text-slate-800">1,920</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Thành viên mới</p>
          <p className="text-xl font-bold text-slate-800">48</p>
        </div>
      </div>
    </div>
  );
};

export default LibraryStats;
