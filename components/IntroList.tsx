
import React from 'react';
import { BookIntroduction } from '../types';
import { Calendar, User, Eye, ChevronRight } from 'lucide-react';

interface IntroListProps {
  introductions: BookIntroduction[];
  onSelectIntro: (intro: BookIntroduction) => void;
  onBack: () => void;
}

const IntroList: React.FC<IntroListProps> = ({ introductions, onSelectIntro, onBack }) => {
  const featuredIntro = introductions[0];
  const otherIntros = introductions.slice(1);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-8 uppercase tracking-widest">
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onBack}>Trang chủ</span>
        <span className="opacity-30">/</span>
        <span className="text-emerald-600">Giới thiệu sách</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-8">
          
          {/* Featured Introduction (Bài ghim) */}
          {featuredIntro && (
            <div 
              className="group cursor-pointer mb-12 border-b border-slate-100 pb-12"
              onClick={() => onSelectIntro(featuredIntro)}
            >
              <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-lg mb-6 bg-slate-100">
                <img 
                  src={featuredIntro.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  alt={featuredIntro.title} 
                />
              </div>
              <h2 className="text-2xl font-black text-slate-800 group-hover:text-[#00a651] transition-colors mb-4 uppercase">
                {featuredIntro.title}
              </h2>
              <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> {featuredIntro.date}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-500" /> {featuredIntro.author}</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed italic line-clamp-2">
                {featuredIntro.summary}
              </p>
            </div>
          )}

          {/* List of other introductions */}
          <div className="space-y-10">
            {otherIntros.map((intro) => (
              <div 
                key={intro.id} 
                className="flex flex-col md:flex-row gap-8 group cursor-pointer border-b border-slate-100 pb-10 last:border-0"
                onClick={() => onSelectIntro(intro)}
              >
                <div className="md:w-72 aspect-[4/3] rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
                  <img src={intro.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={intro.title} />
                </div>
                <div className="flex-1 py-2">
                  <h2 className="text-lg font-black text-slate-800 group-hover:text-[#00a651] transition-colors leading-tight mb-3">
                    {intro.title}
                  </h2>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {intro.date}</span>
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-emerald-500" /> {intro.author}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 italic">
                    {intro.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm sticky top-28">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Xem nhiều</h3>
            <div className="space-y-6">
              {introductions.slice(0, 5).sort((a,b) => b.views - a.views).map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => onSelectIntro(item)}>
                  <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-slate-800 line-clamp-2 group-hover:text-[#00a651] mb-2">{item.title}</h4>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase"><Eye className="w-3.5 h-3.5 text-emerald-500" /> {item.views} lượt xem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default IntroList;
