import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionCard({ currentQ, currentIndex, selectedAnswer, onSelectOption }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentIndex} 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }} 
        transition={{ duration: 0.2 }} 
        className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 md:p-12 shadow-2xl"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 leading-normal text-slate-100">
          {currentQ.question}
        </h2>
        <div className="space-y-4">
          {Object.entries(currentQ.options).map(([key, text]) => {
            const isSelected = selectedAnswer === key;
            return (
              <button
                key={key}
                onClick={() => onSelectOption(key)}
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
  );
}