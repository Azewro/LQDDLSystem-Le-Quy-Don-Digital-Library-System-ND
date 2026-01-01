
import React from 'react';
import { NewsItem } from '../types';
import { Calendar, User, Eye, ChevronRight } from 'lucide-react';

interface NewsListProps {
  newsList: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
  onBack: () => void;
}

const NewsList: React.FC<NewsListProps> = ({ newsList, onSelectNews, onBack }) => {
  const featuredNews = newsList[0];
  const otherNews = newsList.slice(1);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-8 uppercase tracking-widest">
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onBack}>Trang chủ</span>
        <span className="opacity-30">/</span>
        <span className="text-emerald-600">Tin tức</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {/* Featured News */}
          {featuredNews && (
            <div 
              className="group cursor-pointer mb-12 border-b border-slate-100 pb-12"
              onClick={() => onSelectNews(featuredNews)}
            >
              <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-lg mb-6 bg-slate-100">
                <img src={featuredNews.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={featuredNews.title} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 group-hover:text-[#00a651] transition-colors mb-4 uppercase">
                {featuredNews.title}
              </h2>
              <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> {featuredNews.date}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-500" /> {featuredNews.author}</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed italic line-clamp-2">
                {featuredNews.summary}
              </p>
            </div>
          )}

          {/* List of other news */}
          <div className="space-y-10">
            {otherNews.map((news) => (
              <div 
                key={news.id} 
                className="flex flex-col md:flex-row gap-8 group cursor-pointer border-b border-slate-100 pb-10 last:border-0"
                onClick={() => onSelectNews(news)}
              >
                <div className="md:w-64 aspect-video rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
                  <img src={news.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={news.title} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#00a651] transition-colors leading-tight mb-3">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <span className="text-[#00a651]">{news.date}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span>{news.author}</span>
                  </div>
                  <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 italic">
                    {news.summary}
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
              {newsList.sort((a,b) => b.views - a.views).slice(0, 5).map((item) => (
                <div key={item.id} className="flex gap-4 group cursor-pointer" onClick={() => onSelectNews(item)}>
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={item.title} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-slate-800 line-clamp-2 group-hover:text-[#00a651] mb-1">{item.title}</h4>
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

export default NewsList;
