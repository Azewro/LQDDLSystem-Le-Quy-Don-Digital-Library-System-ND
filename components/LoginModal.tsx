
import React, { useState } from 'react';
import { X, Lock, Mail } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleDemoLogin = () => {
    onLogin({
      id: Math.random().toString(),
      name: role === 'student' ? 'Nguyễn Văn A' : 'Thầy Xuân Trường',
      role: role
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        <div className="bg-[#00a651] p-8 text-white relative">
          <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight uppercase">
            Đăng nhập
          </h2>
          <p className="text-emerald-50 text-sm mt-2 font-medium">Chào mừng bạn đến với Thư viện Lê Quý Đôn</p>
          <button onClick={onClose} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${role === 'student' ? 'bg-white shadow-sm text-[#00a651]' : 'text-slate-500'}`}
            >
              Học sinh
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-[#00a651]' : 'text-slate-500'}`}
            >
              Giáo viên
            </button>
          </div>

          <div className="space-y-5 mb-10">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Mã học sinh / Email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" placeholder="Mật khẩu" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium" />
            </div>
          </div>

          <button 
            onClick={handleDemoLogin}
            className="w-full bg-[#00a651] text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            ĐĂNG NHẬP NGAY
          </button>
          
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hỗ trợ kỹ thuật</p>
            <p className="text-xs text-slate-500 font-medium italic">Email: thcslequydon@tayho.edu.vn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
