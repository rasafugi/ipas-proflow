import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Activity, LogOut, User, Home } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('ipas_user');
    if (!savedUser) {
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setCurrentUser(parsedUser);
    
    fetchLeaderboard();
    fetchMyRecords(parsedUser.user_code);
  }, [navigate]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/leaderboard");
      const data = await res.json();
      if (data.status === "success") setLeaderboard(data.data);
    } catch (error) {
      console.error("無法取得排行榜", error);
    }
  };

  const fetchMyRecords = async (code) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/my_records/${code}`);
      const data = await res.json();
      if (data.status === "success") setMyRecords(data.data);
    } catch (error) {
      console.error("無法取得個人戰績", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ipas_user');
    navigate('/'); 
  };

  if (!currentUser) return null; 

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        {/* 🌟 頂部歡迎列：加入大頭貼顯示邏輯 */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-5">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="My Avatar" 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {currentUser.nickname.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">歡迎回來，{currentUser.nickname}！</h1>
              <p className="text-slate-400 text-sm font-mono mt-1">ID: {currentUser.user_code}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/')} 
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center justify-center"
              title="返回首頁"
            >
              <Home size={20} />
            </button>
            <button onClick={() => navigate('/test')} className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-transform hover:scale-105 active:scale-95">
              <Play size={20} /> 開始測驗
            </button>
            <button onClick={handleLogout} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center justify-center" title="登出">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* 數據展現面板 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="flex border-b border-slate-700">
            <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 py-5 flex items-center justify-center gap-2 font-bold transition-colors text-lg ${activeTab === 'leaderboard' ? 'bg-slate-700/50 text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Trophy size={20} /> 英雄榜 Top 10
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-5 flex items-center justify-center gap-2 font-bold transition-colors text-lg ${activeTab === 'history' ? 'bg-slate-700/50 text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Activity size={20} /> 我的成長軌跡
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                {leaderboard.length === 0 ? <p className="text-center text-slate-400 py-10">目前無人挑戰，搶下首殺吧！</p> : 
                  leaderboard.map((player, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-4">
                        {/* 排名徽章 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-yellow-500 text-yellow-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'}`}>
                          {index + 1}
                        </div>
                        
                        {/* 🌟 排行榜大頭貼 */}
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
                  ))
                }
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {myRecords.length === 0 ? (
                  <p className="text-center text-slate-400 py-20 text-lg">您還沒有任何測驗紀錄，點擊右上方開始您的第一次挑戰！</p>
                ) : (
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
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}