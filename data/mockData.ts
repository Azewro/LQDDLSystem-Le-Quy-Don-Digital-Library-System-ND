
import { Book, NewsItem, BookIntroduction } from '../types';

export const BOOKS: Book[] = [
  // --- SÁCH ĐIỆN TỬ ---
  { id: 'e1', title: 'Lịch sử và địa lý 8: SGK (Kết nối tri thức)', author: 'Vũ Minh Giang', type: 'ebook', category: 'Sách điện tử', subCategory: 'SGK Lớp 8 Kết nối tri thức', grade: 8, coverImage: 'https://picsum.photos/seed/e1/300/400', views: 5000, likes: 120 },
  { id: 'e2', title: 'Toán 7 - T.1: SGK (Kết nối tri thức)', author: 'Trần Nam Dũng', type: 'ebook', category: 'Sách điện tử', subCategory: 'SGK Lớp 7 Kết nối tri thức', grade: 7, coverImage: 'https://picsum.photos/seed/e2/300/400', views: 3200, likes: 45 },
  { id: 'e3', title: 'Tiếng Anh 8 - Global Success', author: 'Hoàng Văn Vân', type: 'ebook', category: 'Sách điện tử', subCategory: 'SGK Lớp 8 Kết nối tri thức', grade: 8, coverImage: 'https://picsum.photos/seed/e3/300/400', views: 4100, likes: 67 },
  { id: 'e4', title: 'Đột phá Ngữ văn 9', author: 'Nhiều tác giả', type: 'ebook', category: 'Sách điện tử', subCategory: 'Tham khảo các môn học', grade: 9, coverImage: 'https://picsum.photos/seed/e4/300/400', views: 2500, likes: 88 },
  { id: 'e5', title: 'Địa lý: Lâm nghiệp và thủy sản', author: 'Tổ Địa lý', type: 'ebook', category: 'Sách điện tử', subCategory: 'Tham khảo các môn học', grade: 8, coverImage: 'https://picsum.photos/seed/e5/300/400', views: 1200, likes: 15 },
  { id: 'e6', title: 'Vật lý 9: Bài tập nâng cao', author: 'Nguyễn Văn B', type: 'ebook', category: 'Sách điện tử', subCategory: 'Tham khảo các môn học', grade: 9, coverImage: 'https://picsum.photos/seed/e6/300/400', views: 800, likes: 30 },

  // --- SÁCH NÓI ---
  { id: 'a1', title: 'Quên đi quá khứ sống đời tự tại', author: 'Lama Surya Das', type: 'audio', category: 'Sách nói', subCategory: 'Tâm lý - Kỹ năng sống', coverImage: 'https://picsum.photos/seed/a1/300/400', views: 420, likes: 88 },
  { id: 'a2', title: 'Thay thái độ đổi cuộc đời', author: 'Jeff Keller', type: 'audio', category: 'Sách nói', subCategory: 'Tâm lý - Kỹ năng sống', coverImage: 'https://picsum.photos/seed/a2/300/400', views: 850, likes: 120 },
  { id: 'a3', title: 'Sức mạnh của lòng kiên nhẫn', author: 'M.J. Ryan', type: 'audio', category: 'Sách nói', subCategory: 'Tâm lý - Kỹ năng sống', coverImage: 'https://picsum.photos/seed/a3/300/400', views: 600, likes: 50 },
  { id: 'a4', title: 'Lòng trắc ẩn', author: 'Dani DiPirro', type: 'audio', category: 'Sách nói', subCategory: 'Tâm lý - Kỹ năng sống', coverImage: 'https://picsum.photos/seed/a4/300/400', views: 300, likes: 25 },

  // --- BÀI GIẢNG ĐIỆN TỬ ---
  { id: 'bg1', title: 'Hệ thức lượng trong tam giác vuông', author: 'Thầy Trần Văn C', type: 'video', category: 'Bài giảng điện tử', subCategory: 'Toán học', grade: 9, coverImage: 'https://picsum.photos/seed/bg1/300/400', views: 1200, likes: 95 },
  { id: 'bg2', title: 'Cấu tạo nguyên tử - Hóa học 8', author: 'Cô Lê Thị D', type: 'video', category: 'Bài giảng điện tử', subCategory: 'Hóa học', grade: 8, coverImage: 'https://picsum.photos/seed/bg2/300/400', views: 950, likes: 40 },

  // --- VIDEO ---
  { id: 'v1', title: 'Review sách: Ở nhà đọc sách thử thách', author: 'Nghiêm Khánh Linh', type: 'video', category: 'Video', subCategory: 'Hoạt động của học sinh', grade: 9, coverImage: 'https://picsum.photos/seed/v1/300/400', views: 1500, likes: 450 },
  { id: 'v2', title: 'Hành trình di sản Việt Nam', author: 'VTV', type: 'video', category: 'Video', subCategory: 'Tham khảo', coverImage: 'https://picsum.photos/seed/v2/300/400', views: 2100, likes: 180 },
  { id: 'v3', title: 'Thí nghiệm Vật lý vui', author: 'CLB Khoa học', type: 'video', category: 'Video', subCategory: 'Tham khảo', coverImage: 'https://picsum.photos/seed/v3/300/400', views: 3200, likes: 500 },

  // --- ALBUM ẢNH ---
  { id: 'ab1', title: 'Ngày hội đọc sách 2024', author: 'Thư viện', type: 'video', category: 'Album ảnh', subCategory: 'Hoạt động của Thư viện', coverImage: 'https://picsum.photos/seed/ab1/300/400', views: 890, likes: 120 },
  { id: 'ab2', title: 'Khai giảng năm học mới', author: 'Đoàn trường', type: 'video', category: 'Album ảnh', subCategory: 'Hoạt động của học sinh', coverImage: 'https://picsum.photos/seed/ab2/300/400', views: 1200, likes: 250 },

  // --- KỸ NĂNG SỐNG ---
  { id: 'kn1', title: 'Kỹ năng giao tiếp cho học sinh', author: 'NXB Trẻ', type: 'ebook', category: 'Kỹ năng sống', subCategory: 'Tham khảo', coverImage: 'https://picsum.photos/seed/kn1/300/400', views: 750, likes: 45 },
  { id: 'kn2', title: 'Quản lý thời gian hiệu quả', author: 'NXB Giáo dục', type: 'ebook', category: 'Kỹ năng sống', subCategory: 'Tham khảo', coverImage: 'https://picsum.photos/seed/kn2/300/400', views: 600, likes: 32 },

  // --- BÁO, TẠP CHÍ ---
  { id: 'tc1', title: 'Tạp chí Hoa học trò số 1450', author: 'Tòa soạn HHT', type: 'ebook', category: 'Báo, tạp chí', subCategory: 'Giải trí', coverImage: 'https://picsum.photos/seed/tc1/300/400', views: 1800, likes: 300 },
  { id: 'tc2', title: 'Báo Thiếu niên Tiền phong', author: 'Tòa soạn TNTP', type: 'ebook', category: 'Báo, tạp chí', subCategory: 'Tin tức', coverImage: 'https://picsum.photos/seed/tc2/300/400', views: 900, likes: 110 },
];

export const BOOK_INTRODUCTIONS: BookIntroduction[] = [
  { 
    id: 'bi1', 
    title: 'Giới thiệu sách tháng 11/2025: Hiểu về trái tim', 
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000', 
    date: '25/12/2025', 
    views: 83, 
    author: 'Quản trị viên',
    summary: 'Tên sách: Hiểu về trái tim - Tác giả: Minh Niệm. Một cuốn sách giúp ta tìm lại chính mình và sống hạnh phúc hơn.',
    content: `<p>Tháng 11 về mang theo những xúc cảm lắng sâu của mùa thu và cũng là tháng của tri ân...</p>`
  },
  { 
    id: 'bi2', 
    title: 'Giới thiệu sách tháng 12/2025: Mưa đỏ', 
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000', 
    date: '20/12/2025', 
    views: 56, 
    author: 'Quản trị viên',
    summary: 'Tác phẩm văn học về đề tài chiến tranh đầy xúc động và hào hùng của tác giả Chu Lai.',
    content: '<p>Nội dung chi tiết đang được cập nhật...</p>'
  }
];

export const NEWS: NewsItem[] = [
  { 
    id: 'n1', 
    title: 'THƯ VIỆN – ĐIỂM HẸN TRI THỨC CỦA THẦY VÀ TRÒ TRƯỜNG THCS LÊ QUÝ ĐÔN', 
    date: '01/10/2025', 
    author: 'Quản trị viên', 
    views: 749,
    summary: 'Thư viện nhà trường không chỉ là nơi lưu giữ những cuốn sách hay mà còn là không gian sáng tạo truyền cảm hứng cho học sinh.', 
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000',
    content: `<p>Thư viện trường THCS Lê Quý Đôn từ lâu đã trở thành "ngôi nhà thứ hai"...</p>`
  },
  { 
    id: 'n2', 
    title: 'Thư viện trường THCS Lê Quý Đôn phát động phong trào quyên góp sách', 
    date: '04/12/2024', 
    author: 'Quản trị viên', 
    views: 231,
    summary: 'Hưởng ứng ngày hội đọc sách, nhà trường kêu gọi quyên góp sách cũ xây dựng tủ sách nhân ái năm học 2024-2025.', 
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000',
    content: `<p>CHỦ ĐỀ: "TẶNG SÁCH - TRAO ƯỚC MƠ"</p>`
  }
];
