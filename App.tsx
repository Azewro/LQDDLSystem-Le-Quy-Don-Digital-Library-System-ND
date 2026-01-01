
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BookSection from './components/BookSection';
import LoginModal from './components/LoginModal';
import VirtualLibrarian from './components/VirtualLibrarian';
import BannerSlider from './components/BannerSlider';
import CategorySection from './components/CategorySection';
import IntroList from './components/IntroList';
import IntroDetail from './components/IntroDetail';
import NewsList from './components/NewsList';
import NewsDetail from './components/NewsDetail';
import DocumentOverview from './components/DocumentOverview';
import CategoryDetailView from './components/CategoryDetailView';
import StaticPageView from './components/StaticPageView';
import Footer from './components/Footer';
import { BOOKS as MOCK_BOOKS, NEWS as MOCK_NEWS, BOOK_INTRODUCTIONS as MOCK_INTRODUCTIONS } from './data/mockData';
import { User, Book, BookIntroduction, NewsItem, StaticPage } from './types';
import { supabase } from './lib/supabase';

type ViewState = 'home' | 'intro-list' | 'intro-detail' | 'news-list' | 'news-detail' | 'doc-overview' | 'doc-category' | 'static-page';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedIntro, setSelectedIntro] = useState<BookIntroduction | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeStaticPage, setActiveStaticPage] = useState<StaticPage | null>(null);
  
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [intros, setIntros] = useState<BookIntroduction[]>(MOCK_INTRODUCTIONS);
  const [loading, setLoading] = useState(false);

  const navigateToHome = () => { setCurrentView('home'); window.scrollTo(0, 0); };
  const navigateToIntroList = () => { setCurrentView('intro-list'); window.scrollTo(0, 0); };
  const navigateToIntroDetail = (intro: BookIntroduction) => { setSelectedIntro(intro); setCurrentView('intro-detail'); window.scrollTo(0, 0); };
  const navigateToNewsList = () => { setCurrentView('news-list'); window.scrollTo(0, 0); };
  const navigateToNewsDetail = (news: NewsItem) => { setSelectedNews(news); setCurrentView('news-detail'); window.scrollTo(0, 0); };
  const navigateToDocOverview = () => { setCurrentView('doc-overview'); window.scrollTo(0, 0); };
  const navigateToCategory = (cat: string) => { setSelectedCategory(cat); setCurrentView('doc-category'); window.scrollTo(0, 0); };
  
  const navigateToStaticPage = (slug: string, title: string) => {
    // Demo content cho trang tĩnh khi chưa có DB thật
    setActiveStaticPage({
      id: slug,
      slug: slug,
      title: title,
      content: `<p>Chào mừng bạn đến với trang ${title} của Thư viện điện tử trường THCS Lê Quý Đôn.</p><p>Tại đây chúng tôi cung cấp đầy đủ các thông tin cần thiết dành cho giáo viên và học sinh...</p>`,
      updated_at: new Date().toISOString()
    });
    setCurrentView('static-page');
    window.scrollTo(0, 0);
  };

  const handleBookClick = (book: Book) => {
    if (!user) { setShowLogin(true); return; }
    window.alert(`Đang mở tài liệu: ${book.title}`);
  };

  const getBooksByCategory = (cat: string) => books.filter(b => b.category === cat);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-100 flex flex-col font-['Inter']">
      <Navbar 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
        onLogout={() => setUser(null)} 
        onNavigateHome={navigateToHome}
        onNavigateIntro={navigateToIntroList}
        onNavigateNews={navigateToNewsList}
        onNavigateDocs={navigateToDocOverview}
        onNavigateCategory={navigateToCategory}
        onNavigateStatic={navigateToStaticPage}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <BannerSlider />
            <CategorySection onCategoryClick={navigateToCategory} />
            <div className="max-w-[1440px] mx-auto px-6 space-y-12 pb-16">
              <BookSection title="Sách mới cập nhật" books={books.slice(0, 5)} onBookClick={handleBookClick} />
              <div className="grid lg:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight">Bài giới thiệu sách</h2>
                    <button onClick={navigateToIntroList} className="text-[11px] font-bold text-[#00a651] uppercase tracking-wider hover:underline">Xem tất cả</button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {intros.slice(0, 4).map(intro => (
                      <div key={intro.id} className="group cursor-pointer" onClick={() => navigateToIntroDetail(intro)}>
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-sm border border-slate-50">
                          <img src={intro.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={intro.title} />
                        </div>
                        <h3 className="text-[12px] font-bold text-slate-800 line-clamp-2 h-9 mb-1">{intro.title}</h3>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight">Tin Tức Hoạt Động</h2>
                    <button onClick={navigateToNewsList} className="text-[11px] font-bold text-[#00a651] uppercase tracking-wider hover:underline">Xem tất cả</button>
                  </div>
                  <div className="space-y-6">
                    {news.slice(0, 4).map(item => (
                      <div key={item.id} className="flex gap-5 group cursor-pointer items-start" onClick={() => navigateToNewsDetail(item)}>
                        <div className="w-28 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-50">
                          <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[13px] font-bold text-slate-800 group-hover:text-[#00a651] line-clamp-1">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic mt-1">{item.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

        {currentView === 'static-page' && activeStaticPage && (
          <StaticPageView page={activeStaticPage} onBack={navigateToHome} />
        )}
        {currentView === 'doc-overview' && <DocumentOverview books={books} onBookClick={handleBookClick} onNavigateCategory={navigateToCategory} />}
        {currentView === 'doc-category' && <CategoryDetailView category={selectedCategory} books={books} onBookClick={handleBookClick} onNavigateHome={navigateToHome} onNavigateOverview={navigateToDocOverview} />}
        {currentView === 'intro-list' && <IntroList introductions={intros} onSelectIntro={navigateToIntroDetail} onBack={navigateToHome} />}
        {currentView === 'intro-detail' && selectedIntro && <IntroDetail intro={selectedIntro} allIntros={intros} onNavigateDetail={navigateToIntroDetail} onNavigateList={navigateToIntroList} onNavigateHome={navigateToHome} />}
        {currentView === 'news-list' && <NewsList newsList={news} onSelectNews={navigateToNewsDetail} onBack={navigateToHome} />}
        {currentView === 'news-detail' && selectedNews && <NewsDetail news={selectedNews} allNews={news} onNavigateDetail={navigateToNewsDetail} onNavigateList={navigateToNewsList} onNavigateHome={navigateToHome} />}
      </main>

      <Footer onNavigateHome={navigateToHome} onNavigateIntro={navigateToIntroList} onNavigateNews={navigateToNewsList} />
      <VirtualLibrarian />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={setUser} />}
    </div>
  );
};

export default App;
