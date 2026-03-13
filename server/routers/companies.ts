import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../lib/db';

export const companiesRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await db.empresas.list(input.limit);
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
