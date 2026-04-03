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
    listWithFilters: async (filters: { source?: string, status?: string, limit?: number }) => {
      try {
        let q = supabase.from('empresas').select('*');
        if (filters.source) q = q.eq('source', filters.source);
        if (filters.status) q = q.eq('status', filters.status);
        
        const { data, error } = await q
          .order('created_at', { ascending: false })
          .limit(filters.limit || 50);
        
        if (error) throw error;
        return { data, error: null };
      } catch (e) {
        return { data: null, error: e };
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
    },
    patch: async (id: number, updates: any) => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (e) {
        console.error(`DB_ERROR (patch): ${e}`);
        throw new Error('FALLO_ACTUALIZACION_DB');
      }
    },
    getStrategicAccounts: async (limit = 50) => {
      try {
        // SQL Triple Join con Fallback de Website y DISTINCT para evitar colisiones
        const { data, error } = await supabase.rpc('get_enriched_strategic_accounts', { 
           p_limit: limit 
        });

        if (error) {
          // Fallback manual si el RPC no existe (ejecutando via query directa)
          console.warn("RPC no encontrado, ejecutando fallback select...");
          return await db.empresas.getStrategicAccountsFallback(limit);
        }

        return data.map(db.empresas.injectTierScoring);
      } catch (e) {
        console.error(`STRATEGIC_DB_ERROR: ${e}`);
        return [];
      }
    },
    getStrategicAccountsFallback: async (limit = 50) => {
      const { data, error } = await supabase
        .from('empresas_v3')
        .select(`
          nombre, website, pais_hq, vertical,
          growth_signals(signal_type, score_momento, personalidad_inferida),
          tech_stack(tech_pagos, tech_crm, tech_kyc, tech_analytics, tech_infra)
        `)
        .limit(limit);
      
      if (error) throw error;
      return (data || []).map(db.empresas.injectTierScoring);
    },
    injectTierScoring: (row: any) => {
      const signal = row.growth_signals?.[0] || row.growth_signals || {};
      const tech = row.tech_stack?.[0] || row.tech_stack || {};
      
      let tier = "Tier3"; // Default
      const hasCRM = (tech.tech_crm?.toLowerCase().includes('hubspot') || tech.tech_crm?.toLowerCase().includes('salesforce'));
      const score = signal.score_momento || 0;
      const signalType = signal.signal_type || "";

      // Lógica Tier 1: FUNDING + CRM + Score >= 7
      if (signalType.includes('FUNDING') && hasCRM && score >= 7) {
        tier = "Tier1";
      } 
      // Lógica Tier 2: EXPANSION/PRODUCT + CRM
      else if ((signalType.includes('EXPANSION') || signalType.includes('PRODUCT')) && hasCRM) {
        tier = "Tier2";
      }

      return {
        ...row,
        tier,
        signal_type: signalType,
        score_momento: score,
        tech_summary: {
           crm: tech.tech_crm || "No detectado",
           pagos: tech.tech_pagos || "No detectado",
           kyc: tech.tech_kyc || "No detectado"
        }
      };
    }
  }
};
