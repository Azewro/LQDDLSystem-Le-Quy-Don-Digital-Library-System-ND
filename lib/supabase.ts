
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rdmpjklpcnuwjaolijra.supabase.co';
const supabaseAnonKey = 'sb_publishable_BGAfqHmQT8aL3QqYPx3c9Q_BdqOYuhH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
