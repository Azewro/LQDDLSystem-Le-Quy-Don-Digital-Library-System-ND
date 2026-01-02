
import { Book, NewsItem, BookIntroduction } from '@/types';

export const BOOKS: Book[] = [
  { id: 'e1', title: 'Lịch sử và địa lý 8: SGK (Kết nối tri thức)', author: 'Vũ Minh Giang', type: 'ebook', category: 'Sách điện tử', subCategory: 'SGK Lớp 8 Kết nối tri thức', grade: 8, coverImage: 'https://picsum.photos/seed/e1/300/400', views: 5000, likes: 120 },
  { id: 'e2', title: 'Toán 7 - T.1: SGK (Kết nối tri thức)', author: 'Trần Nam Dũng', type: 'ebook', category: 'Sách điện tử', subCategory: 'SGK Lớp 7 Kết nối tri thức', grade: 7, coverImage: 'https://picsum.photos/seed/e2/300/400', views: 3200, likes: 45 },
  { id: 'e3', title: 'Tiếng Anh 8 - Global Success', author: 'Hoàng Văn Vân', type: 'ebook', category: 'Sách điện tử', subCategory: 'SGK Lớp 8 Kết nối tri thức', grade: 8, coverImage: 'https://picsum.photos/seed/e3/300/400', views: 4100, likes: 67 },
  { id: 'e4', title: 'Đột phá Ngữ văn 9', author: 'Nhiều tác giả', type: 'ebook', category: 'Sách điện tử', subCategory: 'Tham khảo các môn học', grade: 9, coverImage: 'https://picsum.photos/seed/e4/300/400', views: 2500, likes: 88 },
  { id: 'e5', title: 'Địa lý: Lâm nghiệp và thủy sản', author: 'Tổ Địa lý', type: 'ebook', category: 'Sách điện tử', subCategory: 'Tham khảo các môn học', grade: 8, coverImage: 'https://picsum.photos/seed/e5/300/400', views: 1200, likes: 15 },
  { id: 'a1', title: 'Quên đi quá khứ sống đời tự tại', author: 'Lama Surya Das', type: 'audio', category: 'Sách nói', subCategory: 'Tâm lý - Kỹ năng sống', coverImage: 'https://picsum.photos/seed/a1/300/400', views: 420, likes: 88 },
  { id: 'bg1', title: 'Hệ thức lượng trong tam giác vuông', author: 'Thầy Trần Văn C', type: 'video', category: 'Bài giảng điện tử', subCategory: 'Toán học', grade: 9, coverImage: 'https://picsum.photos/seed/bg1/300/400', views: 1200, likes: 95 },
  { id: 'v1', title: 'Review sách: Ở nhà đọc sách thử thách', author: 'Nghiêm Khánh Linh', type: 'video', category: 'Video', subCategory: 'Hoạt động của học sinh', grade: 9, coverImage: 'https://picsum.photos/seed/v1/300/400', views: 1500, likes: 450 },
  { id: 'ab1', title: 'Ngày hội đọc sách 2024', author: 'Thư viện', type: 'video', category: 'Album ảnh', subCategory: 'Hoạt động của Thư viện', coverImage: 'https://picsum.photos/seed/ab1/300/400', views: 890, likes: 120 },
  { id: 'kn1', title: 'Kỹ năng giao tiếp cho học sinh', author: 'NXB Trẻ', type: 'ebook', category: 'Kỹ năng sống', subCategory: 'Tham khảo', coverImage: 'https://picsum.photos/seed/kn1/300/400', views: 750, likes: 45 },
  { id: 'tc1', title: 'Tạp chí Hoa học trò số 1450', author: 'Tòa soạn HHT', type: 'ebook', category: 'Báo, tạp chí', subCategory: 'Giải trí', coverImage: 'https://picsum.photos/seed/tc1/300/400', views: 1800, likes: 300 },
];

export const NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'THƯ VIỆN – ĐIỂM HẸN TRI THỨC CỦA THẦY VÀ TRÒ TRƯỜNG THCS LÊ QUÝ ĐÔN',
    date: '01/10/2025',
    author: 'Admin',
    views: 749,
    summary: 'Không gian sáng tạo truyền cảm hứng cho học sinh.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000',
    content_html: `
      <h2>Chào mừng các bạn đến với Thư viện Lê Quý Đôn</h2>
      <p>Thư viện không chỉ có sách, mà còn là một <strong>không gian trải nghiệm số</strong> hiện đại.</p>
      <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000" alt="Thư viện hiện đại" />
      <p>Tại đây, chúng tôi hỗ trợ:</p>
      <ul>
        <li>Tra cứu tài liệu trực tuyến 24/7</li>
        <li>Mượn trả sách tự động qua QR Code</li>
        <li>Phòng Lab học tập nhóm với đầy đủ thiết bị</li>
      </ul>
      <p style="font-size: 1.5rem; color: #00a651; font-style: italic;">"Sách là nguồn tri thức vô tận của nhân loại"</p>
    `,
    gallery: [
      'https://picsum.photos/seed/g1/800/600',
      'https://picsum.photos/seed/g2/800/600',
      'https://picsum.photos/seed/g3/800/600'
    ]
  },
  {
    id: 'n2',
    title: 'Phát động phong trào quyên góp sách năm học 2024-2025',
    date: '04/12/2024',
    author: 'Ban Giám Hiệu',
    views: 231,
    summary: 'Hưởng ứng ngày hội đọc sách, nhà trường kêu gọi quyên góp sách cũ xây dựng tủ sách nhân ái.',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000',
    content_html: `<p>Nhà trường rất mong nhận được sự ủng hộ từ quý phụ huynh và các em học sinh...</p>`
  }
];

export const BOOK_INTRODUCTIONS: BookIntroduction[] = [
  {
    id: 'bi1',
    title: 'Giới thiệu sách tháng 11: "Hiểu về trái tim"',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000',
    date: '25/11/2025',
    views: 102,
    author: 'Cô Thủ Thư',
    summary: 'Tác giả Minh Niệm. Cuốn sách giúp ta tìm lại chính mình và sống hạnh phúc hơn.',
    content_html: `<h3>Thông tin tác phẩm</h3><p><strong>Hiểu về trái tim</strong> là cuốn sách đầu tay của Thiền sư Minh Niệm...</p>`
  }
];
