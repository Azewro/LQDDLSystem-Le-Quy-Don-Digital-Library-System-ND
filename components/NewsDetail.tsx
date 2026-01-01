
import React from 'react';
import { NewsItem } from '../types';
import { Calendar, User, Eye, Share2, Printer, ImageIcon } from 'lucide-react';

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
        <span className="text-emerald-600">Chi tiết</span>
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
                <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-emerald-500" /> {news.views}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors"><Printer className="w-4 h-4" /></button>
              </div>
            </div>
          </header>

          {/* Phần hiển thị nội dung HTML phức tạp */}
          <div 
            className="prose prose-slate prose-lg max-w-none 
              prose-headings:text-slate-800 prose-headings:font-black prose-headings:uppercase
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-img:rounded-3xl prose-img:shadow-lg
              prose-strong:text-emerald-700
              prose-a:text-emerald-600 hover:prose-a:text-emerald-700"
            dangerouslySetInnerHTML={{ __html: news.content_html || news.summary }}
          />

          {/* Hiển thị Gallery ảnh nếu có */}
          {news.gallery && news.gallery.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-50">
              <h3 className="flex items-center gap-3 text-slate-800 font-black text-lg uppercase tracking-tight mb-8">
                <ImageIcon className="w-6 h-6 text-emerald-500" /> Hình ảnh liên quan
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.gallery.map((imgUrl, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform cursor-pointer">
                    <img src={imgUrl} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <section className="mt-20 pt-10 border-t border-slate-100">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Tin liên quan</h3>
            <div className="space-y-6">
              {allNews.filter(n => n.id !== news.id).slice(0, 3).map(item => (
                <div key={item.id} className="flex gap-6 group cursor-pointer items-start" onClick={() => onNavigateDetail(item)}>
                  <div className="w-32 h-24 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#00a651] transition-colors leading-snug line-clamp-2">{item.title}</h4>
                    <p className="text-[10px] text-emerald-500 mt-2 font-bold uppercase">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm sticky top-28">
            <h3 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight mb-8">Xem nhiều nhất</h3>
            <div className="space-y-6">
              {allNews.sort((a,b) => b.views - a.views).slice(0, 5).map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => onNavigateDetail(item)}>
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 group-hover:text-[#00a651] mb-1">{item.title}</h4>
                    <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest"><Eye className="w-3 h-3 text-emerald-500" /> {item.views}</span>
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
