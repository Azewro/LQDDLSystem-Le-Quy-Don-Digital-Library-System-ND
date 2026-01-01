
import React from 'react';
import { Eye, Heart, BookOpen, ChevronRight } from 'lucide-react';
import CategorySection from './CategorySection';
import BookSection from './BookSection';
import { Book } from '../types';

interface DocumentOverviewProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onNavigateCategory: (category: string) => void;
}

const DocumentOverview: React.FC<DocumentOverviewProps> = ({ books, onBookClick, onNavigateCategory }) => {
  const trendingBooks = books.sort((a,b) => b.views - a.views).slice(0, 6);
  const mainBook = trendingBooks[0];

  const getBooksByCategory = (cat: string) => books.filter(b => b.category === cat);

  const categories = [
    'Sách điện tử',
    'Sách nói',
    'Bài giảng điện tử',
    'Video',
    'Album ảnh',
    'Kỹ năng sống',
    'Báo, tạp chí'
  ];

  return (
    <div className="bg-[#f8fafc]">
      {/* 1. Hero Section - Tài liệu thịnh hành */}
      <section className="bg-[#2d3748] py-16 text-white overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex gap-10">
            {/* Main Featured Book */}
            {mainBook && (
              <div className="w-[350px] flex-shrink-0 group cursor-pointer" onClick={() => onBookClick(mainBook)}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                  <img src={mainBook.coverImage} className="w-full h-full object-cover" alt={mainBook.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              </div>
            )}

            {/* Main Book Details */}
            {mainBook && (
              <div className="flex flex-col justify-center max-w-sm">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Tài liệu thịnh hành</h3>
                <h2 className="text-4xl font-black mb-6 leading-tight group-hover:text-emerald-400 transition-colors">{mainBook.title}</h2>
                <div className="flex items-center gap-6 text-sm text-slate-300 mb-8">
                  <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-emerald-500" /> {mainBook.views} lượt xem</span>
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" /> {mainBook.likes} lượt thích</span>
                </div>
                <div className="space-y-4 mb-10 text-slate-300 text-sm">
                  <p>Thể loại: <span className="font-bold text-white">{mainBook.subCategory || 'Đang cập nhật'}</span></p>
                  <p>Hình thức: <span className="font-bold text-white">{mainBook.category}</span></p>
                </div>
                <button 
                  onClick={() => onBookClick(mainBook)}
                  className="bg-[#00a651] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 w-fit hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-wider text-xs"
                >
                  <BookOpen className="w-5 h-5" /> Xem đầy đủ
                </button>
              </div>
            )}
          </div>

          {/* Right List - Trending Small Cards */}
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-4 border border-white/10 max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {trendingBooks.slice(1).map((book) => (
                <div 
                  key={book.id} 
                  className="flex gap-4 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => onBookClick(book)}
                >
                  <div className="w-20 h-28 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                    <img src={book.coverImage} className="w-full h-full object-cover" alt={book.title} />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <h4 className="font-bold text-sm group-hover:text-emerald-400 transition-colors line-clamp-1">{book.title}</h4>
                    <div className="flex flex-col gap-1 mt-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{book.category} | {book.subCategory}</span>
                       <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                         <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {book.views}</span>
                         <span className="flex items-center gap-1.5"><Heart className="w-3 h-3" /> {book.likes}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Danh mục & Tài liệu chi tiết */}
      <div className="pb-20">
        <CategorySection onCategoryClick={onNavigateCategory} />
        
        <div className="max-w-[1440px] mx-auto px-6 space-y-16">
          {categories.map(cat => (
            <BookSection 
              key={cat}
              title={cat} 
              books={getBooksByCategory(cat).slice(0, 5)} 
              onBookClick={onBookClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentOverview;
