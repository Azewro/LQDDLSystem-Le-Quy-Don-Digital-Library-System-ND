
import { createClient } from '@supabase/supabase-js';

// Lưu ý: Trong thực tế, bạn sẽ lấy các giá trị này từ bảng điều khiển Supabase của mình.
// Ở đây tôi để placeholder, bạn hãy thay thế bằng URL và Anon Key của dự án bạn.
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
