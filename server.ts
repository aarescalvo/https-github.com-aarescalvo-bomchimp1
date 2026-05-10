import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite Database
  const db = new Database('bomberos.db');
  db.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      description TEXT,
      location TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    -- Insert default settings if not exists
    INSERT OR IGNORE INTO settings (key, value) VALUES ('app_name', 'SGP-B');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('institution_name', 'Operaciones Chimpay');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('dashboard_title', 'Dashboard Operativo');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('dashboard_subtitle', 'Resumen en tiempo real del cuartel');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('logo_url', '');
  `);

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "connected" });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const config = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(config);
  });

  app.post("/api/settings", (req, res) => {
    const updates = req.body; // { key: value }
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, value);
      }
    });

    transaction(updates);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    // Return some mock stats for now
    res.json({
      active_guard: 8,
      ready_units: 5,
      total_units: 6,
      incidents_24h: 3,
      alerts: 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { readFileSync } = await import("fs");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Changed to custom to handle HTML transform
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
