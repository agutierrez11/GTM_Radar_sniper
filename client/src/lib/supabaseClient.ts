import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseAnonKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
