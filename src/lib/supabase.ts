import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  username: string;
  avatar_color: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
};

export type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};
