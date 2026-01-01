
import React from 'react';
import { Mail, Phone, Globe, MapPin, ChevronUp, ShieldCheck } from 'lucide-react';

interface AdminFooterProps {
  onNavigateHome: () => void;
}

const AdminFooter: React.FC<AdminFooterProps> = ({ onNavigateHome }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1440px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
              <div className="w-12 h-12 bg-white rounded-lg p-1">
                <img src="https://thcslequydon-tayho.edu.vn/uploads/logo.png" className="w-full h-full object-contain" alt="Logo" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Admin Console</span>
                <h2 className="text-white font-extrabold text-[14px] leading-tight uppercase">THCS LÊ QUÝ ĐÔN</h2>
              </div>
            </div>
            
            <div className="space-y-3 text-[13px] text-slate-400">
              <p className="flex items-start gap-2 italic">
                Cổng quản trị dành riêng cho cán bộ thư viện và ban giám hiệu nhà trường. Vui lòng bảo mật thông tin tài khoản.
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Hỗ trợ kỹ thuật: 098.xxx.xxxx</span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-8 uppercase tracking-wider relative inline-block">
              Quản lý nhanh
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-emerald-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-[13px] text-slate-400 font-medium">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Import Người dùng</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Cập nhật Kho sách</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Duyệt bài đăng</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Báo cáo thống kê</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-8 uppercase tracking-wider relative inline-block">
              Hệ thống
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-emerald-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-[13px] text-slate-400 font-medium">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Lịch sử hoạt động</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Cấu hình Trang chủ</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Tài khoản Admin</li>
            </ul>
          </div>

          <div className="lg:text-right">
            <div className="flex flex-col lg:items-end gap-2 text-[13px] font-bold text-slate-400">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 inline-block text-left">
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest mb-1">Server Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-white">Hệ thống đang hoạt động ổn định</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-600 uppercase tracking-widest">
          <p>Admin Dashboard v2.0 - © 2024 THCS Lê Quý Đôn.</p>
        </div>
      </div>

      <button 
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 w-10 h-10 bg-slate-800 text-white rounded flex items-center justify-center shadow-lg hover:bg-emerald-500 transition-all group"
      >
        <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default AdminFooter;
