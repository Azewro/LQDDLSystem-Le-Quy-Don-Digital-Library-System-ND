<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hệ thống Quản lý Thư viện Số - THPT Lê Quý Đôn (LQDDL System)

Dự án cá nhân nhằm xây dựng một nền tảng quản lý thư viện hiện đại, tối ưu hóa quy trình mượn trả và quản lý bạn đọc cho nhà trường.

## ✨ Tính năng chính

- **Quản lý Bạn đọc:** Quản lý học sinh, giáo viên với đầy đủ thông tin thẻ, mã vạch, và trạng thái hoạt động.
- **Nhập liệu Thông minh:** Hỗ trợ nhập/xuất dữ liệu từ Excel với quy trình tối ưu, xử lý hàng nghìn bản ghi chỉ trong vài giây.
- **Quản lý Nội dung:** Hệ thống quản trị tin tức, giới thiệu sách và các trang tĩnh (Giới thiệu, Hướng dẫn).
- **Trải nghiệm Người dùng:** Giao diện hiện đại, tốc độ tải trang nhanh, hỗ trợ đầy đủ chế độ toàn màn hình và tìm kiếm thông minh.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React + Vite + TypeScript + Tailwind CSS.
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage).
- **Hỗ trợ:** ExcelJS/XLSX cho xử lý dữ liệu.

## 🚀 Chạy ứng dụng tại Local

**Yêu cầu:** Node.js (v18+)

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Tạo file `.env.local` và thêm các thông tin kết nối Supabase của bạn:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Khởi chạy:**
   ```bash
   npm run dev
   ```

---
*Đây là một dự án cá nhân được phát triển với mục tiêu cải thiện trải nghiệm thư viện số.*
