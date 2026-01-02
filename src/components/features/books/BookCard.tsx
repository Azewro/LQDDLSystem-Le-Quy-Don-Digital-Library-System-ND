
import React from 'react';
import { Star, BookOpen } from 'lucide-react';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-indigo-600 shadow-sm uppercase">
            {book.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-slate-500">{book.rating}</span>
        </div>
        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{book.title}</h3>
        <p className="text-sm text-slate-500 mb-3">{book.author}</p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400">{book.year}</span>
          <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">
            Đọc ngay
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
