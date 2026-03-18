import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../lib/db';

export const insightsRouter = router({
  getDashboardStats: publicProcedure.query(async () => {
    const counts = await db.empresas.countByStatus();
    const total = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
    
    // Calculate percentages
    const stats = Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      percent: total > 0 ? (count / total) * 100 : 0
    }));

    // Find leads with TECH signal AND EXPANSION/HIRING signal for Schwerpunkt
    const leads = await db.empresas.list(500);
    const schwerpunkt = leads.filter((l: any) => {
      const desc = (l.description || '').toLowerCase();
      const hasTech = ['stripe', 'aws', 'nium', 'kushki', 'api', 'payments'].some(t => desc.includes(t));
      const hasGrowth = ['expansion', 'hiring', 'series', 'funding', 'vacantes'].some(g => desc.includes(g));
      return hasTech && hasGrowth;
    })
    .slice(0, 4)
    .map((l: any) => ({
      name: l.name,
      intensity: 85 + Math.floor(Math.random() * 15),
      pain_point: (l.description?.includes('Kushki') || l.description?.includes('Payments')) 
                   ? 'Fricción en Checkout / Costo de Rieles' 
                   : 'Fricción Operativa en Expansión',
      action: 'ATAQUE DE FLANQUEO: Solución Técnica Ops'
    }));

    return {
      total,
      stats,
      schwerpunkt
    };
  }),

  getSchwerpunktOpportunities: publicProcedure.query(async () => {
    const leads = await db.empresas.list(1000);
    
    // Logic: Find leads with TECH signal AND EXPANSION/HIRING signal
    const opportunities = leads.filter((l: any) => {
      const desc = (l.description || '').toLowerCase();
      const hasTech = ['stripe', 'aws', 'nium', 'kushki', 'api', 'payments'].some(t => desc.includes(t));
      const hasGrowth = ['expansion', 'hiring', 'expansion', 'series', 'funding', 'vacantes'].some(g => desc.includes(g));
      return hasTech && hasGrowth;
    }).slice(0, 5);

    return opportunities.map((l: any) => ({
      id: l.id,
      name: l.name,
      intensity: 85 + Math.floor(Math.random() * 15), // Mock score based on intersection
      pain_point: l.description?.includes('Kushki') ? 'High Transaction Costs' : 'Cross-border Friction',
      action: 'ATAQUE DE FLANQUEO: Contactar via Tech Ops'
    }));
  }),

  getTechTrends: publicProcedure.query(async () => {
    const leads = await db.empresas.list(1000);
    const techMap: Record<string, number> = {};
    
    // Keywords to track based on engine signals
    const keywords = [
      'Stripe', 'AWS', 'API', 'Checkout', 'Payments', 
      'Gambling', 'Betting', 'Casino', 'i-gaming', 'Sportsbook',
      'Funding', 'Series A', 'Series B', 'Expansion', 'Hiring',
      'Nium', 'Sumsub', 'Kushki', 'Pix', 'DLocal'
    ];

    leads.forEach((l: any) => {
      const content = (l.description || '').toLowerCase();
      keywords.forEach(k => {
        if (content.includes(k.toLowerCase())) {
          techMap[k] = (techMap[k] || 0) + 1;
        }
      });
      
      // Also check specific radar_tags if available
      if (l.radar_tags && Array.isArray(l.radar_tags)) {
        l.radar_tags.forEach((t: string) => {
          techMap[t] = (techMap[t] || 0) + 1;
        });
      }
    });

    return Object.entries(techMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }),

  getLatestDossiers: publicProcedure.query(async () => {
    const { data, error } = await db.empresas.listWithFilters({
      source: 'SURGICAL_STRIKE',
      limit: 3
    });
    if (error) {
      console.error(`DOSSIER_FETCH_ERR: ${error}`);
      return [];
    }
    return data || [];
  })
});
