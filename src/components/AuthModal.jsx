import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Image as ImageIcon } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  // 控制目前是「登入」還是「註冊」模式
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', avatar: '' });

  // 核心邏輯：生成 8 碼隨機 ID (包含大寫字母與數字)
  const generateUserId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginMode) {
      console.log("模擬登入送出資料:", formData);
      onLoginSuccess(); // 通知 App.jsx 登入成功
      onClose();        // 關閉視窗
    } else {
      const newUserId = generateUserId();
      console.log(`模擬註冊送出資料:`, formData, `\n生成的 8 碼 ID: ${newUserId}`);
      alert(`🎉 註冊成功！\n您的專屬 iPAS ID 為：${newUserId}`);
      onLoginSuccess(); // 註冊完自動登入
      onClose();        // 關閉視窗
    }
  };

  return (
    // AnimatePresence 確保視窗關閉時也能播放離場動畫
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-slate-700"
          >
            {/* 右上角關閉按鈕 */}
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              {isLoginMode ? '歡迎回來' : '建立新帳號'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 只有註冊模式才顯示姓名與頭像欄位 */}
              {!isLoginMode && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input type="text" name="name" placeholder="姓名" required onChange={handleChange}
                           className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input type="text" name="avatar" placeholder="頭像網址 (選填)" onChange={handleChange}
                           className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input type="email" name="email" placeholder="信箱" required onChange={handleChange}
                       className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input type="password" name="password" placeholder="密碼" required onChange={handleChange}
                       className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <button type="submit"
                      className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg transition-all active:scale-95">
                {isLoginMode ? '登入' : '註冊'}
              </button>
            </form>

            {/* 切換登入/註冊模式的按鈕 */}
            <p className="text-slate-400 text-center mt-6">
              {isLoginMode ? '還沒有帳號嗎？' : '已經有帳號了？'}
              <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-400 hover:text-blue-300 ml-2 font-medium">
                {isLoginMode ? '立即註冊' : '登入'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}