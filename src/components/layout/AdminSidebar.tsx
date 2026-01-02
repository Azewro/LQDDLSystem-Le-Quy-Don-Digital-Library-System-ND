import React, { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Newspaper, Settings, ChevronRight, ChevronDown, FileText, BookMarked, Tablet, Mic2, Video, Image } from 'lucide-react';

interface AdminSidebarProps {
  activeMenu: string;
  isCollapsed: boolean;
  onMenuClick?: (id: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeMenu, isCollapsed, onMenuClick }) => {
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isBooksOpen, setIsBooksOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'users', label: 'Quản lý bạn đọc', icon: <Users className="w-5 h-5" /> },
  ];

  // Check if any books submenu is active
  const isBooksActive = activeMenu === 'books' || activeMenu === 'admin-ebooks' || activeMenu === 'admin-audiobooks' || activeMenu === 'admin-videos';

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'
        }`}
    >
      <div className={`p-4 ${isCollapsed ? 'px-2' : 'p-6'} flex-1`}>
        {!isCollapsed && (
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4 animate-in fade-in duration-500">Menu chính</p>
        )}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuClick?.(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all group relative ${activeMenu === item.id
                ? 'bg-[#00a651] text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
            >
              <div className={`flex items-center gap-4 ${isCollapsed ? 'gap-0' : ''}`}>
                <div className={`${activeMenu === item.id ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </div>
              {!isCollapsed && <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-40 ${activeMenu === item.id ? 'hidden' : ''}`} />}
            </button>
          ))}

          {/* Kho tài liệu với Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  onMenuClick?.('books');
                } else {
                  setIsBooksOpen(!isBooksOpen);
                }
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all group relative ${isBooksActive
                ? 'bg-[#00a651] text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
            >
              <div className={`flex items-center gap-4 ${isCollapsed ? 'gap-0' : ''}`}>
                <div className={`${isBooksActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">
                    Kho tài liệu
                  </span>
                )}
              </div>
              {!isCollapsed && (
                isBooksOpen ? <ChevronDown className="w-4 h-4 opacity-40" /> : <ChevronRight className="w-4 h-4 opacity-40" />
              )}
            </button>

            {isBooksOpen && !isCollapsed && (
              <div className="pl-12 pr-4 py-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => onMenuClick?.('admin-ebooks')}
                  className={`w-full text-left py-2 text-[12px] font-bold transition-colors flex items-center gap-2 ${activeMenu === 'admin-ebooks' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Sách điện tử
                </button>
                <button
                  onClick={() => onMenuClick?.('admin-audiobooks')}
                  className={`w-full text-left py-2 text-[12px] font-bold transition-colors flex items-center gap-2 ${activeMenu === 'admin-audiobooks' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                >
                  <Mic2 className="w-3.5 h-3.5" /> Sách nói
                </button>
                <button
                  onClick={() => onMenuClick?.('admin-videos')}
                  className={`w-full text-left py-2 text-[12px] font-bold transition-colors flex items-center gap-2 ${activeMenu === 'admin-videos' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                >
                  <Video className="w-3.5 h-3.5" /> Video / Bài giảng
                </button>
              </div>
            )}
          </div>

          {/* Trang tĩnh */}
          <button
            onClick={() => onMenuClick?.('admin-pages')}
            className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all group relative ${activeMenu === 'admin-pages'
              ? 'bg-[#00a651] text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
          >
            <div className={`flex items-center gap-4 ${isCollapsed ? 'gap-0' : ''}`}>
              <div className={`${activeMenu === 'admin-pages' ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors`}>
                <FileText className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">
                  Trang tĩnh
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-40 ${activeMenu === 'admin-pages' ? 'hidden' : ''}`} />}
          </button>

          {/* Tin tức & Bài viết với Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  onMenuClick?.('news');
                } else {
                  setIsNewsOpen(!isNewsOpen);
                }
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all group relative ${activeMenu.startsWith('news') || activeMenu.startsWith('intro') || activeMenu === 'admin-introductions' || activeMenu === 'admin-news'
                ? 'bg-[#00a651] text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
            >
              <div className={`flex items-center gap-4 ${isCollapsed ? 'gap-0' : ''}`}>
                <div className={`${activeMenu.startsWith('news') || activeMenu === 'admin-introductions' || activeMenu === 'admin-news' ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors`}>
                  <Newspaper className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">
                    Tin tức & Bài viết
                  </span>
                )}
              </div>
              {!isCollapsed && (
                isNewsOpen ? <ChevronDown className="w-4 h-4 opacity-40" /> : <ChevronRight className="w-4 h-4 opacity-40" />
              )}
            </button>

            {isNewsOpen && !isCollapsed && (
              <div className="pl-12 pr-4 py-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => onMenuClick?.('admin-introductions')}
                  className={`w-full text-left py-2 text-[12px] font-bold transition-colors flex items-center gap-2 ${activeMenu === 'admin-introductions' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                >
                  <BookMarked className="w-3.5 h-3.5" /> Giới thiệu sách
                </button>
                <button
                  onClick={() => onMenuClick?.('admin-news')}
                  className={`w-full text-left py-2 text-[12px] font-bold transition-colors flex items-center gap-2 ${activeMenu === 'admin-news' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Tin tức
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onMenuClick?.('settings')}
            className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all group relative ${activeMenu === 'settings'
              ? 'bg-[#00a651] text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
          >
            <div className="flex items-center gap-4">
              <Settings className={`w-5 h-5 ${activeMenu === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
              {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">Cấu hình</span>}
            </div>
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className={`p-4 border-t border-slate-800 ${isCollapsed ? 'p-2 flex justify-center' : 'p-6'}`}>
        {!isCollapsed && (
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Hệ thống</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">v2.4.0 PRO</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
