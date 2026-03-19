import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, ArrowLeft, Mail, Lock, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  React.useEffect(() => {
    const savedUser = localStorage.getItem('ipas_user');
    if (savedUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // UI 狀態：切換登入或註冊
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 表單資料狀態
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    avatar: '' // 存放 Base64 字串
  });

  // 處理輸入框變化
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📸 處理大頭貼上傳並轉換為 Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 限制檔案大小為 1MB
    if (file.size > 1024 * 1024) {
      alert("圖片太大了！請上傳小於 1MB 的照片。");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // 🚀 提交表單 (登入 or 註冊)
  const handleSubmit = async () => {
    if (!formData.email || !formData.password) return alert("信箱與密碼必填！");
    if (!isLoginMode && !formData.nickname) return alert("請輸入您的姓名/暱稱！");
    
    setIsLoading(true);
    const endpoint = isLoginMode ? "/api/login" : "/api/register";
    
    // 如果是註冊，生成新的 8 碼 ID
    const payload = { ...formData };
    if (!isLoginMode) {
      payload.user_code = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        // 根據登入或註冊，整理要存入瀏覽器的玩家資料
        const userData = isLoginMode 
          ? result.data 
          : { user_code: payload.user_code, nickname: formData.nickname, email: formData.email, avatar: formData.avatar };
        
        localStorage.setItem('ipas_user', JSON.stringify(userData));
        navigate('/dashboard');
      } else {
        alert(result.detail || "操作失敗，請檢查資料！");
      }
    } catch (error) {
      alert("無法連線到伺服器");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> 返回首頁
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 sm:p-10 rounded-3xl shadow-2xl">
        
        {/* 標題區 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{isLoginMode ? '登入系統' : '建立帳號'}</h2>
          <p className="text-slate-400">
            {isLoginMode ? '歡迎回來，準備好迎接今天的挑戰了嗎？' : '加入 iPAS ProFlow，開啟你的認證之路。'}
          </p>
        </div>

        <div className="space-y-5">
          {/* 🌟 只有在「註冊模式」才會顯示大頭貼與姓名欄位 */}
          <AnimatePresence>
            {!isLoginMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5 overflow-hidden">
                
                {/* 大頭貼上傳區塊 */}
                <div className="flex flex-col items-center justify-center mb-4">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-slate-600 bg-slate-900/50 hover:bg-slate-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all group relative"
                  >
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center group-hover:text-blue-400">
                        <Upload size={24} className="mb-1" />
                        <span className="text-xs font-semibold">上傳照片</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                {/* 姓名欄位 */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="姓名或稱號" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 信箱欄位 */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="電子信箱" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          {/* 密碼欄位 */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="密碼" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all" />
          </div>

          {/* 送出按鈕 */}
          <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4">
            {isLoading ? '處理中...' : isLoginMode ? '立即登入' : '註冊帳號'}
          </button>
        </div>

        {/* 切換模式按鈕 */}
        <div className="mt-6 text-center">
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">
            {isLoginMode ? "還沒有帳號？點此註冊" : "已經有帳號了？返回登入"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}