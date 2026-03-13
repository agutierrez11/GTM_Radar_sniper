import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const TABLE_LEADS = 'empresas';
