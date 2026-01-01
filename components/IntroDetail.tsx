
import React from 'react';
import { BookIntroduction } from '../types';
import { Calendar, User, Eye, ArrowLeft, ChevronRight } from 'lucide-react';

interface IntroDetailProps {
  intro: BookIntroduction;
  allIntros: BookIntroduction[];
  onNavigateDetail: (intro: BookIntroduction) => void;
  onNavigateList: () => void;
  onNavigateHome: () => void;
}

const IntroDetail: React.FC<IntroDetailProps> = ({ intro, allIntros, onNavigateDetail, onNavigateList, onNavigateHome }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-8 uppercase tracking-widest">
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateHome}>Trang chủ</span>
        <span className="opacity-30">/</span>
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateList}>Giới thiệu sách</span>
        <span className="opacity-30">/</span>
        <span className="text-emerald-600">Chi tiết giới thiệu sách</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <article className="lg:col-span-8 bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <header className="mb-10 border-b border-slate-50 pb-8">
            <h1 className="text-3xl font-black text-slate-800 leading-tight mb-6">
              {intro.title}
            </h1>
            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> {intro.date}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-500" /> {intro.author}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-emerald-500" /> {intro.views} lượt xem</span>
            </div>
          </header>

          <div 
            className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: intro.content }}
          />

          {/* Related News Section */}
          <section className="mt-20 pt-10 border-t border-slate-100">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Tin liên quan</h3>
            <div className="space-y-6">
              {allIntros.filter(i => i.id !== intro.id).slice(0, 3).map(item => (
                <div key={item.id} className="flex gap-6 group cursor-pointer items-start" onClick={() => onNavigateDetail(item)}>
                  <div className="w-40 h-28 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.title} />
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#00a651] transition-colors leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm sticky top-28">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Xem nhiều</h3>
            <div className="space-y-6">
              {allIntros.sort((a,b) => b.views - a.views).slice(0, 5).map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => onNavigateDetail(item)}>
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

export default IntroDetail;
