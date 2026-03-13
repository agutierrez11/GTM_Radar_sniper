import { router } from '../trpc';
import { companiesRouter } from './companies';

export const appRouter = router({
  companies: companiesRouter,
});

export type AppRouter = typeof appRouter;
