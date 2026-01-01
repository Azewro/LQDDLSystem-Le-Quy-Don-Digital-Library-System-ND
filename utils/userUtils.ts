
/**
 * Chuyển tiếng Việt có dấu thành không dấu và lấy các chữ cái đầu
 * Ví dụ: "Lê Thị Kim Ánh" -> "LTKA"
 */
export const getInitials = (name: string): string => {
  if (!name) return "";
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();

  return normalized
    .split(/\s+/)
    .map(word => word[0])
    .join("");
};

/**
 * Tạo username theo quy tắc: [Mã thẻ] + [Chữ cái đầu họ tên]
 * Ví dụ: GV0097 + Lê Thị Kim Ánh -> GV0097LTKA
 */
export const generateUsername = (cardCode: string, fullName: string): string => {
  const code = (cardCode || "").trim().toUpperCase();
  const initials = getInitials(fullName);
  return `${code}${initials}`;
};

/**
 * Định dạng ngày từ Excel (có thể là số hoặc string) sang định dạng dd/mm/yyyy
 */
export const formatExcelDate = (excelDate: any): string => {
  if (!excelDate) return "";
  if (typeof excelDate === 'string') return excelDate;
  // Xử lý nếu Excel lưu dạng serial number
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toLocaleDateString('vi-VN');
};
