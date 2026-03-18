import { router } from '../trpc';
import { companiesRouter } from './companies';
import { insightsRouter } from './insights';
import { scoringRouter } from './scoring';

export const appRouter = router({
  companies: companiesRouter,
  insights: insightsRouter,
  scoring: scoringRouter,
});

export type AppRouter = typeof appRouter;
