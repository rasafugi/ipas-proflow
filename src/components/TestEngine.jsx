import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

// 引入拆分出來的子元件
import TestResult from './test/TestResult';
import QuestionCard from './test/QuestionCard';

export default function TestEngine({ onExit, userCode }) {
  const [testQuestions, setTestQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState({}); 
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [score, setScore] = useState(0); 

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // 🌟 修正：套用環境變數，並加上隨機抽題的正確路徑
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/random`);
        const data = await response.json();
        if (data.status === "success") setTestQuestions(data.data);
      } catch (error) {
        console.error("🔴 考卷下載失敗：", error);
        alert("無法連線到題庫伺服器！");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const totalQuestions = testQuestions.length;

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-300 animate-pulse">正在為您生成專屬試卷...</h2>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-300 mb-4">系統題庫維護中，請稍後再試。</h2>
        <button onClick={onExit} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full">返回大廳</button>
      </div>
    );
  } 

  const handleSubmit = async () => {
    let correctCount = 0;
    testQuestions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correctCount++;
    });
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    try {
      // 🌟 修正：把原本寫死的 127.0.0.1 換成環境變數
      await fetch(`${import.meta.env.VITE_API_URL}/api/submit_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_code: userCode,
          score: finalScore,
          correct_count: correctCount,
          total_questions: totalQuestions
        })
      });
    } catch (error) {
      console.error("🔴 API 連線失敗：", error);
    }

    setScore(finalScore);
    setShowConfirm(false);
    setIsSubmitted(true);
  };

  // --- 畫面 A：結算畫面 (外包給 TestResult) ---
  if (isSubmitted) {
    return <TestResult score={score} testQuestions={testQuestions} answers={answers} onExit={onExit} />;
  }

  // --- 畫面 B：測驗進行中 ---
  const currentQ = testQuestions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white flex flex-col relative">
      {/* 提交確認視窗 */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
              <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">確定要交卷嗎？</h3>
              <p className="text-slate-400 mb-8">交卷後將無法修改答案，並會立即計算成績。</p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">取消</button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">確認送出</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="p-6 bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> <span className="hidden sm:inline">暫停並離開</span>
          </button>
          <div className="font-mono text-xl font-bold text-blue-400">
            Question {currentIndex + 1} <span className="text-slate-500 text-base">/ {totalQuestions}</span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-blue-600" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex justify-center items-center p-6">
        <div className="w-full max-w-4xl">
          {/* 🌟 單一題目卡片外包給 QuestionCard */}
          <QuestionCard 
            currentQ={currentQ} 
            currentIndex={currentIndex} 
            selectedAnswer={answers[currentIndex]} 
            onSelectOption={(key) => setAnswers({ ...answers, [currentIndex]: key })} 
          />
        </div>
      </main>

      <footer className="p-6 bg-slate-900 z-10">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${currentIndex === 0 ? 'opacity-0 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
            <ChevronLeft size={20} /> 上一題
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold shadow-[0_0_15px_rgba(22,163,74,0.4)] transition-all hover:scale-105 active:scale-95">
              交卷送出 <CheckCircle size={20} />
            </button>
          ) : (
            <button onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
              下一題 <ChevronRight size={20} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}