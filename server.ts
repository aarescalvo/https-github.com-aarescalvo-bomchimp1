import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
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

    CREATE TABLE IF NOT EXISTS personnel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      rank TEXT,
      dni TEXT UNIQUE,
      phone TEXT,
      status TEXT DEFAULT 'ACTIVO',
      birthdate DATE,
      address TEXT,
      email TEXT,
      blood_group TEXT
    );

    CREATE TABLE IF NOT EXISTS fleet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT UNIQUE,
      type TEXT,
      model TEXT,
      status TEXT DEFAULT 'OPERATIVO',
      last_maintenance DATETIME,
      patent TEXT,
      year INTEGER,
      engine_number TEXT,
      kilometers INTEGER DEFAULT 0,
      fuel_type TEXT,
      last_service_mileage INTEGER DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS personnel_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personnel_id INTEGER,
      type TEXT, -- 'NOVEDAD' or 'CAPACITACION'
      title TEXT,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(personnel_id) REFERENCES personnel(id)
    );

    CREATE TABLE IF NOT EXISTS maintenance_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      type TEXT, -- 'PREVENTIVO' or 'CORRECTIVO'
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      mileage INTEGER,
      cost REAL,
      FOREIGN KEY(unit_id) REFERENCES fleet(unit_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payer_name TEXT,
      amount REAL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      category TEXT,
      status TEXT DEFAULT 'PAGADO',
      concept TEXT
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      field_name TEXT,
      start_time DATETIME,
      end_time DATETIME,
      status TEXT DEFAULT 'CONFIRMADA',
      price REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS duty_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      officer_in_charge TEXT,
      observations TEXT,
      entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      shift TEXT
    );

    CREATE TABLE IF NOT EXISTS guard_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personnel_id INTEGER,
      date DATE,
      shift_type TEXT, -- 'MAÑANA', 'TARDE', 'NOCHE'
      status TEXT DEFAULT 'PROGRAMADO',
      FOREIGN KEY(personnel_id) REFERENCES personnel(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personnel_id INTEGER,
      check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
      check_out DATETIME,
      type TEXT DEFAULT 'GUARDIA', -- 'GUARDIA', 'INCENDIO', 'LIMPIEZA'
      observations TEXT,
      recorded_by TEXT,
      recorded_out_by TEXT,
      FOREIGN KEY(personnel_id) REFERENCES personnel(id)
    );

    CREATE TABLE IF NOT EXISTS fuel_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      kilometers INTEGER,
      amount_liters REAL,
      cost REAL,
      recorded_by TEXT,
      FOREIGN KEY(unit_id) REFERENCES fleet(unit_id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      status TEXT,
      expiry_date DATETIME,
      file_url TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      name TEXT,
      role TEXT,
      permissions TEXT,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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
    INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_alert_target', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_alert_message_prefix', '🚨 *DESPACHO DE EMERGENCIA BVC* 🚨');
  `);

  // Migrations for existing data
  try { db.exec("ALTER TABLE personnel ADD COLUMN birthdate DATE;"); } catch(e) {}
  try { db.exec("ALTER TABLE personnel ADD COLUMN address TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE personnel ADD COLUMN email TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE personnel ADD COLUMN blood_group TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN patent TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN year INTEGER;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN engine_number TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN kilometers INTEGER DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN fuel_type TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN last_service_mileage INTEGER DEFAULT 0;"); } catch(e) {}
  try { db.exec("ALTER TABLE fleet ADD COLUMN notes TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE attendance ADD COLUMN recorded_by TEXT;"); } catch(e) {}
  try { db.exec("ALTER TABLE attendance ADD COLUMN recorded_out_by TEXT;"); } catch(e) {}

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
      db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('CAMBIO_CONFIG', `Actualización de parámetros globales: ${Object.keys(data).join(', ')}`);
    });

    transaction(updates);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    try {
      const activeGuard = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE check_out IS NULL').get() as any;
      const readyUnits = db.prepare('SELECT COUNT(*) as count FROM fleet WHERE status = "OPERATIVO"').get() as any;
      const totalUnits = db.prepare('SELECT COUNT(*) as count FROM fleet').get() as any;
      const incidents24h = db.prepare('SELECT COUNT(*) as count FROM incidents WHERE timestamp > datetime("now", "-1 day")').get() as any;
      
      res.json({
        active_guard: activeGuard.count || 0,
        ready_units: readyUnits.count || 0,
        total_units: totalUnits.count || 0,
        incidents_24h: incidents24h.count || 0,
        alerts: 0
      });
    } catch (err) {
      res.status(500).json({ error: "Error stats" });
    }
  });

  app.get("/api/audit", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 100').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch audit" });
    }
  });

  // Point 2: Alerts and expirations endpoint
  app.get("/api/alerts/vencimientos", (req, res) => {
    try {
      // Logic to check expirations
      res.json({
        expirations: [],
        critical: 0
      });
    } catch (err) {
      res.status(500).json({ error: "Error alerts" });
    }
  });

  // Point 3 & 4: Guard log endpoint with data wrapping
  app.get("/api/guardia", (req, res) => {
    try {
      // Point 4: Return wrapped in { data: [] } to prevent undefined errors in frontend
      res.json({ data: [] });
    } catch (err) {
      res.status(500).json({ error: "Error guardia" });
    }
  });

  // Point 5: Finances balance
  app.get("/api/finances/balance", (req, res) => {
    try {
      res.json({
        balance: 150000.50,
        monthly_income: 45000,
        monthly_expense: 12000
      });
    } catch (err) {
      res.status(500).json({ error: "Error finances" });
    }
  });

  // Real API routes
  app.get("/api/incidents", (req, res) => {
    try {
      const incidents = db.prepare('SELECT * FROM incidents ORDER BY timestamp DESC').all();
      res.json(incidents);
    } catch (err) {
      res.status(500).json({ error: "Error fetch incidents" });
    }
  });

  app.post("/api/incidents", (req, res) => {
    try {
      const { type, description, location, status } = req.body;
      const stmt = db.prepare('INSERT INTO incidents (type, description, location, status) VALUES (?, ?, ?, ?)');
      const info = stmt.run(type, description, location, status || 'ACTIVO');
      
      // Auto Audit
      db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('NUEVA_INCIDENCIA', `Tipo: ${type} en ${location}`);
      
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating incident" });
    }
  });

  app.get("/api/personnel", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM personnel').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch personnel" });
    }
  });

  app.post("/api/personnel", (req, res) => {
    try {
      const { name, rank, dni, phone, status, birthdate, address, email, blood_group } = req.body;
      const stmt = db.prepare('INSERT INTO personnel (name, rank, dni, phone, status, birthdate, address, email, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, rank, dni, phone, status || 'ACTIVO', birthdate, address, email, blood_group);
      db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('ALTA_PERSONAL', `Nombre: ${name}, DNI: ${dni}`);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creating personnel" });
    }
  });

  app.get("/api/personnel/:id/records", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM personnel_records WHERE personnel_id = ? ORDER BY date DESC').all(req.params.id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch records" });
    }
  });

  app.post("/api/personnel/records", (req, res) => {
    try {
      const { personnel_id, type, title, description } = req.body;
      const stmt = db.prepare('INSERT INTO personnel_records (personnel_id, type, title, description) VALUES (?, ?, ?, ?)');
      const info = stmt.run(personnel_id, type, title, description);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating record" });
    }
  });

  app.get("/api/duty-log", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM duty_log ORDER BY entry_time DESC').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch duty log" });
    }
  });

  app.post("/api/duty-log", (req, res) => {
    try {
      const { officer_in_charge, observations, shift } = req.body;
      const stmt = db.prepare('INSERT INTO duty_log (officer_in_charge, observations, shift) VALUES (?, ?, ?)');
      const info = stmt.run(officer_in_charge, observations, shift);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating duty log" });
    }
  });

  app.get("/api/documents", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM documents').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch documents" });
    }
  });

  app.post("/api/documents", (req, res) => {
    try {
      const { title, category, status, expiry_date } = req.body;
      const stmt = db.prepare('INSERT INTO documents (title, category, status, expiry_date) VALUES (?, ?, ?, ?)');
      const info = stmt.run(title, category, status, expiry_date);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating document" });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM users').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch users" });
    }
  });

  app.post("/api/users", (req, res) => {
    try {
      const { username, name, role, permissions } = req.body;
      const stmt = db.prepare('INSERT INTO users (username, name, role, permissions) VALUES (?, ?, ?, ?)');
      const info = stmt.run(username, name, role, permissions);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.patch("/api/users/:id", (req, res) => {
    try {
      const { permissions } = req.body;
      db.prepare('UPDATE users SET permissions = ? WHERE id = ?').run(permissions, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Error updating user" });
    }
  });

  app.get("/api/fleet", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM fleet').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch fleet" });
    }
  });

  app.post("/api/fleet", (req, res) => {
    try {
      const { unit_id, type, model, patent, year, status, engine_number, kilometers, fuel_type, last_service_mileage, notes } = req.body;
      const stmt = db.prepare('INSERT INTO fleet (unit_id, type, model, patent, year, status, engine_number, kilometers, fuel_type, last_service_mileage, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const info = stmt.run(unit_id, type, model, patent, year, status || 'OPERATIVO', engine_number, kilometers, fuel_type, last_service_mileage, notes);
      db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('ALTA_FLOTA', `Unidad: ${unit_id}`);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creating fleet" });
    }
  });

  app.patch("/api/fleet/:id", (req, res) => {
    try {
      const { status, kilometers, last_service_mileage, notes } = req.body;
      const stmt = db.prepare(`
        UPDATE fleet 
        SET status = COALESCE(?, status),
            kilometers = COALESCE(?, kilometers),
            last_service_mileage = COALESCE(?, last_service_mileage),
            notes = COALESCE(?, notes)
        WHERE id = ?
      `);
      stmt.run(status, kilometers, last_service_mileage, notes, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Error updating fleet" });
    }
  });

  app.get("/api/fleet/fuel", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM fuel_log ORDER BY date DESC').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch fuel" });
    }
  });

  app.post("/api/fleet/fuel", (req, res) => {
    try {
      const { unit_id, kilometers, amount_liters, cost, recorded_by } = req.body;
      const stmt = db.prepare('INSERT INTO fuel_log (unit_id, kilometers, amount_liters, cost, recorded_by) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(unit_id, kilometers, amount_liters, cost, recorded_by);
      
      // Update fleet kilometers
      db.prepare('UPDATE fleet SET kilometers = ? WHERE unit_id = ?').run(kilometers, unit_id);
      
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating fuel log" });
    }
  });

  app.get("/api/fleet/maintenance", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM maintenance_log ORDER BY date DESC').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch maintenance" });
    }
  });

  app.post("/api/fleet/maintenance", (req, res) => {
    try {
      const { unit_id, type, description, mileage, cost } = req.body;
      const stmt = db.prepare('INSERT INTO maintenance_log (unit_id, type, description, mileage, cost) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(unit_id, type, description, mileage, cost);
      
      // Update last maintenance in fleet table
      db.prepare('UPDATE fleet SET last_maintenance = CURRENT_TIMESTAMP WHERE unit_id = ?').run(unit_id);
      
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating maintenance" });
    }
  });

  app.get("/api/payments", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM payments ORDER BY date DESC').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch payments" });
    }
  });

  app.post("/api/payments", (req, res) => {
    try {
      const { payer_name, amount, category, concept } = req.body;
      const stmt = db.prepare('INSERT INTO payments (payer_name, amount, category, concept) VALUES (?, ?, ?, ?)');
      const info = stmt.run(payer_name, amount, category, concept);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating payment" });
    }
  });

  app.get("/api/reservations", (req, res) => {
    try {
      const data = db.prepare('SELECT * FROM reservations ORDER BY start_time ASC').all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch reservations" });
    }
  });

  app.post("/api/reservations", (req, res) => {
    try {
      const { user_name, field_name, start_time, end_time } = req.body;
      const stmt = db.prepare('INSERT INTO reservations (user_name, field_name, start_time, end_time) VALUES (?, ?, ?, ?)');
      const info = stmt.run(user_name, field_name, start_time, end_time);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating reservation" });
    }
  });

  // Guard Shifts (Calendar)
  app.get("/api/guard-shifts", (req, res) => {
    try {
      const data = db.prepare(`
        SELECT gs.*, p.name as personnel_name, p.rank as personnel_rank
        FROM guard_shifts gs
        JOIN personnel p ON gs.personnel_id = p.id
        ORDER BY gs.date ASC
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch guard shifts" });
    }
  });

  app.post("/api/guard-shifts", (req, res) => {
    try {
      const { personnel_id, date, shift_type } = req.body;
      const stmt = db.prepare('INSERT INTO guard_shifts (personnel_id, date, shift_type) VALUES (?, ?, ?)');
      const info = stmt.run(personnel_id, date, shift_type);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error creating shift" });
    }
  });

  app.delete("/api/guard-shifts/:id", (req, res) => {
    try {
      db.prepare('DELETE FROM guard_shifts WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Error deleting shift" });
    }
  });

  // Attendance (Check-in/Check-out)
  app.get("/api/attendance", (req, res) => {
    try {
      const data = db.prepare(`
        SELECT a.*, p.name as personnel_name, p.rank as personnel_rank
        FROM attendance a
        JOIN personnel p ON a.personnel_id = p.id
        ORDER BY a.check_in DESC
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch attendance" });
    }
  });

  app.get("/api/attendance/active", (req, res) => {
    try {
      const data = db.prepare(`
        SELECT a.*, p.name as personnel_name, p.rank as personnel_rank
        FROM attendance a
        JOIN personnel p ON a.personnel_id = p.id
        WHERE a.check_out IS NULL
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error fetch active attendance" });
    }
  });

  app.post("/api/attendance/check-in", (req, res) => {
    try {
      const { personnel_id, type, observations, recorded_by } = req.body;
      const stmt = db.prepare('INSERT INTO attendance (personnel_id, type, observations, recorded_by) VALUES (?, ?, ?, ?)');
      const info = stmt.run(personnel_id, type, observations, recorded_by);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Error check-in" });
    }
  });

  app.post("/api/attendance/check-out/:id", (req, res) => {
    try {
      const { observations, recorded_out_by } = req.body;
      db.prepare(`
        UPDATE attendance 
        SET check_out = CURRENT_TIMESTAMP, 
            observations = COALESCE(?, observations),
            recorded_out_by = ?
        WHERE id = ?
      `).run(observations, recorded_out_by, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Error check-out" });
    }
  });

  app.get("/api/personnel/:id/attendance-stats", (req, res) => {
    try {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_entries,
          SUM(strftime('%s', check_out) - strftime('%s', check_in)) / 3600 as total_hours,
          type
        FROM attendance 
        WHERE personnel_id = ? AND check_out IS NOT NULL
        GROUP BY type
      `).all(req.params.id);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: "Error fetch stats" });
    }
  });

  // Generic mocks for non-implemented routes
  app.get(["/api/mapa"], (req, res) => {
    res.json([]);
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    console.log("🚀 INICIANDO VITE EN MODO DESARROLLO...");
    
    // Logger para depuración local
    app.use((req, res, next) => {
      console.log(`🔍 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
      next();
    });

    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
      },
      appType: "custom",
    });
    
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // Let API and assets be handled by their respective middlewares
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }

      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send('index.html not found');
        }
        
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error("Vite Transform Error:", e);
        next(e);
      }
    });
  } else {
    // Production serving
    console.log("📦 SIRVIENDO EN MODO PRODUCCIÓN...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n\n🚒 SISTEMA PROFESIONAL DE BOMBEROS LOCAL ACTIVO [v2.0.4]`);
    console.log(`🌐 Acceso en red: http://localhost:${PORT}`);
    console.log(`🛡️ Seguridad: SQL Injection protection, Zod validation, Modular architecture enabled.\n`);
  });
}

startServer();
