import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

export default function TestEngine({ onExit, userCode }) {
  
  const [testQuestions, setTestQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState({}); 
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [score, setScore] = useState(0); 

  // 🚀 組件一載入，立刻向後端索取專屬隨機考卷！
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/questions/random");
        const data = await response.json();
        if (data.status === "success") {
          setTestQuestions(data.data);
        }
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

  // --- 畫面 C：優雅的 Loading 等待畫面 ---
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-300 animate-pulse">正在為您生成專屬試卷...</h2>
      </div>
    );
  }

  // 防呆機制：如果沒抓到題目
  if (totalQuestions === 0) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-300 mb-4">系統題庫維護中，請稍後再試。</h2>
        <button onClick={onExit} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full">返回大廳</button>
      </div>
    );
  } 

  const handleSelectOption = (optionKey) => {
    setAnswers({ ...answers, [currentIndex]: optionKey });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
  let correctCount = 0;
  testQuestions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      correctCount++;
    }
  });
  // 計算滿分 100 分
  const finalScore = Math.round((correctCount / totalQuestions) * 100);

  // 🚀 終極串接：將成績發送到我們的 Python 伺服器
  try {
    const response = await fetch("http://127.0.0.1:8000/api/submit_test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_code: userCode, // 從 App 傳進來的專屬 ID
        score: finalScore,
        correct_count: correctCount,
        total_questions: totalQuestions
      })
    });

    if (response.ok) {
      console.log("✅ 成績已成功寫入 MySQL 資料庫！");
    }
  } catch (error) {
    console.error("🔴 API 連線失敗：", error);
  }

  setScore(finalScore);
  setShowConfirm(false);
  setIsSubmitted(true);
};

  // --- 畫面 A：測驗結果與詳解回顧 ---
  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen w-screen overflow-y-auto bg-slate-900 text-white p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">測驗結果</h2>
            <button onClick={onExit} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors font-medium">
              返回控制台
            </button>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700 shadow-2xl mb-10">
            <span className="text-slate-400 block mb-2">本次總分</span>
            <span className={`text-6xl font-black ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score}
            </span>
          </div>

          <div className="space-y-8">
            {testQuestions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    {isCorrect ? <CheckCircle className="text-green-500 shrink-0 mt-1" size={28} /> : <XCircle className="text-red-500 shrink-0 mt-1" size={28} />}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 leading-relaxed">
                        Q{index + 1}. {q.question}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pl-11">
                    {Object.entries(q.options).map(([key, text]) => {
                      let optionStyle = "bg-slate-900 border-slate-700 text-slate-400";
                      if (key === q.correctAnswer) optionStyle = "bg-green-900/30 border-green-500 text-green-300 ring-2 ring-green-500";
                      else if (key === userAnswer && !isCorrect) optionStyle = "bg-red-900/30 border-red-500 text-red-300 ring-2 ring-red-500";

                      return (
                        <div key={key} className={`p-4 rounded-lg border ${optionStyle} flex items-center`}>
                          <span className="font-bold mr-3">{key}.</span> {text}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 ml-11 rounded-r-lg">
                    <span className="text-blue-400 font-bold block mb-1">📝 官方詳解：</span>
                    {/* 顯示從 JSON 抓出來的真實解析 */}
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p> 
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // --- 畫面 B：測驗進行中 ---
  const currentQ = testQuestions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white flex flex-col relative">
      
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
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8 leading-normal text-slate-100">
                {currentQ.question}
              </h2>
              <div className="space-y-4">
                {Object.entries(currentQ.options).map(([key, text]) => {
                  const isSelected = answers[currentIndex] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center group ${
                        isSelected ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'}`}>
                        {key}
                      </span>
                      <span className={`text-lg ${isSelected ? 'text-blue-100' : 'text-slate-300'}`}>
                        {text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="p-6 bg-slate-900 z-10">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button onClick={handlePrev} disabled={currentIndex === 0} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${currentIndex === 0 ? 'opacity-0 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
            <ChevronLeft size={20} /> 上一題
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold shadow-[0_0_15px_rgba(22,163,74,0.4)] transition-all hover:scale-105 active:scale-95">
              交卷送出 <CheckCircle size={20} />
            </button>
          ) : (
            <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
              下一題 <ChevronRight size={20} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}