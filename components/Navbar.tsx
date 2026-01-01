
import React, { useState } from 'react';
import { Search, LogOut, ChevronDown, Tablet, Mic2, GraduationCap, MonitorPlay, LibraryBig, HeartPulse, Newspaper } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateIntro: () => void;
  onNavigateNews: () => void;
  onNavigateDocs: () => void;
  onNavigateCategory: (cat: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, onLoginClick, onLogout, onNavigateHome, onNavigateIntro, onNavigateNews, onNavigateDocs, onNavigateCategory 
}) => {
  const [activeItem, setActiveItem] = useState('Trang chủ');
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
               <span className={`text-[13px] font-bold ${activeItem === 'Trang chủ' ? 'text-[#00a651]' : 'text-slate-700 hover:text-[#00a651]'}`}>Trang chủ</span>
            </div>

            <div 
              className="relative h-full flex items-center px-4"
              onMouseEnter={() => setShowDocDropdown(true)}
              onMouseLeave={() => setShowDocDropdown(false)}
            >
              <div className="flex items-center gap-1 cursor-pointer group" onClick={onNavigateDocs}>
                <span className={`text-[13px] font-bold transition-all ${activeItem === 'Tài liệu' ? 'text-[#00a651]' : 'text-slate-700 hover:text-[#00a651]'}`}>Tài liệu</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDocDropdown ? 'rotate-180 text-[#00a651]' : 'text-slate-400 group-hover:text-[#00a651]'}`} />
              </div>

              {showDocDropdown && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-2xl border border-slate-100 rounded-b-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    {documentCategories.map((cat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { onNavigateCategory(cat.label); setShowDocDropdown(false); }}
                        className="px-6 py-3 hover:bg-emerald-50 flex items-center gap-3 cursor-pointer transition-colors group/item"
                      >
                        <div className="text-slate-400 group-hover/item:text-[#00a651] transition-colors">
                          {cat.icon}
                        </div>
                        <span className="text-[13px] font-bold text-slate-600 group-hover/item:text-[#00a651] transition-colors">
                          {cat.label}
                        </span>
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
            <div className="px-4 h-full flex items-center cursor-pointer group">
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Hướng dẫn</span>
            </div>
            <div className="px-4 h-full flex items-center cursor-pointer group">
               <span className="text-[13px] font-bold text-slate-700 hover:text-[#00a651]">Giới thiệu</span>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400 cursor-pointer" />
          {user ? (
             <button onClick={onLogout} className="text-slate-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
          ) : (
            <button onClick={onLoginClick} className="px-6 py-2 bg-[#00a651] text-white rounded-full text-[13px] font-bold">Đăng nhập</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
