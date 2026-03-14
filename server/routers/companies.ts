import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../lib/db';

export const companiesRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await db.empresas.list(input.limit);
    }),

  search: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      country: z.string().optional(),
      segment: z.string().optional(),
      tier: z.string().optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      return await db.empresas.search(input);
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.string()
    }))
    .mutation(async ({ input }) => {
      return await db.empresas.updateStatus(input.id, input.status);
    }),

  getStats: publicProcedure.query(async () => {
    const counts = await db.empresas.countByStatus();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    return {
      total,
      counts
    };
  })
});
