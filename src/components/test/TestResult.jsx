import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestResult({ score, testQuestions, answers, onExit }) {
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