import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, PlayCircle, Trophy, BarChart2, ChevronRight } from 'lucide-react';

export default function DashboardLayout({ onReturnHome, onStartTest }) {
  const [activeTab, setActiveTab] = useState('test');

  // 模擬排行榜資料
  const mockRankings = [
    { id: 1, name: 'AI_Master_99', rate: '98%', score: 12500, avatar: '🤖' },
    { id: 2, name: '你的名字', rate: '92%', score: 10200, avatar: '👤' },
    { id: 3, name: 'DataNinja', rate: '88%', score: 8900, avatar: '🥷' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="h-screen w-screen overflow-hidden bg-slate-900 text-white flex flex-col"
    >
      {/* 頂部導覽列 (Header) */}
      <header className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <button 
          onClick={onReturnHome}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <Home size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">返回首頁</span>
        </button>
        
        <div 
          onClick={() => alert("彈出 -> 編輯姓名與頭像的 Modal")}
          className="flex items-center gap-3 cursor-pointer group"
          title="編輯個人資料"
        >
          <span className="text-slate-300 group-hover:text-white transition-colors font-medium">
            你的名字
          </span>
          <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-600 group-hover:border-blue-400 flex items-center justify-center transition-all shadow-lg">
            <User size={20} />
          </div>
        </div>
      </header>

      {/* 內容區域 */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
        
        {/* 標籤切換導覽 (Tabs) */}
        <div className="flex bg-slate-800 rounded-full p-1 mb-10 w-full max-w-md shadow-inner">
          {['test', 'achievements', 'rankings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 py-3 text-sm md:text-base font-semibold rounded-full z-10 transition-colors"
              style={{ color: activeTab === tab ? '#fff' : '#94a3b8' }}
            >
              {tab === 'test' && '📝 測驗'}
              {tab === 'achievements' && '🏆 成就'}
              {tab === 'rankings' && '📊 排名'}
              
              {/* Framer Motion: 平滑滑動的背景標籤 */}
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* 動態渲染分頁內容 */}
        <div className="w-full max-w-4xl relative">
          <AnimatePresence mode="wait">
            
            {/* 測驗分頁 */}
            {activeTab === 'test' && (
              <motion.div key="test" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center">
                <PlayCircle size={64} className="text-blue-500 mb-6" />
                <h2 className="text-3xl font-bold mb-4">iPAS 模擬測驗 (20題)</h2>
                <p className="text-slate-400 mb-8 max-w-lg leading-relaxed">
                  系統將從題庫中隨機抽取 20 題選擇題。測驗過程中可隨時返回修改答案，提交後將立即計算總分，並提供詳細的逐題解析。
                </p>
                <button onClick={onStartTest} className="flex items-center gap-2 py-4 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
                  開始作答 <ChevronRight size={24} />
                </button>
              </motion.div>
            )}

            {/* 成就分頁 */}
            {activeTab === 'achievements' && (
              <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center">
                  <Trophy size={40} className="text-yellow-500 mb-4" />
                  <span className="text-slate-400 text-sm">累積答對題數</span>
                  <span className="text-4xl font-extrabold mt-2">128</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center">
                  <BarChart2 size={40} className="text-green-500 mb-4" />
                  <span className="text-slate-400 text-sm">平均正確率</span>
                  <span className="text-4xl font-extrabold mt-2">92%</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-blue-900 bg-blue-900/20 flex flex-col items-center">
                  <div className="text-4xl mb-4">🎓</div>
                  <span className="text-blue-400 text-sm font-semibold">目前稱號</span>
                  <span className="text-2xl font-bold mt-2">AI 見習生</span>
                </div>
              </motion.div>
            )}

            {/* 排名分頁 */}
            {activeTab === 'rankings' && (
              <motion.div key="rankings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between text-slate-400 font-semibold text-sm">
                  <span>排名 / 使用者</span>
                  <span>正確率</span>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {mockRankings.map((user, index) => (
                    <div key={user.id} className={`p-6 flex items-center justify-between ${user.name === '你的名字' ? 'bg-blue-900/20' : ''}`}>
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-black ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-300' : 'text-amber-600'}`}>
                          #{index + 1}
                        </span>
                        <div className="text-2xl">{user.avatar}</div>
                        <span className="font-medium text-lg">{user.name}</span>
                      </div>
                      <span className="font-bold text-green-400 text-xl">{user.rate}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}