import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import apiApp from './api/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

app.use(apiApp);

if (process.env.NODE_ENV === 'development') {
  const server = createServer(app);
  
  const vite = await createViteServer({
    configFile: false,
    plugins: [react()],
    server: { 
      middlewareMode: true,
      allowedHosts: true,
      host: '0.0.0.0',
      hmr: {
        server: server
      },
      fs: {
        strict: false
      }
    },
    appType: 'custom',
    root: path.resolve(__dirname, 'client'),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    }
  });

  app.use(vite.middlewares);
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const htmlPath = path.resolve(__dirname, 'client/index.html');
      let template = await fs.promises.readFile(htmlPath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      res.status(500).end(e.message);
    }
  });

  server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
    console.log(`Server running on port ${port}`);
  });
} else {
  const distPath = path.resolve(__dirname, 'dist/public');
  app.use(express.static(distPath));
  app.use('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
  
  const server = createServer(app);
  server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
    console.log(`Server running on port ${port}`);
  });
}
