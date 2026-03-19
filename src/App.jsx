import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// 引入我們即將建立的各個頁面
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TestEngine from './components/TestEngine';

// 封裝測驗引擎：讓它能適應路由，並自動讀取 localStorage
function TestRouteWrapper() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('ipas_user');
  
  // 防呆機制：如果沒登入想偷跑進考場，直接踢回登入頁
  if (!savedUser) {
    return <Navigate to="/auth" />;
  }
  
  const user = JSON.parse(savedUser);
  // onExit 觸發時，透過路由導航回 Dashboard
  return <TestEngine userCode={user.user_code} onExit={() => navigate('/dashboard')} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test" element={<TestRouteWrapper />} />
        
        {/* 捕捉所有打錯的網址，一律導回首頁 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}