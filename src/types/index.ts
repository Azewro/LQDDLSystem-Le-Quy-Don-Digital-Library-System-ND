
export type UserRole = 'admin' | 'student' | 'teacher';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  class_name?: string;
  department?: string;
  card_code?: string;
  barcode?: string;
  dob?: string;
  gender?: string;
  expiry_date?: string;
  issue_date?: string;      // Ngày cấp thẻ
  effective_date?: string;  // Ngày hiệu lực
  is_active?: boolean;      // Trạng thái theo dõi
  is_librarian?: boolean;   // Cho phép làm thư viện trưởng (giáo viên)
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
  gallery?: string[];
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
