
/**
 * Hash một chuỗi văn bản bằng thuật toán SHA-256
 */
export const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Kiểm tra độ mạnh của mật khẩu (8-20 ký tự, bao gồm cả chữ và số)
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8 || password.length > 20) {
    return { isValid: false, message: "Mật khẩu phải từ 8 đến 20 ký tự" };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: "Mật khẩu phải bao gồm cả chữ cái và chữ số" };
  }
  return { isValid: true, message: "Mật khẩu hợp lệ" };
};
