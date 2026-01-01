
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
  category: string; // Sách điện tử, Sách nói, Video...
  subCategory?: string; // SGK, Tham khảo, Tâm lý...
  grade?: number | string; // 6, 7, 8, 9
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
  content?: string;
}

export interface BookIntroduction {
  id: string;
  title: string;
  image: string;
  date: string;
  views: number;
  author: string;
  content: string;
  summary?: string;
}

export interface AlbumItem {
  id: string;
  title: string;
  description: string;
  image: string;
  views: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
