import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Book, NewsItem, BookIntroduction, StaticPage } from '@/types';
import { supabase } from '@/lib/supabase';
import { BOOKS as MOCK_BOOKS } from '@/data/mockData';

interface DataContextType {
    books: Book[];
    news: NewsItem[];
    intros: BookIntroduction[];
    allUsers: User[];
    sitePages: StaticPage[];
    loading: boolean;
    fetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [intros, setIntros] = useState<BookIntroduction[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [sitePages, setSitePages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
            const { data: introData } = await supabase.from('book_introductions').select('*').order('created_at', { ascending: false });
            const { data: usersData } = await supabase.from('profiles').select('*');
            const { data: pagesData } = await supabase.from('site_pages').select('*');

            if (newsData) setNews(newsData.map(n => ({
                id: n.id,
                title: n.title,
                summary: n.summary,
                content_html: n.content_html,
                author: n.author,
                views: n.views,
                date: new Date(n.created_at).toLocaleDateString('vi-VN'),
                image: n.image_url,
                image_url: n.image_url
            })));
            if (introData) setIntros(introData.map(i => ({
                id: i.id,
                title: i.title,
                summary: i.summary,
                content_html: i.content_html,
                author: i.author,
                views: i.views,
                date: new Date(i.created_at).toLocaleDateString('vi-VN'),
                image: i.image_url,
                image_url: i.image_url
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
                expiry_date: u.expiry_date,
                issue_date: u.issue_date,
                effective_date: u.effective_date,
                is_active: u.is_active,
                is_librarian: u.is_librarian,
                avatar_url: u.avatar_url
            })));
            if (pagesData) setSitePages(pagesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <DataContext.Provider value={{ books, news, intros, allUsers, sitePages, loading, fetchData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
