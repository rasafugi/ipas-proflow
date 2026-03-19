import React from 'react';
import { User } from 'lucide-react';

export default function LeaderboardTab({ leaderboard }) {
  if (leaderboard.length === 0) {
    return <p className="text-center text-slate-400 py-10">目前無人挑戰，搶下首殺吧！</p>;
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((player, index) => (
        <div key={index} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-4">
            {/* 排名徽章 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-yellow-500 text-yellow-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'}`}>
              {index + 1}
            </div>
            
            {/* 大頭貼 */}
            {player.avatar ? (
              <img src={player.avatar} alt={player.nickname} className="w-12 h-12 rounded-full object-cover border border-slate-600 shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                <User size={20} />
              </div>
            )}

            <div>
              <p className="font-bold text-slate-100 text-lg">{player.nickname}</p>
              <p className="text-sm text-slate-500">{player.created_at}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">{player.score} <span className="text-sm font-normal text-slate-500">分</span></div>
        </div>
      ))}
    </div>
  );
}