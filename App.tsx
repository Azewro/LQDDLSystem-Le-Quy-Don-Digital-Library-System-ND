
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import AdminSidebar from './components/AdminSidebar';
import BookSection from './components/BookSection';
import LoginModal from './components/LoginModal';
import UserProfileModal from './components/UserProfileModal';
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
import AdminDashboard from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import AdminArticleManagement from './components/AdminArticleManagement';
import Footer from './components/Footer';
import AdminFooter from './components/AdminFooter';
import { BOOKS as MOCK_BOOKS } from './data/mockData';
import { User, Book, BookIntroduction, NewsItem, StaticPage, Category } from './types';
import { supabase } from './lib/supabase';
import { Loader2, Settings } from 'lucide-react';

type ViewState = 'home' | 'intro-list' | 'intro-detail' | 'news-list' | 'news-detail' | 'doc-overview' | 'doc-category' | 'static-page' | 'admin';
type AdminSubView = 'dashboard' | 'users' | 'books' | 'admin-news' | 'admin-introductions' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('dashboard');
  
  const [selectedIntro, setSelectedIntro] = useState<BookIntroduction | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeStaticPage, setActiveStaticPage] = useState<StaticPage | null>(null);
  const [isAdminSidebarCollapsed, setIsAdminSidebarCollapsed] = useState(false);
  
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [intros, setIntros] = useState<BookIntroduction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      const { data: introData } = await supabase.from('book_introductions').select('*').order('created_at', { ascending: false });
      const { data: usersData } = await supabase.from('profiles').select('*');

      if (newsData) setNews(newsData.map(n => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        content_html: n.content_html,
        author: n.author,
        views: n.views,
        date: new Date(n.created_at).toLocaleDateString('vi-VN'), 
        image: n.image_url
      })));
      if (introData) setIntros(introData.map(i => ({
        id: i.id,
        title: i.title,
        summary: i.summary,
        content_html: i.content_html,
        author: i.author,
        views: i.views,
        date: new Date(i.created_at).toLocaleDateString('vi-VN'), 
        image: i.image_url
      })));
      if (usersData) setAllUsers(usersData.map(u => ({
        id: u.id,
        username: u.username,
        name: u.full_name,
        role: u.role,
        phone: u.phone,
        class_name: u.class_name,
        department: u.department,
        card_code: u.card_code,
        barcode: u.barcode,
        dob: u.dob,
        expiry_date: u.expiry_date
      })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToHome = () => { setCurrentView('home'); window.scrollTo(0, 0); };
  const navigateToIntroList = () => { setCurrentView('intro-list'); window.scrollTo(0, 0); };
  const navigateToIntroDetail = (intro: BookIntroduction) => { setSelectedIntro(intro); setCurrentView('intro-detail'); window.scrollTo(0, 0); };
  const navigateToNewsList = () => { setCurrentView('news-list'); window.scrollTo(0, 0); };
  const navigateToNewsDetail = (news: NewsItem) => { setSelectedNews(news); setCurrentView('news-detail'); window.scrollTo(0, 0); };
  const navigateToDocOverview = () => { setCurrentView('doc-overview'); window.scrollTo(0, 0); };
  const navigateToCategory = (cat: string) => { setSelectedCategory(cat); setCurrentView('doc-category'); window.scrollTo(0, 0); };
  const navigateToAdmin = () => { setCurrentView('admin'); window.scrollTo(0, 0); };
  
  const navigateToStaticPage = async (slug: string, title: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.from('site_pages').select('*').eq('slug', slug).single();
      if (data) setActiveStaticPage(data);
      setCurrentView('static-page');
    } catch (err) { console.error(err); } finally { setLoading(false); window.scrollTo(0, 0); }
  };

  const handleBookClick = (book: Book) => {
    if (!user) { setShowLogin(true); return; }
    window.alert(`Đang mượn tài liệu: ${book.title}`);
  };

  const handleLoginSuccess = (userData: User, mustChange: boolean = false) => {
    setUser(userData);
    if (mustChange) {
      setMustChangePassword(true);
      setShowProfile(true);
    } else {
      setShowLogin(false);
    }
  };

  const isAdminView = currentView === 'admin' && user?.role === 'admin';

  if (loading && currentView === 'home') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-[#00a651] animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-['Inter'] ${isAdminView ? 'bg-slate-900' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {isAdminView ? (
        <div className="flex flex-col h-screen overflow-hidden">
          <AdminNavbar 
            user={user} 
            onLogout={() => {setUser(null); navigateToHome();}} 
            onProfileClick={() => setShowProfile(true)}
            onNavigateHome={navigateToHome}
            onToggleSidebar={() => setIsAdminSidebarCollapsed(!isAdminSidebarCollapsed)}
            isSidebarCollapsed={isAdminSidebarCollapsed}
          />
          <div className="flex flex-1 overflow-hidden">
            <AdminSidebar 
              activeMenu={adminSubView} 
              isCollapsed={isAdminSidebarCollapsed} 
              onMenuClick={(id) => setAdminSubView(id as AdminSubView)}
            />
            <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
              <main className="min-h-full">
                {adminSubView === 'dashboard' && <AdminDashboard />}
                {adminSubView === 'users' && <AdminUserManagement users={allUsers} onRefresh={fetchData} />}
                {adminSubView === 'admin-introductions' && <AdminArticleManagement type="introduction" items={intros} onRefresh={fetchData} />}
                {adminSubView === 'admin-news' && <AdminArticleManagement type="news" items={news} onRefresh={fetchData} />}
                {adminSubView === 'books' && <div className="p-20 text-center opacity-30 font-black italic">QUẢN LÝ KHO TÀI LIỆU (ĐANG PHÁT TRIỂN)</div>}
                {adminSubView === 'settings' && <div className="p-20 text-center opacity-30 font-black italic">CẤU HÌNH HỆ THỐNG (ĐANG PHÁT TRIỂN)</div>}
              </main>
              <AdminFooter onNavigateHome={navigateToHome} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar 
            user={user} 
            onLoginClick={() => setShowLogin(true)} 
            onLogout={() => {setUser(null); navigateToHome();}} 
            onProfileClick={() => setShowProfile(true)}
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
            {currentView === 'static-page' && activeStaticPage && <StaticPageView page={activeStaticPage} onBack={navigateToHome} />}
            {currentView === 'doc-overview' && <DocumentOverview books={books} onBookClick={handleBookClick} onNavigateCategory={navigateToCategory} />}
            {currentView === 'doc-category' && <CategoryDetailView category={selectedCategory} books={books} onBookClick={handleBookClick} onNavigateHome={navigateToHome} onNavigateOverview={navigateToDocOverview} />}
            {currentView === 'intro-list' && <IntroList introductions={intros} onSelectIntro={navigateToIntroDetail} onBack={navigateToHome} />}
            {currentView === 'intro-detail' && selectedIntro && <IntroDetail intro={selectedIntro} allIntros={intros} onNavigateDetail={navigateToIntroDetail} onNavigateList={navigateToIntroList} onNavigateHome={navigateToHome} />}
            {currentView === 'news-list' && <NewsList newsList={news} onSelectNews={navigateToNewsDetail} onBack={navigateToHome} />}
            {currentView === 'news-detail' && selectedNews && <NewsDetail news={selectedNews} allNews={news} onNavigateDetail={navigateToNewsDetail} onNavigateList={navigateToIntroList} onNavigateHome={navigateToHome} />}
          </main>
          <Footer onNavigateHome={navigateToHome} onNavigateIntro={navigateToIntroList} onNavigateNews={navigateToNewsList} />
        </>
      )}
      
      {user?.role === 'admin' && (
        <button 
          onClick={navigateToAdmin}
          className={`fixed bottom-32 right-8 p-5 rounded-full shadow-2xl transition-all z-[200] group border-2 ${
            isAdminView 
            ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' 
            : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-900'
          }`}
        >
          <Settings className={`w-6 h-6 ${isAdminView ? 'animate-spin-slow' : ''}`} />
          <span className="absolute right-full mr-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap shadow-xl">
            {isAdminView ? 'Đang ở chế độ Quản trị' : 'Vào hệ thống Quản trị'}
          </span>
        </button>
      )}

      {!isAdminView && <VirtualLibrarian />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLoginSuccess} />}
      {showProfile && user && (
        <UserProfileModal 
          user={user} 
          isFirstTime={mustChangePassword} 
          onClose={() => { if (!mustChangePassword) setShowProfile(false); }} 
        />
      )}
    </div>
  );
};

export default App;
