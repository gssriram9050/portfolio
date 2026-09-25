import serverless from 'serverless-http';
import app from './server.js';
import db from './db.js';

let dbInitialized = false;
const handler = serverless(app);

export default {
  async fetch(request, env, ctx) {
    if (env.DATABASE_URL && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = env.DATABASE_URL;
    }
    if (env.POSTGRES_URL && !process.env.POSTGRES_URL) {
      process.env.POSTGRES_URL = env.POSTGRES_URL;
    }

    const url = new URL(request.url);

    // API Routes MUST bypass static assets and go directly to Express
    if (url.pathname.startsWith('/api')) {
      if (!dbInitialized) {
        try {
          await db.initDb();
          dbInitialized = true;
        } catch (err) {
          console.error('Worker DB Init Warning:', err.message);
        }
      }
      return handler(request, env, ctx);
    }

    // Static Frontend Assets (HTML, CSS, JS) served via Cloudflare ASSETS binding
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status < 400) {
          return assetRes;
        }
      } catch (e) {
        // Fallback to Express handler
      }
    }

    return handler(request, env, ctx);
  }
};
