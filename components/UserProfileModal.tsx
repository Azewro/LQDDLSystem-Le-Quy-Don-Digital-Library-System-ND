
import React, { useState } from 'react';
// Fixed: ShieldLock is not a valid export from lucide-react, replaced with Shield
import { X, User as UserIcon, Shield, KeyRound, AlertCircle, CheckCircle2, Loader2, CreditCard, School, Building } from 'lucide-react';
import { User } from '../types';
import { hashPassword, validatePasswordStrength } from '../utils/authUtils';
import { supabase } from '../lib/supabase';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  isFirstTime?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, isFirstTime = false }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>(isFirstTime ? 'password' : 'info');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword || (!isFirstTime && !oldPassword)) {
      setError("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setError(strength.message);
      return;
    }

    setLoading(true);
    try {
      // 1. Kiểm tra mật khẩu cũ nếu không phải lần đầu
      if (!isFirstTime) {
        const hashedOld = await hashPassword(oldPassword);
        const { data: profile } = await supabase.from('profiles').select('password').eq('id', user.id).single();
        if (profile?.password !== hashedOld) {
          setError("Mật khẩu hiện tại không chính xác");
          setLoading(false);
          return;
        }
      }

      // 2. Cập nhật mật khẩu mới
      const hashedNew = await hashPassword(newPassword);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          password: hashedNew, 
          must_change_password: false 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => {
        if (isFirstTime) window.location.reload(); // Reload để cập nhật trạng thái user
        else onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-[#00a651] rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                <UserIcon className="w-10 h-10" />
              </div>
              <h3 className="font-black text-slate-800 text-sm uppercase truncate">{user.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.role}</p>
            </div>

            <nav className="space-y-2 flex-1">
              <button 
                onClick={() => !isFirstTime && setActiveTab('info')}
                disabled={isFirstTime}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${activeTab === 'info' ? 'bg-white text-[#00a651] shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 disabled:opacity-30'}`}
              >
                <UserIcon className="w-4 h-4" /> Thông tin cá nhân
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${activeTab === 'password' ? 'bg-white text-[#00a651] shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {/* Fixed icon */}
                <Shield className="w-4 h-4" /> Đổi mật khẩu
              </button>
            </nav>

            {!isFirstTime && (
              <button onClick={onClose} className="mt-auto text-[11px] font-bold text-slate-400 uppercase hover:text-red-500 transition-colors flex items-center gap-2 justify-center">
                <X className="w-4 h-4" /> Đóng cửa sổ
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
            {isFirstTime && (
              <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-700 text-xs font-bold">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                Bạn cần đổi mật khẩu mặc định để tiếp tục sử dụng hệ thống!
              </div>
            )}

            {activeTab === 'info' ? (
              <div className="animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Hồ sơ người dùng</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tên đăng nhập</p>
                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{user.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mã vạch</p>
                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" /> {user.barcode || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Họ và tên</p>
                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ngày sinh</p>
                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{user.dob}</p>
                  </div>
                  {user.class_name && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Khối lớp</p>
                      <p className="text-sm font-bold text-[#00a651] bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <School className="w-4 h-4" /> {user.class_name}
                      </p>
                    </div>
                  )}
                  {user.department && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phòng ban</p>
                      <p className="text-sm font-bold text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-2">
                        <Building className="w-4 h-4" /> {user.department}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[11px] text-slate-400 italic text-center font-medium">
                    * Lưu ý: Các thông tin cá nhân do Nhà trường quản lý. Nếu có sai sót, vui lòng liên hệ Thư viện để cập nhật.
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Bảo mật tài khoản</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-[13px] font-bold">
                    <AlertCircle className="w-5 h-5" /> {error}
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-[13px] font-bold">
                    <CheckCircle2 className="w-5 h-5" /> {success}
                  </div>
                )}

                <div className="space-y-5">
                  {!isFirstTime && (
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00a651] outline-none text-sm font-bold"
                          placeholder="Nhập mật khẩu cũ"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mật khẩu mới</label>
                    <div className="relative">
                      {/* Fixed icon */}
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00a651] outline-none text-sm font-bold"
                        placeholder="8-20 ký tự, có chữ và số"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Xác nhận mật khẩu</label>
                    <div className="relative">
                      {/* Fixed icon */}
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00a651] outline-none text-sm font-bold"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full bg-[#00a651] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CẬP NHẬT MẬT KHẨU"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
