
import React from 'react';
import { LogOut, Home, User as UserIcon, Bell, Menu, X } from 'lucide-react';
import { User as UserType } from '@/types';

interface AdminNavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onProfileClick: () => void;
  onNavigateHome: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  user, onLogout, onProfileClick, onNavigateHome, onToggleSidebar, isSidebarCollapsed
}) => {
  return (
    <header className="w-full bg-slate-900 sticky top-0 z-[100] border-b border-slate-800 shadow-xl">
      <div className="mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Nút thu/mở Sidebar ở sát trái */}
          <button
            onClick={onToggleSidebar}
            className="p-2.5 bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-slate-750 rounded-xl transition-all shadow-lg active:scale-95"
            title={isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>

          {/* Logo và Branding đẩy sang phải một chút */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-lg">
              <img src="/images/logo.png" className="w-full h-full object-contain" alt="Logo" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-black text-[14px] leading-tight uppercase tracking-tight">Hệ Thống Quản Trị Thư Viện Số</h1>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none mt-0.5">THCS Lê Quý Đôn</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-[11px] font-black uppercase tracking-wider"
          >
            <Home className="w-4 h-4 text-emerald-500" /> Về Thư viện
          </button>

          {user && (
            <div className="flex items-center gap-10">
              <button onClick={onProfileClick} className="flex items-center gap-3 px-4 py-2 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-750 transition-all group">
                <div className="w-8 h-8 bg-emerald-500 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-[12px] font-black text-slate-200 uppercase leading-none max-w-[150px] truncate">{user.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Admin</p>
                </div>
              </button>
              <div className="w-px h-6 bg-slate-700"></div>
              <button
                onClick={() => { if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) onLogout(); }}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
