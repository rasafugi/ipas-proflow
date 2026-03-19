import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Activity, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🌟 引入拆分出來的子元件
import LeaderboardTab from '../components/dashboard/LeaderboardTab';
import HistoryTab from '../components/dashboard/HistoryTab';

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
        
        {/* 頂部歡迎列 */}
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
            <button onClick={() => navigate('/')} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center justify-center" title="返回首頁">
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
              <Trophy size={20} /> 排行榜 Top 10
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-5 flex items-center justify-center gap-2 font-bold transition-colors text-lg ${activeTab === 'history' ? 'bg-slate-700/50 text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Activity size={20} /> 我的成長軌跡
            </button>
          </div>

          <div className="p-8">
            {/* 🌟 畫面渲染交給外包的子元件 */}
            {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
            {activeTab === 'history' && <HistoryTab myRecords={myRecords} />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}