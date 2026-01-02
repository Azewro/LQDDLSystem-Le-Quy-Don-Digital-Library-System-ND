
import React, { useState, useMemo } from 'react';
import { Eye, Heart, FolderOpen, ChevronRight, LayoutGrid, Search, Filter } from 'lucide-react';
import { Book } from '@/types';

interface CategoryDetailViewProps {
  category: string;
  books: Book[];
  onBookClick: (book: Book) => void;
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  books,
  onBookClick,
  onNavigateHome,
  onNavigateOverview
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string | number>('Tất cả');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('Tất cả');

  const filteredBooks = useMemo(() => {
    return books.filter(b => b.category === category)
      .filter(b => selectedGrade === 'Tất cả' || b.grade?.toString() === selectedGrade.toString())
      .filter(b => selectedSubCat === 'Tất cả' || b.subCategory === selectedSubCat);
  }, [books, category, selectedGrade, selectedSubCat]);

  // Extract unique sub-categories for the sidebar
  const subCategories = useMemo(() => {
    const subs = books.filter(b => b.category === category).map(b => b.subCategory || 'Khác');
    return Array.from(new Set(subs));
  }, [books, category]);

  // Group filtered books by subCategory for display
  const groupedBooks = useMemo(() => {
    const groups: Record<string, Book[]> = {};
    filteredBooks.forEach(b => {
      const sub = b.subCategory || 'Khác';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(b);
    });
    return groups;
  }, [filteredBooks]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-400 mb-8 uppercase tracking-widest">
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateHome}>Trang chủ</span>
        <span className="opacity-30">/</span>
        <span className="hover:text-[#00a651] cursor-pointer" onClick={onNavigateOverview}>Tài liệu</span>
        <span className="opacity-30">/</span>
        <span className="text-emerald-600">{category}</span>
      </nav>

      <div className="flex gap-8">
        {/* SIDEBAR */}
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-28">
            <button className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-slate-600 mb-8">
              <span className="flex items-center gap-2"><Filter className="w-4 h-4 text-[#00a651]" /> Bộ lọc tìm kiếm</span>
              <ChevronRight className="w-4 h-4 opacity-30" />
            </button>

            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-800">Lọc ({filteredBooks.length})</h3>
                <button onClick={() => { setSelectedGrade('Tất cả'); setSelectedSubCat('Tất cả'); }} className="text-[10px] font-bold text-[#00a651] uppercase">Xóa tất cả</button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    Thư mục <ChevronRight className="w-3 h-3 opacity-50 rotate-90" />
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="subcat"
                        checked={selectedSubCat === 'Tất cả'}
                        onChange={() => setSelectedSubCat('Tất cả')}
                        className="w-4 h-4 accent-[#00a651]"
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedSubCat === 'Tất cả' ? 'text-[#00a651] font-bold' : 'text-slate-600 group-hover:text-[#00a651]'}`}>Tất cả</span>
                    </label>
                    {subCategories.map(sub => (
                      <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="subcat"
                          checked={selectedSubCat === sub}
                          onChange={() => setSelectedSubCat(sub)}
                          className="w-4 h-4 accent-[#00a651]"
                        />
                        <span className={`text-sm font-medium transition-colors ${selectedSubCat === sub ? 'text-[#00a651] font-bold' : 'text-slate-600 group-hover:text-[#00a651]'}`}>{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* Grade Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex items-center gap-8">
            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Lớp</span>
            <div className="flex gap-2">
              {['Tất cả', 'Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'].map((grade) => {
                const val = grade === 'Tất cả' ? 'Tất cả' : grade.split(' ')[1];
                return (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(val)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${selectedGrade.toString() === val.toString()
                      ? 'bg-emerald-50 text-[#00a651] ring-1 ring-emerald-200 shadow-sm'
                      : 'bg-transparent text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    {grade}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grouped Books Grid */}
          <div className="space-y-12 bg-white rounded-3xl p-10 border border-slate-100 shadow-sm min-h-[600px]">
            {Object.keys(groupedBooks).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <LayoutGrid className="w-16 h-16 text-slate-200 mb-4" />
                <p className="font-bold text-slate-400">Không có tài liệu phù hợp</p>
              </div>
            ) : (
              Object.entries(groupedBooks).map(([sub, subBooks]: [string, Book[]]) => (
                <section key={sub}>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-slate-800 font-black text-base border-l-4 border-[#00a651] pl-4 uppercase tracking-tight flex items-center gap-3">
                      {sub} <span className="text-slate-400 text-xs font-medium italic">({subBooks.length})</span>
                    </h3>
                    <button className="bg-[#00a651] text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-600 transition-colors">Xem thêm</button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {subBooks.map((book) => (
                      <div key={book.id} className="group cursor-pointer" onClick={() => onBookClick(book)}>
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-100 mb-3 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
                          <img src={book.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={book.title} />
                        </div>
                        <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#00a651] mb-2">{book.title}</h4>
                        <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-medium mb-2">
                          <span>{book.author}</span>
                          <span className="italic">{book.subCategory}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold">
                          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {book.views} lượt xem</span>
                          <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {book.likes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryDetailView;
