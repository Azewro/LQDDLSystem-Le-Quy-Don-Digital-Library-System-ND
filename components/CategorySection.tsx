
import React, { useState } from 'react';
import { Tablet, Mic2, GraduationCap, MonitorPlay, LibraryBig, HeartPulse, Newspaper, ChevronRight, ChevronLeft } from 'lucide-react';

const categories = [
  { label: 'Sách điện tử', icon: <Tablet className="w-7 h-7 text-red-500" /> },
  { label: 'Sách nói', icon: <Mic2 className="w-7 h-7 text-orange-500" /> },
  { label: 'Bài giảng điện tử', icon: <GraduationCap className="w-7 h-7 text-blue-500" /> },
  { label: 'Video', icon: <MonitorPlay className="w-7 h-7 text-purple-500" /> },
  { label: 'Album ảnh', icon: <LibraryBig className="w-7 h-7 text-pink-500" /> },
  { label: 'Kỹ năng sống', icon: <HeartPulse className="w-7 h-7 text-sky-500" /> },
  { label: 'Báo, tạp chí', icon: <Newspaper className="w-7 h-7 text-teal-600" /> },
];

interface CategorySectionProps {
  onCategoryClick?: (cat: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategoryClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 mb-12 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex items-center gap-10 relative overflow-hidden group">
        <div className="flex-shrink-0 z-10 bg-white pr-6 border-r border-slate-50">
          <h2 className="text-xl font-bold text-slate-800 leading-tight">Danh mục tài liệu</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            <div className="flex min-w-full justify-between items-center px-2">
              {categories.slice(0, 6).map((cat, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 group/item cursor-pointer w-[15%]" onClick={() => onCategoryClick?.(cat.label)}>
                  <div className="w-16 h-16 rounded-2xl border border-slate-50 flex items-center justify-center bg-white group-hover/item:shadow-lg group-hover/item:border-emerald-100 transition-all duration-300">
                    <div className="transform group-hover/item:scale-110 transition-transform">{cat.icon}</div>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-600 group-hover/item:text-[#00a651] whitespace-nowrap transition-colors tracking-tight">{cat.label}</span>
                </div>
              ))}
            </div>
            <div className="flex min-w-full justify-start items-center gap-[2%] px-2">
              {categories.slice(6).map((cat, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 group/item cursor-pointer w-[15%]" onClick={() => onCategoryClick?.(cat.label)}>
                  <div className="w-16 h-16 rounded-2xl border border-slate-50 flex items-center justify-center bg-white group-hover/item:shadow-lg group-hover/item:border-emerald-100 transition-all duration-300">
                    <div className="transform group-hover/item:scale-110 transition-transform">{cat.icon}</div>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-600 group-hover/item:text-[#00a651] whitespace-nowrap transition-colors tracking-tight">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-6 bg-white z-10">
           <button onClick={prevPage} disabled={currentPage === 0} className={`w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center transition-all ${currentPage === 0 ? 'text-slate-200' : 'text-slate-400 hover:text-[#00a651] shadow-sm'}`}><ChevronLeft className="w-5 h-5" /></button>
           <button onClick={nextPage} disabled={currentPage === totalPages - 1} className={`w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center transition-all ${currentPage === totalPages - 1 ? 'text-slate-200' : 'text-slate-400 hover:text-[#00a651] shadow-sm'}`}><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
