
import React, { useState } from 'react';
import { Search, LogOut, ChevronDown, Tablet, Mic2, GraduationCap, MonitorPlay, LibraryBig, HeartPulse, Newspaper, User as UserIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onNavigateHome: () => void;
  onNavigateIntro: () => void;
  onNavigateNews: () => void;
  onNavigateDocs: () => void;
  onNavigateCategory: (cat: string) => void;
  onNavigateStatic: (slug: string, title: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, onLoginClick, onLogout, onProfileClick, onNavigateHome, onNavigateIntro, onNavigateNews, onNavigateDocs, onNavigateCategory, onNavigateStatic
}) => {
  const [showDocDropdown, setShowDocDropdown] = useState(false);

  const documentCategories = [
    { label: 'Sách điện tử', icon: <Tablet className="w-4 h-4" /> },
    { label: 'Sách nói', icon: <Mic2 className="w-4 h-4" /> },
    { label: 'Bài giảng điện tử', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Video', icon: <MonitorPlay className="w-4 h-4" /> },
    { label: 'Album ảnh', icon: <LibraryBig className="w-4 h-4" /> },
    { label: 'Kỹ năng sống', icon: <HeartPulse className="w-4 h-4" /> },
    { label: 'Báo, tạp chí', icon: <Newspaper className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full bg-white sticky top-0 z-[100] border-b border-slate-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-14 h-14">
            <img src="https://thcslequydon-tayho.edu.vn/uploads/logo.png" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Thư viện điện tử</span>
            <h1 className="text-slate-800 font-extrabold text-[15px] leading-tight uppercase">THCS LÊ QUÝ ĐÔN</h1>
          </div>
        </div>

        <nav className="hidden lg:flex items-center h-full ml-8">
          <div className="flex items-center h-full">
            <div className="px-4 h-full flex items-center cursor-pointer group" onClick={onNavigateHome}>
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Trang chủ</span>
            </div>

            <div 
              className="relative h-full flex items-center px-4"
              onMouseEnter={() => setShowDocDropdown(true)}
              onMouseLeave={() => setShowDocDropdown(false)}
            >
              <div className="flex items-center gap-1 cursor-pointer group" onClick={onNavigateDocs}>
                <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Tài liệu</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#00a651]" />
              </div>

              {showDocDropdown && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-2xl border border-slate-100 rounded-b-2xl overflow-hidden">
                  <div className="py-2">
                    {documentCategories.map((cat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { onNavigateCategory(cat.label); setShowDocDropdown(false); }}
                        className="px-6 py-3 hover:bg-emerald-50 flex items-center gap-3 cursor-pointer transition-colors group/item"
                      >
                        <div className="text-slate-400 group-hover/item:text-[#00a651] transition-colors">{cat.icon}</div>
                        <span className="text-[13px] font-bold text-slate-600 group-hover/item:text-[#00a651]">{cat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 h-full flex items-center cursor-pointer group" onClick={onNavigateIntro}>
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Giới thiệu sách</span>
            </div>
            <div className="px-4 h-full flex items-center cursor-pointer group" onClick={onNavigateNews}>
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Tin tức</span>
            </div>
            <div className="px-4 h-full flex items-center cursor-pointer group" onClick={() => onNavigateStatic('huong-dan', 'Hướng dẫn')}>
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Hướng dẫn</span>
            </div>
            <div className="px-4 h-full flex items-center cursor-pointer group" onClick={() => onNavigateStatic('gioi-thieu', 'Giới thiệu')}>
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Giới thiệu</span>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400 cursor-pointer" />
          {user ? (
             <div className="flex items-center gap-4">
                <button onClick={onProfileClick} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-white transition-all group">
                   <div className="w-6 h-6 bg-[#00a651] rounded-full flex items-center justify-center text-white">
                      <UserIcon className="w-3.5 h-3.5" />
                   </div>
                   <span className="text-[11px] font-black text-slate-700 uppercase max-w-[80px] truncate">{user.name.split(' ').pop()}</span>
                </button>
                <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
             </div>
          ) : (
            <button onClick={onLoginClick} className="px-6 py-2 bg-[#00a651] text-white rounded-full text-[13px] font-bold">Đăng nhập</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
