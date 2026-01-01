
import React from 'react';
import { ChevronRight, Eye, Heart } from 'lucide-react';
import { Book } from '../types';

interface BookSectionProps {
  title: string;
  books: Book[];
  onBookClick: (book: Book) => void;
}

const BookSection: React.FC<BookSectionProps> = ({ title, books, onBookClick }) => {
  return (
    <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-slate-800 font-black text-xl border-l-4 border-[#00a651] pl-4 uppercase tracking-tight">{title}</h2>
        <a href="#" className="text-[#00a651] text-sm font-bold flex items-center gap-1 hover:underline">
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        {books.map((book) => (
          <div 
            key={book.id} 
            className="group cursor-pointer" 
            onClick={() => onBookClick(book)}
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-100 mb-4 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
              <img src={book.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={book.title} />
              {book.type === 'audio' && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-lg shadow-lg">
                  <span className="text-[9px] font-bold px-1 uppercase">Audio</span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#00a651] mb-2 leading-snug transition-colors">{book.title}</h3>
            {book.author && <p className="text-[11px] text-slate-500 mb-3 italic">Tác giả: {book.author}</p>}
            
            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                <Eye className="w-3.5 h-3.5" /> {book.views}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                <Heart className="w-3.5 h-3.5" /> {book.likes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BookSection;
