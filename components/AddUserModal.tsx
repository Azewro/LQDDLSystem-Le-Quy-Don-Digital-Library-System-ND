
import React, { useState } from 'react';
import { X, Camera, Info, Save, ChevronDown, Calendar, CreditCard, Lock, Phone, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { generateUsername } from '../utils/userUtils';
import { hashPassword } from '../utils/authUtils';

interface AddUserModalProps {
  role: 'student' | 'teacher';
  onClose: () => void;
  onRefresh?: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ role, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    classOrDept: '',
    dob: '',
    gender: 'Nam',
    cardCode: '',
    phone: '',
    expiryDate: '31/05/2025',
    allowLibraryExport: false
  });

  const handleSave = async () => {
    if (!formData.fullName || !formData.cardCode || !formData.classOrDept) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const username = generateUsername(formData.cardCode, formData.fullName);
      const defaultPass = formData.dob || '123456';
      const hashedPassword = await hashPassword(defaultPass);

      const payload = {
        username: username.toUpperCase(),
        full_name: formData.fullName,
        role: role,
        phone: formData.phone,
        card_code: formData.cardCode.toUpperCase(),
        class_name: role === 'student' ? formData.classOrDept : null,
        department: role === 'teacher' ? formData.classOrDept : null,
        dob: formData.dob,
        gender: formData.gender,
        expiry_date: formData.expiryDate,
        password: hashedPassword,
        must_change_password: true
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([payload]);

      if (insertError) throw insertError;

      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      setError("Lỗi khi tạo tài khoản: " + (err.message || "Tên đăng nhập hoặc mã thẻ đã tồn tại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Thêm mới {role === 'student' ? 'Học sinh' : 'Giáo viên'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            <div className="md:col-span-3">
              <div className="aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 group hover:border-[#00a651] transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-slate-300 group-hover:text-[#00a651]" />
                </div>
                <p className="text-[#00a651] text-[11px] font-black uppercase tracking-widest">Tải ảnh thẻ</p>
              </div>
            </div>

            <div className="md:col-span-9 space-y-10 text-slate-900">
              <section className="space-y-6">
                <h3 className="text-[15px] font-black text-slate-800 border-l-4 border-emerald-500 pl-3 uppercase">Thông tin định danh</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Nhập họ tên đầy đủ" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-900 font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">{role === 'student' ? 'Lớp học' : 'Phòng ban'} <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.classOrDept}
                      onChange={(e) => setFormData({...formData, classOrDept: e.target.value})}
                      placeholder={role === 'student' ? "7A1" : "Ban Giám Hiệu"}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-900 font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Ngày sinh (dd/mm/yyyy)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        placeholder="VD: 15/05/2010" 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-900 font-medium" 
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a651]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Giới tính</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-900 font-medium appearance-none"
                    >
                      <option>Nam</option><option>Nữ</option><option>Khác</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[15px] font-black text-slate-800 border-l-4 border-emerald-500 pl-3 uppercase">Quản lý thẻ & Tài khoản</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Mã số thẻ <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.cardCode}
                        onChange={(e) => setFormData({...formData, cardCode: e.target.value})}
                        placeholder="VD: HS0491" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-[#00a651]" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Ngày hết hạn thẻ</label>
                    <input 
                      type="text" 
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium" 
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 font-bold text-sm"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-2.5 bg-[#00a651] text-white rounded-md hover:bg-emerald-700 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            LƯU BẠN ĐỌC
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
