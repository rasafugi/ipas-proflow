import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryTab({ myRecords }) {
  if (myRecords.length === 0) {
    return <p className="text-center text-slate-400 py-20 text-lg">您還沒有任何測驗紀錄，點擊右上方開始您的第一次挑戰！</p>;
  }

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={myRecords} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="created_at" stroke="#94a3b8" tick={{fontSize: 12}} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '12px' }} itemStyle={{ color: '#4ade80', fontWeight: 'bold' }} />
          <Line type="monotone" dataKey="score" name="測驗分數" stroke="#4ade80" strokeWidth={4} activeDot={{ r: 8, fill: '#4ade80', stroke: '#1e293b', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}