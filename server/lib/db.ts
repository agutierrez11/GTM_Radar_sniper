import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const db = {
  empresas: {
    list: async (limit = 100) => {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    countByStatus: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('status');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(row => {
        counts[row.status] = (counts[row.status] || 0) + 1;
      });
      return counts;
    }
  }
};
