
import React, { useState, useRef } from 'react';
import { X, Camera, Info, Save, ChevronDown, Calendar, CreditCard, Lock, Phone, Loader2, AlertCircle } from 'lucide-react';
import { UserRole, User } from '@/types';
import { supabase } from '@/lib/supabase';
import { generateUsername } from '@/utils/userUtils';
import { hashPassword } from '@/utils/authUtils';
import { uploadFile } from '@/services/storageService';

interface AddUserModalProps {
  role: 'student' | 'teacher' | 'admin';
  onClose: () => void;
  onRefresh?: () => void;
  userToEdit?: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ role, onClose, onRefresh, userToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: userToEdit?.name || '',
    classOrDept: userToEdit?.class_name || userToEdit?.department || '',
    dob: userToEdit?.dob || '',
    gender: userToEdit?.gender || 'Nam',
    cardCode: userToEdit?.card_code || '',
    barcode: userToEdit?.barcode || '',
    phone: userToEdit?.phone || '',
    issueDate: userToEdit?.issue_date || '',
    effectiveDate: userToEdit?.effective_date || '',
    expiryDate: userToEdit?.expiry_date || '',
    password: '', // New password if provided
    isActive: userToEdit?.is_active ?? true,
    allowLibraryExport: false
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.cardCode || !formData.classOrDept) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload avatar if selected
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadFile('avatars', avatarFile, `${formData.cardCode.toUpperCase()}_${Date.now()}.${avatarFile.name.split('.').pop()}`);
      }

      const username = userToEdit?.username || generateUsername(formData.cardCode, formData.fullName).toUpperCase();

      // Bắt đầu với các trường bắt buộc
      const payload: any = {
        username: username,
        full_name: formData.fullName,
        role: role,
        card_code: formData.cardCode.toUpperCase(),
        is_active: formData.isActive
      };

      // Xử lý các trường có thể null hoặc không đổi nếu để trống
      if (role === 'student') {
        payload.class_name = formData.classOrDept;
        payload.department = null;
      } else {
        payload.department = formData.classOrDept;
        payload.class_name = null;
      }

      // Chỉ cập nhật nếu có giá trị (tránh ghi đè null khi người dùng không nhập)
      if (formData.dob) payload.dob = formData.dob;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.barcode) payload.barcode = formData.barcode;
      if (formData.issueDate) payload.issue_date = formData.issueDate;
      if (formData.effectiveDate) payload.effective_date = formData.effectiveDate;
      if (formData.expiryDate) payload.expiry_date = formData.expiryDate;
      if (avatarUrl) payload.avatar_url = avatarUrl;

      // Xử lý mật khẩu
      if (formData.password) {
        payload.password = await hashPassword(formData.password);
        payload.must_change_password = true;
      } else if (!userToEdit) {
        // Chỉ đặt mật khẩu mặc định khi TẠO MỚI
        const defaultPass = formData.dob || '123456';
        payload.password = await hashPassword(defaultPass);
        payload.must_change_password = true;
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'username' });

      if (insertError) throw insertError;

      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      setError("Lỗi khi lưu tài khoản: " + (err.message || "Tên đăng nhập hoặc mã thẻ đã tồn tại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {userToEdit ? 'Sửa' : 'Thêm mới'} {role === 'student' ? 'Học sinh' : role === 'teacher' ? 'Giáo viên' : 'Quản trị viên'}
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

            <div className="md:col-span-3 flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-[#00a651] transition-colors cursor-pointer overflow-hidden relative mb-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {(avatarPreview || userToEdit?.avatar_url) ? (
                  <img src={avatarPreview || userToEdit?.avatar_url} alt="Avatar preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-slate-300 group-hover:text-[#00a651]" />
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#00a651] text-[13px] font-bold hover:underline"
              >
                Chọn ảnh
              </button>
            </div>

            <div className="md:col-span-9 space-y-10 text-slate-900">
              <section className="space-y-6">
                <h3 className="text-[15px] font-black text-slate-800 border-l-4 border-emerald-500 pl-3 uppercase">Thông tin bạn đọc</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Họ và tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nhập họ tên đầy đủ"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">{role === 'student' ? 'Lớp' : role === 'teacher' ? 'Phòng ban' : 'Bộ phận/Chức vụ'} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.classOrDept}
                      onChange={(e) => setFormData({ ...formData, classOrDept: e.target.value })}
                      placeholder={role === 'student' ? "7A1" : role === 'teacher' ? "Ban Giám Hiệu" : "Phòng Công Nghệ"}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Ngày sinh</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        placeholder="dd/mm/yyyy"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a651]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Giới tính</label>
                    <div className="relative">
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium appearance-none"
                      >
                        <option>Nam</option><option>Nữ</option><option>Khác</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[15px] font-black text-slate-800 border-l-4 border-emerald-500 pl-3 uppercase">Thông tin thẻ</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Mã thẻ <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.cardCode}
                      onChange={(e) => setFormData({ ...formData, cardCode: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Ngày cấp</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a651]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Ngày hiệu lực</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a651]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Ngày hết hạn</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a651]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Mã vạch</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-black text-slate-800 border-l-4 border-emerald-500 pl-3 uppercase">Thông tin tài khoản</h3>
                  <Info className="w-4 h-4 text-sky-400" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password}
                      autoComplete="new-password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={userToEdit ? "Để trống nếu không đổi" : "Mặc định là ngày sinh"}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a651] text-sm text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-4 py-4">
                <button
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className="flex items-center gap-3 group"
                >
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-[#00a651]' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-bold text-slate-600">Đang theo dõi</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-10 py-2.5 bg-[#00a651] text-white rounded-xl hover:bg-emerald-600 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
