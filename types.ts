
export type UserRole = 'guest' | 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  category: string;
  subCategory?: string;
  grade?: number | string;
  type: 'ebook' | 'audio' | 'video' | 'docx';
  coverImage: string;
  views: number;
  likes: number;
  rating?: number;
  year?: string | number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  image: string;
  author: string;
  views: number;
  content_html?: string;
  gallery?: string[]; // Mảng các URL ảnh
}

export interface BookIntroduction {
  id: string;
  title: string;
  image: string;
  date: string;
  views: number;
  author: string;
  content_html: string;
  summary?: string;
  gallery?: string[];
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_name: string;
  parent_id?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
