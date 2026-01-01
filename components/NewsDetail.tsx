
import React from 'react';
import { NewsItem } from '../types';
import { Calendar, User, Eye, Share2, Printer, ImageIcon, ChevronRight } from 'lucide-react';

interface NewsDetailProps {
  news: NewsItem;
  allNews: NewsItem[];
  onNavigateDetail: (news: NewsItem) => void;
  onNavigateList: () => void;
  onNavigateHome: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, allNews, onNavigateDetail, onNavigateList, onNavigateHome }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-8 uppercase tracking-widest">
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateHome}>Trang chủ</span>
        <span className="opacity-30">/</span>
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateList}>Tin tức</span>
        <span className="opacity-30">/</span>
        <span className="text-emerald-600">Chi tiết tin tức</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-12">
        <article className="lg:col-span-8 bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <header className="mb-10 border-b border-slate-50 pb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-8 uppercase tracking-tight">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> {news.date}</span>
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> {news.author}</span>
                <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-emerald-500" /> {news.views} lượt xem</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors"><Printer className="w-4 h-4" /></button>
              </div>
            </div>
          </header>

          <div 
            className="article-content prose prose-slate prose-lg max-w-none 
              prose-headings:text-slate-800 prose-headings:font-black prose-headings:uppercase
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6
              prose-img:rounded-3xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-8 prose-img:border prose-img:border-slate-100
              prose-strong:text-[#00a651]
              prose-a:text-emerald-600 hover:prose-a:text-emerald-700"
            dangerouslySetInnerHTML={{ __html: news.content_html || news.summary }}
          />

          <section className="mt-20 pt-10 border-t border-slate-100">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Tin liên quan</h3>
            <div className="space-y-6">
              {allNews.filter(n => n.id !== news.id).slice(0, 3).map(item => (
                <div key={item.id} className="flex gap-6 group cursor-pointer items-start" onClick={() => onNavigateDetail(item)}>
                  <div className="w-32 h-24 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-50">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#00a651] transition-colors leading-snug line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="text-[10px] text-emerald-500 font-bold uppercase">{item.date}</p>
                       <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{item.views} lượt xem</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm sticky top-28">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Xem nhiều</h3>
            <div className="space-y-6">
              {allNews.sort((a,b) => b.views - a.views).slice(0, 5).map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => onNavigateDetail(item)}>
                  <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-50">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={item.title} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 group-hover:text-[#00a651] mb-1 leading-snug">{item.title}</h4>
                    <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest"><Eye className="w-3 h-3 text-emerald-500" /> {item.views} lượt xem</span>
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

export default NewsDetail;
