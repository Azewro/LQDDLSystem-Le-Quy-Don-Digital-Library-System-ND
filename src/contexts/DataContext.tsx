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
            // Fetch users in batches because of Supabase 1000 limit
            const fetchAllUsersList = async () => {
                let all: any[] = [];
                let from = 0;
                const step = 1000;
                while (true) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .range(from, from + step - 1);
                    if (error) throw error;
                    if (!data || data.length === 0) break;
                    all = [...all, ...data];
                    if (data.length < step) break;
                    from += step;
                }
                return all;
            };

            const [
                { data: newsData },
                { data: introData },
                usersData,
                { data: pagesData }
            ] = await Promise.all([
                supabase.from('news').select('*').order('created_at', { ascending: false }),
                supabase.from('book_introductions').select('*').order('created_at', { ascending: false }),
                fetchAllUsersList(),
                supabase.from('site_pages').select('*')
            ]);

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
