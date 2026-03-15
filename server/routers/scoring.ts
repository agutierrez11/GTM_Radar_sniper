import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../lib/db';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scoringRouter = router({
  triggerScan: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .mutation(async ({ input }) => {
      // Trigger the specialized sniper engine for this lead
      // This bridges the Node backend with the Python Engine
      const enginePath = path.resolve(__dirname, '..', '..', 'engine', 'v6_stable.py');
      
      console.log(`ENGINE_BRIDGE: Triggering scan for lead ${input.companyId}`);
      
      // We run it as a detached process or just exec it
      // For MVP, we'll use exec and log the start
      exec(`python ${enginePath} --id ${input.companyId}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`ENGINE_ERR: ${error.message}`);
          return;
        }
        console.log(`ENGINE_OK: ${stdout}`);
      });

      return { success: true, message: 'SCAN_STARTED' };
    }),

  detonateSurgicalRadar: publicProcedure
    .input(z.object({ targetUrl: z.string(), competitorUrl: z.string().optional() }))
    .mutation(async ({ input }) => {
      const scriptPath = path.resolve(__dirname, '..', '..', 'engine', 'surgical_dossier.py');
      const cmd = `python ${scriptPath} "${input.targetUrl}" ${input.competitorUrl ? `"${input.competitorUrl}"` : ""}`;
      
      console.log(`SURGICAL_BRIDGE: Running strike for ${input.targetUrl}`);
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`SURGICAL_ERR: ${error.message}`);
          return;
        }
        console.log(`SURGICAL_OK: Dossier Generated.`);
      });

      return { success: true, message: 'SURGICAL_STRIKE_DETONATED' };
    }),

  recalculateAllScores: publicProcedure.mutation(async () => {
    const enginePath = path.resolve(__dirname, '..', '..', 'engine', 'lead_scorer.py');
    
    exec(`python ${enginePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`SCORER_ERR: ${error.message}`);
        return;
      }
      console.log(`SCORER_OK: ${stdout}`);
    });

    return { success: true, message: 'BATCH_SCORING_STARTED' };
  })
});
