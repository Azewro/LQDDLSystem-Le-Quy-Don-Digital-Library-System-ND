import { useState, useCallback } from 'react';
import { BookIntroduction, NewsItem, StaticPage, EBook } from '@/types';
import { supabase } from '@/lib/supabase';

export type ViewState = 'home' | 'intro-list' | 'intro-detail' | 'news-list' | 'news-detail' | 'doc-overview' | 'doc-category' | 'static-page' | 'admin' | 'ebook-list' | 'ebook-detail' | 'ebook-reader';
export type AdminSubView = 'dashboard' | 'users' | 'books' | 'admin-news' | 'admin-introductions' | 'settings' | 'admin-pages' | 'admin-ebooks';

export const useNavigation = () => {
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [adminSubView, setAdminSubView] = useState<AdminSubView>('dashboard');
    const [selectedIntro, setSelectedIntro] = useState<BookIntroduction | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [activeStaticPage, setActiveStaticPage] = useState<StaticPage | null>(null);
    const [selectedEBook, setSelectedEBook] = useState<EBook | null>(null);
    const [isAdminSidebarCollapsed, setIsAdminSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigateToHome = useCallback(() => {
        setCurrentView('home');
        window.scrollTo(0, 0);
    }, []);

    const navigateToIntroList = useCallback(() => {
        setCurrentView('intro-list');
        window.scrollTo(0, 0);
    }, []);

    const navigateToIntroDetail = useCallback((intro: BookIntroduction) => {
        setSelectedIntro(intro);
        setCurrentView('intro-detail');
        window.scrollTo(0, 0);
    }, []);

    const navigateToNewsList = useCallback(() => {
        setCurrentView('news-list');
        window.scrollTo(0, 0);
    }, []);

    const navigateToNewsDetail = useCallback((news: NewsItem) => {
        setSelectedNews(news);
        setCurrentView('news-detail');
        window.scrollTo(0, 0);
    }, []);

    const navigateToDocOverview = useCallback(() => {
        setCurrentView('doc-overview');
        window.scrollTo(0, 0);
    }, []);

    const navigateToCategory = useCallback((cat: string) => {
        setSelectedCategory(cat);
        setCurrentView('doc-category');
        window.scrollTo(0, 0);
    }, []);

    const navigateToAdmin = useCallback(() => {
        setCurrentView('admin');
        window.scrollTo(0, 0);
    }, []);

    const navigateToStaticPage = useCallback(async (slug: string, _title: string) => {
        setLoading(true);
        try {
            const { data } = await supabase.from('site_pages').select('*').eq('slug', slug).single();
            if (data) setActiveStaticPage(data);
            setCurrentView('static-page');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            window.scrollTo(0, 0);
        }
    }, []);

    const toggleAdminSidebar = useCallback(() => {
        setIsAdminSidebarCollapsed(prev => !prev);
    }, []);

    const navigateToEBookList = useCallback(() => {
        setCurrentView('ebook-list');
        window.scrollTo(0, 0);
    }, []);

    const navigateToEBookDetail = useCallback((book: EBook) => {
        setSelectedEBook(book);
        setCurrentView('ebook-detail');
        window.scrollTo(0, 0);
    }, []);

    const navigateToEBookReader = useCallback(() => {
        setCurrentView('ebook-reader');
        window.scrollTo(0, 0);
    }, []);

    return {
        currentView,
        setCurrentView,
        adminSubView,
        setAdminSubView,
        selectedIntro,
        selectedNews,
        selectedCategory,
        activeStaticPage,
        selectedEBook,
        isAdminSidebarCollapsed,
        loading,
        navigateToHome,
        navigateToIntroList,
        navigateToIntroDetail,
        navigateToNewsList,
        navigateToNewsDetail,
        navigateToDocOverview,
        navigateToCategory,
        navigateToAdmin,
        navigateToStaticPage,
        toggleAdminSidebar,
        navigateToEBookList,
        navigateToEBookDetail,
        navigateToEBookReader
    };
};
