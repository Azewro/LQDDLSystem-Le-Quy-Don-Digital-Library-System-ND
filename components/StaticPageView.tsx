
import React from 'react';
import { StaticPage } from '../types';
import { Calendar, Share2, Printer } from 'lucide-react';

interface StaticPageViewProps {
  page: StaticPage;
  onBack: () => void;
}

const StaticPageView: React.FC<StaticPageViewProps> = ({ page, onBack }) => {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-10 uppercase tracking-widest">
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onBack}>Trang chủ</span>
        <span className="opacity-30">/</span>
        <span className="text-emerald-600">{page.title}</span>
      </nav>

      <article className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm">
        <header className="mb-12 pb-8 border-b border-slate-50">
          <h1 className="text-4xl font-black text-slate-800 leading-tight mb-6 uppercase tracking-tight">
            {page.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> 
                Cập nhật: {new Date(page.updated_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div 
          className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed space-y-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
        
        {page.content === '' && (
          <div className="py-20 text-center">
            <p className="text-slate-400 italic">Nội dung đang được cập nhật...</p>
          </div>
        )}
      </article>
    </div>
  );
};

export default StaticPageView;
