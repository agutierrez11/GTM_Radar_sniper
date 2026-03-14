import './env.js';
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers/index';
import { db } from './lib/db';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // tRPC Middleware
  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    })
  );

  // Lead Export API (CSV)
  app.get('/api/export-leads', async (req, res) => {
    try {
      const data = await db.empresas.list(1000); // Returns data directly
      
      const csv = [
        ['ID', 'Name', 'Website', 'Status', 'Description'].join(','),
        ...(data || []).map((r: any) => [
          r.id, 
          `"${r.name}"`, 
          r.website, 
          r.status, 
          `"${(r.description || '').replace(/"/g, '\"\"')}"`
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=nerv_leads_export.csv');
      res.status(200).send(csv);
    } catch (e) {
      res.status(500).send({ error: 'Export failed' });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`tRPC endpoint available at http://localhost:${port}/api/trpc`);
  });
}

startServer().catch(console.error);
