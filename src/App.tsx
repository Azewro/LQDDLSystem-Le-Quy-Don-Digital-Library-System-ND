import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData } from '@/contexts/DataContext';
import { useNavigation, ViewState, AdminSubView } from '@/hooks/useNavigation';

// Layout components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminNavbar from '@/components/layout/AdminNavbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminFooter from '@/components/layout/AdminFooter';

// Common components
import LoginModal from '@/components/common/LoginModal';
import UserProfileModal from '@/components/common/UserProfileModal';

// Feature components - Home
import BannerSlider from '@/components/features/home/BannerSlider';
import VirtualLibrarian from '@/components/features/home/VirtualLibrarian';

// Feature components - Books
import BookSection from '@/components/features/books/BookSection';
import CategorySection from '@/components/features/books/CategorySection';
import DocumentOverview from '@/components/features/books/DocumentOverview';
import CategoryDetailView from '@/components/features/books/CategoryDetailView';
import EBookListView from '@/components/features/books/EBookListView';
import EBookDetailView from '@/components/features/books/EBookDetailView';
import EBookReaderView from '@/components/features/books/EBookReaderView';

// Feature components - News
import NewsList from '@/components/features/news/NewsList';
import NewsDetail from '@/components/features/news/NewsDetail';

// Feature components - Intro
import IntroList from '@/components/features/intro/IntroList';
import IntroDetail from '@/components/features/intro/IntroDetail';

// Feature components - Static
import StaticPageView from '@/components/features/static/StaticPageView';

// Feature components - Admin
import AdminDashboard from '@/components/features/admin/AdminDashboard';
import AdminUserManagement from '@/components/features/admin/AdminUserManagement';
import AdminArticleManagement from '@/components/features/admin/AdminArticleManagement';
import AdminPageManagement from '@/components/features/admin/AdminPageManagement';
import AdminEBookManagement from '@/components/features/admin/AdminEBookManagement';

import { Book } from '@/types';
import { Loader2, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
    const { user, setUser, showLogin, setShowLogin, showProfile, setShowProfile, mustChangePassword, handleLoginSuccess, handleLogout } = useAuth();
    const { books, news, intros, allUsers, sitePages, ebooks, ebookFolders, loading, fetchData } = useData();
    const nav = useNavigation();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Đồng bộ thông tin user hiện tại khi allUsers thay đổi (ví dụ: sau khi cập nhật avatar)
    useEffect(() => {
        if (user && allUsers.length > 0) {
            const updatedUser = allUsers.find(u => u.id === user.id);
            if (updatedUser && (
                updatedUser.avatar_url !== user.avatar_url ||
                updatedUser.name !== user.name ||
                updatedUser.phone !== user.phone
            )) {
                setUser(updatedUser);
            }
        }
    }, [allUsers, user, setUser]);

    const handleBookClick = (book: Book) => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        window.alert(`Đang mượn tài liệu: ${book.title}`);
    };

    const isAdminView = nav.currentView === 'admin' && user?.role === 'admin';

    if (loading && nav.currentView === 'home') {
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
                        onLogout={() => { handleLogout(); nav.navigateToHome(); }}
                        onProfileClick={() => setShowProfile(true)}
                        onNavigateHome={nav.navigateToHome}
                        onToggleSidebar={nav.toggleAdminSidebar}
                        isSidebarCollapsed={nav.isAdminSidebarCollapsed}
                    />
                    <div className="flex flex-1 overflow-hidden">
                        <AdminSidebar
                            activeMenu={nav.adminSubView}
                            isCollapsed={nav.isAdminSidebarCollapsed}
                            onMenuClick={(id) => nav.setAdminSubView(id as AdminSubView)}
                        />
                        <div className="flex-1 bg-slate-50 custom-scrollbar relative z-10 flex flex-col h-full overflow-y-auto">
                            <main className="flex-1">
                                {nav.adminSubView === 'dashboard' && <AdminDashboard />}
                                {nav.adminSubView === 'users' && <AdminUserManagement users={allUsers} onRefresh={fetchData} currentUser={user} />}
                                {nav.adminSubView === 'admin-introductions' && <AdminArticleManagement type="introduction" items={intros} onRefresh={fetchData} />}
                                {nav.adminSubView === 'admin-news' && <AdminArticleManagement type="news" items={news} onRefresh={fetchData} />}
                                {nav.adminSubView === 'admin-pages' && <AdminPageManagement pages={sitePages} onRefresh={fetchData} />}
                                {nav.adminSubView === 'admin-ebooks' && <AdminEBookManagement ebooks={ebooks} folders={ebookFolders} onRefresh={fetchData} />}
                                {nav.adminSubView === 'books' && <div className="p-20 text-center opacity-30 font-black italic">QUẢN LÝ KHO TÀI LIỆU (ĐANG PHÁT TRIỂN)</div>}
                                {nav.adminSubView === 'settings' && <div className="p-20 text-center opacity-30 font-black italic">CẤU HÌNH HỆ THỐNG (ĐANG PHÁT TRIỂN)</div>}
                            </main>
                            <AdminFooter onNavigateHome={nav.navigateToHome} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <Navbar
                        user={user}
                        onLoginClick={() => setShowLogin(true)}
                        onLogout={() => { handleLogout(); nav.navigateToHome(); }}
                        onProfileClick={() => setShowProfile(true)}
                        onNavigateHome={nav.navigateToHome}
                        onNavigateIntro={nav.navigateToIntroList}
                        onNavigateNews={nav.navigateToNewsList}
                        onNavigateDocs={nav.navigateToDocOverview}
                        onNavigateCategory={nav.navigateToCategory}
                        onNavigateStatic={nav.navigateToStaticPage}
                        onEBookClick={nav.navigateToEBookList}
                    />
                    <main className="flex-1">
                        {nav.currentView === 'home' && (
                            <>
                                <BannerSlider />
                                <CategorySection onCategoryClick={nav.navigateToCategory} onEBookClick={nav.navigateToEBookList} />
                                <div className="max-w-[1440px] mx-auto px-6 space-y-12 pb-16">
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-8">
                                                <h2 className="text-slate-800 font-black text-lg border-l-4 border-[#00a651] pl-4 uppercase tracking-tight">Bài giới thiệu sách</h2>
                                                <button onClick={nav.navigateToIntroList} className="text-[11px] font-bold text-[#00a651] uppercase tracking-wider hover:underline">Xem tất cả</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                {intros.slice(0, 4).map(intro => (
                                                    <div key={intro.id} className="group cursor-pointer" onClick={() => nav.navigateToIntroDetail(intro)}>
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
                                                <button onClick={nav.navigateToNewsList} className="text-[11px] font-bold text-[#00a651] uppercase tracking-wider hover:underline">Xem tất cả</button>
                                            </div>
                                            <div className="space-y-6">
                                                {news.slice(0, 4).map(item => (
                                                    <div key={item.id} className="flex gap-5 group cursor-pointer items-start" onClick={() => nav.navigateToNewsDetail(item)}>
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

                                    {/* Real Data Section: Sách điện tử */}
                                    <BookSection
                                        title="Sách điện tử mới"
                                        books={ebooks.slice(0, 5).map(eb => ({
                                            id: eb.id,
                                            title: eb.title,
                                            author: eb.author,
                                            publisher: eb.publisher,
                                            category: 'Sách điện tử',
                                            type: 'ebook',
                                            coverImage: eb.cover_url || `https://drive.google.com/thumbnail?id=${eb.drive_file_id}&sz=w400`,
                                            views: eb.views,
                                            likes: eb.favorites,
                                            year: eb.publication_year,
                                            grade: eb.grade
                                        }))}
                                        onBookClick={(b) => {
                                            const eb = ebooks.find(e => e.id === b.id);
                                            if (eb) nav.navigateToEBookDetail(eb);
                                        }}
                                        onViewAll={nav.navigateToEBookList}
                                    />

                                    {/* Mock Data Sections */}
                                    <BookSection
                                        title="Sách nói"
                                        books={books.filter(b => b.category === 'Sách nói').slice(0, 5)}
                                        onBookClick={handleBookClick}
                                        onViewAll={() => nav.navigateToCategory('Sách nói')}
                                    />

                                    <BookSection
                                        title="Bài giảng điện tử"
                                        books={books.filter(b => b.category === 'Bài giảng điện tử').slice(0, 5)}
                                        onBookClick={handleBookClick}
                                        onViewAll={() => nav.navigateToCategory('Bài giảng điện tử')}
                                    />

                                    <BookSection
                                        title="Video"
                                        books={books.filter(b => b.category === 'Video').slice(0, 5)}
                                        onBookClick={handleBookClick}
                                        onViewAll={() => nav.navigateToCategory('Video')}
                                    />

                                    <BookSection
                                        title="Báo, tạp chí"
                                        books={books.filter(b => b.category === 'Báo, tạp chí').slice(0, 5)}
                                        onBookClick={handleBookClick}
                                        onViewAll={() => nav.navigateToCategory('Báo, tạp chí')}
                                    />

                                    <BookSection
                                        title="Album ảnh"
                                        books={books.filter(b => b.category === 'Album ảnh').slice(0, 5)}
                                        onBookClick={handleBookClick}
                                        onViewAll={() => nav.navigateToCategory('Album ảnh')}
                                    />
                                </div>
                            </>
                        )}
                        {nav.currentView === 'static-page' && nav.activeStaticPage && <StaticPageView page={nav.activeStaticPage} onBack={nav.navigateToHome} />}
                        {nav.currentView === 'doc-overview' && <DocumentOverview books={books} onBookClick={handleBookClick} onNavigateCategory={nav.navigateToCategory} />}
                        {nav.currentView === 'doc-category' && <CategoryDetailView category={nav.selectedCategory} books={books} onBookClick={handleBookClick} onNavigateHome={nav.navigateToHome} onNavigateOverview={nav.navigateToDocOverview} />}
                        {nav.currentView === 'intro-list' && <IntroList introductions={intros} onSelectIntro={nav.navigateToIntroDetail} onBack={nav.navigateToHome} />}
                        {nav.currentView === 'intro-detail' && nav.selectedIntro && <IntroDetail intro={nav.selectedIntro} allIntros={intros} onNavigateDetail={nav.navigateToIntroDetail} onNavigateList={nav.navigateToIntroList} onNavigateHome={nav.navigateToHome} />}
                        {nav.currentView === 'news-list' && <NewsList newsList={news} onSelectNews={nav.navigateToNewsDetail} onBack={nav.navigateToHome} />}
                        {nav.currentView === 'news-detail' && nav.selectedNews && <NewsDetail news={nav.selectedNews} allNews={news} onNavigateDetail={nav.navigateToNewsDetail} onNavigateList={nav.navigateToIntroList} onNavigateHome={nav.navigateToHome} />}
                        {nav.currentView === 'ebook-list' && <EBookListView ebooks={ebooks} folders={ebookFolders} onBookClick={nav.navigateToEBookDetail} onNavigateHome={nav.navigateToHome} onNavigateOverview={nav.navigateToDocOverview} />}
                        {nav.currentView === 'ebook-detail' && nav.selectedEBook && <EBookDetailView book={nav.selectedEBook} onBack={nav.navigateToEBookList} onRead={nav.navigateToEBookReader} />}
                        {nav.currentView === 'ebook-reader' && nav.selectedEBook && <EBookReaderView book={nav.selectedEBook} onBack={() => nav.navigateToEBookDetail(nav.selectedEBook!)} />}
                    </main>
                    <Footer onNavigateHome={nav.navigateToHome} onNavigateIntro={nav.navigateToIntroList} onNavigateNews={nav.navigateToNewsList} onEBookClick={nav.navigateToEBookList} />
                </>
            )}

            {user?.role === 'admin' && (
                <button
                    onClick={nav.navigateToAdmin}
                    className={`fixed bottom-32 right-8 p-5 rounded-full shadow-2xl transition-all z-[200] group border-2 ${isAdminView
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

const App: React.FC = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </AuthProvider>
    );
};

export default App;
