// server.ts — local development entry point only.
//
// Production (Vercel) uses api/index.ts directly as a serverless function
// (see vercel.json's catch-all rewrite); this file wraps that same Express
// app with Vite's dev middleware / static fallback and calls .listen(),
// neither of which apply in the serverless environment.
import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';
import { app } from './api/index.ts';

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
