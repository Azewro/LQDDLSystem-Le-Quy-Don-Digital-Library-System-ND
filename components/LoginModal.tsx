
import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Phone, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/authUtils';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User, mustChangePassword?: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!loginId || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Tìm kiếm người dùng
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.eq.${loginId.toUpperCase()},phone.eq.${loginId}`)
        .single();

      if (dbError || !data) {
        setError("Tài khoản không tồn tại trên hệ thống");
        setLoading(false);
        return;
      }

      // 2. Hash mật khẩu người dùng nhập vào
      const hashedInput = await hashPassword(password);
      
      // 3. So sánh với mật khẩu trong DB
      // Nếu là người mới chưa có mật khẩu hash (vừa import), ta so sánh trực tiếp với dob
      const storedPassword = data.password;
      const isCorrect = storedPassword ? (storedPassword === hashedInput) : (data.dob === password);

      if (!isCorrect) {
        setError("Mật khẩu không chính xác. Vui lòng thử lại!");
        setLoading(false);
        return;
      }

      // Đăng nhập thành công
      onLogin({
        id: data.id,
        username: data.username,
        name: data.full_name,
        role: data.role as UserRole,
        phone: data.phone,
        class_name: data.class_name,
        department: data.department,
        card_code: data.card_code,
        barcode: data.barcode,
        dob: data.dob
      }, data.must_change_password);
      
      if (!data.must_change_password) onClose();
    } catch (err) {
      console.error("Login error:", err);
      setError("Có lỗi xảy ra trong quá trình kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        <div className="bg-[#00a651] p-8 text-white relative">
          <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight uppercase">
            Đăng nhập
          </h2>
          <p className="text-emerald-50 text-sm mt-2 font-medium">Hệ thống Thư viện thông minh Lê Quý Đôn</p>
          <button onClick={onClose} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-5 mb-10">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Tên đăng nhập hoặc SĐT" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Mật khẩu" 
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00a651] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                * Nếu là lần đầu đăng nhập, mật khẩu là <span className="font-bold text-[#00a651]">Ngày sinh (dd/mm/yyyy)</span>.<br/>
                * Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới ngay sau đó.
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#00a651] text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ĐANG KIỂM TRA...
              </>
            ) : (
              "ĐĂNG NHẬP NGAY"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
