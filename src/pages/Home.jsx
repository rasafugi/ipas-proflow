import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, BrainCircuit, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  // 🌟 改為儲存完整的玩家資料，而不只是布林值
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ipas_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAction = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-y-auto font-sans">
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-wider">
          iPAS ProFlow
        </div>
        
        {/* 🌟 頂部右側區塊：動態顯示大頭貼或登入按鈕 */}
        {currentUser ? (
          <div 
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex items-center justify-center hover:opacity-80 transition-all hover:scale-105"
            title="返回專屬大廳"
          >
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="My Avatar" 
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {currentUser.nickname.charAt(0)}
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            className="text-slate-300 hover:text-white font-medium transition-colors px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-full"
          >
            登入 / 註冊
          </button>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            掌握 AI 趨勢 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              一站式認證模擬考場
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            專為「iPAS 人工智慧應用規劃師」打造。透過真實考古題、即時排行與數據追蹤，助您輕鬆考取國家級黃金證照。
          </p>
          
          <button 
            onClick={handleAction}
            className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
          >
            {currentUser ? '進入專屬大廳' : '展開挑戰'} <ChevronRight size={24} />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-left hover:bg-slate-800 transition-colors">
            <div className="w-14 h-14 bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 text-blue-400"><BrainCircuit size={32} /></div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">官方精選題庫</h3>
            <p className="text-slate-400 leading-relaxed">雲端同步收錄最完整的 iPAS 官方考古題，並提供詳細解析，讓你知其然也知其所以然。</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-left hover:bg-slate-800 transition-colors">
            <div className="w-14 h-14 bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 text-purple-400"><Rocket size={32} /></div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">個人戰績分析</h3>
            <p className="text-slate-400 leading-relaxed">專屬的個人儀表板，透過資料視覺化折線圖，完美追蹤你每一次測驗的進步軌跡。</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-left hover:bg-slate-800 transition-colors">
            <div className="w-14 h-14 bg-green-900/50 rounded-xl flex items-center justify-center mb-6 text-green-400"><ShieldCheck size={32} /></div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">即時英雄榜</h3>
            <p className="text-slate-400 leading-relaxed">與各方高手同台競技！公開的即時排行榜系統，激發你的學習鬥志，勇奪榜首榮耀。</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}