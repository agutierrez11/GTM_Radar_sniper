import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const db = {
  empresas: {
    list: async (limit = 100) => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) {
          console.error(`DB_ERROR (list): ${error.message}`);
          throw new Error('FALLO_LECTURA_DATABASE');
        }
        return data || [];
      } catch (e) {
        console.error(`CRITICAL_DB_EXCEPTION: ${e}`);
        throw e;
      }
    },
    countByStatus: async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('status');
        if (error) throw error;
        
        const counts: Record<string, number> = {};
        data.forEach(row => {
          const s = row.status || 'PENDIENTE';
          counts[s] = (counts[s] || 0) + 1;
        });
        return counts;
      } catch (e) {
        console.error(`DB_ERROR (count): ${e}`);
        return {};
      }
    },
    search: async (params: { 
      query?: string, 
      country?: string, 
      segment?: string, 
      tier?: string,
      limit?: number 
    }) => {
      try {
        let q = supabase.from('empresas').select('*');
        
        if (params.query) {
          q = q.ilike('name', `%${params.query}%`);
        }
        if (params.country && params.country !== 'all') {
          q = q.eq('country', params.country);
        }
        if (params.segment && params.segment !== 'all') {
          q = q.eq('segment', params.segment);
        }
        if (params.tier && params.tier !== 'all') {
          q = q.eq('tier', params.tier);
        }
        
        const { data, error } = await q
          .order('created_at', { ascending: false })
          .limit(params.limit || 50);
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error(`DB_ERROR (search): ${e}`);
        throw new Error('ERROR_EN_BUSQUEDA_TACTICA');
      }
    },
    updateStatus: async (id: number, status: string) => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (e) {
        console.error(`DB_ERROR (update): ${e}`);
        throw new Error('FALLO_ACTUALIZACION_STATUS');
      }
    }
  }
};
