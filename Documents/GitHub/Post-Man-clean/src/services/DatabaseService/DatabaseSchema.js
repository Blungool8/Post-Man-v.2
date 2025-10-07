/**
 * Database Schema - Post-Man v3
 * Schema SQLite per persistenza dati secondo architettura v3
 * 
 * @fileoverview Definizioni schema database per zone, fermate e run
 */

/**
 * Schema SQLite per Post-Man v3
 */
export const DATABASE_SCHEMA = {
  // Tabella zone
  zones: `
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Tabella fermate (include fermate manuali)
  stops: `
    CREATE TABLE IF NOT EXISTS stops (
      id INTEGER PRIMARY KEY,
      zone_id INTEGER,
      plan TEXT CHECK(plan IN ('A', 'B')),
      name TEXT NOT NULL,
      description TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      is_manual INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (zone_id) REFERENCES zones(id)
    );
  `,

  // Tabella run (sessioni di lavoro)
  runs: `
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_id INTEGER,
      plan TEXT CHECK(plan IN ('A', 'B')),
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
      total_distance REAL,
      total_time INTEGER,
      notes TEXT,
      FOREIGN KEY (zone_id) REFERENCES zones(id)
    );
  `,

  // Tabella run_stops (fermate per ogni run)
  run_stops: `
    CREATE TABLE IF NOT EXISTS run_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER,
      stop_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'skipped')),
      completed_at DATETIME,
      notes TEXT,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      FOREIGN KEY (run_id) REFERENCES runs(id),
      FOREIGN KEY (stop_id) REFERENCES stops(id)
    );
  `,

  // Tabella impostazioni utente
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      type TEXT DEFAULT 'string' CHECK(type IN ('string', 'number', 'boolean', 'json')),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Tabella cache KML (per performance)
  kml_cache: `
    CREATE TABLE IF NOT EXISTS kml_cache (
      zone_id INTEGER,
      plan TEXT,
      content TEXT,
      parsed_data TEXT,
      file_size INTEGER,
      last_modified DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (zone_id, plan),
      FOREIGN KEY (zone_id) REFERENCES zones(id)
    );
  `
};

/**
 * Indici per performance
 */
export const DATABASE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_stops_zone_plan ON stops(zone_id, plan);',
  'CREATE INDEX IF NOT EXISTS idx_stops_manual ON stops(is_manual);',
  'CREATE INDEX IF NOT EXISTS idx_run_stops_run_id ON run_stops(run_id);',
  'CREATE INDEX IF NOT EXISTS idx_run_stops_stop_id ON run_stops(stop_id);',
  'CREATE INDEX IF NOT EXISTS idx_run_stops_status ON run_stops(status);',
  'CREATE INDEX IF NOT EXISTS idx_runs_zone_plan ON runs(zone_id, plan);',
  'CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);',
  'CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at);'
];

/**
 * Dati iniziali (seed data)
 */
export const SEED_DATA = {
  zones: [
    { id: 9, name: 'Zona 9', description: 'Castel San Giovanni' }
  ],
  
  settings: [
    { key: 'gps_accuracy_threshold', value: '50', type: 'number' },
    { key: 'marker_radius', value: '200', type: 'number' },
    { key: 'auto_save_interval', value: '30', type: 'number' },
    { key: 'map_style', value: 'default', type: 'string' },
    { key: 'notification_enabled', value: 'true', type: 'boolean' }
  ]
};

/**
 * Query SQL utili
 */
export const QUERIES = {
  // Fermate per zona/sottozona
  getStopsByZone: `
    SELECT * FROM stops 
    WHERE zone_id = ? AND plan = ? 
    ORDER BY name ASC;
  `,

  // Fermate manuali
  getManualStops: `
    SELECT * FROM stops 
    WHERE is_manual = 1 
    ORDER BY created_at DESC;
  `,

  // Run attive
  getActiveRun: `
    SELECT * FROM runs 
    WHERE status = 'active' 
    ORDER BY started_at DESC 
    LIMIT 1;
  `,

  // Run per zona
  getRunsByZone: `
    SELECT * FROM runs 
    WHERE zone_id = ? AND plan = ? 
    ORDER BY started_at DESC;
  `,

  // Statistiche fermate per run
  getRunStopStats: `
    SELECT 
      status,
      COUNT(*) as count
    FROM run_stops 
    WHERE run_id = ? 
    GROUP BY status;
  `,

  // Fermate completate per run
  getCompletedStops: `
    SELECT rs.*, s.name, s.description 
    FROM run_stops rs
    JOIN stops s ON rs.stop_id = s.id
    WHERE rs.run_id = ? AND rs.status = 'completed'
    ORDER BY rs.completed_at ASC;
  `,

  // Fermate pendenti per run
  getPendingStops: `
    SELECT rs.*, s.name, s.description 
    FROM run_stops rs
    JOIN stops s ON rs.stop_id = s.id
    WHERE rs.run_id = ? AND rs.status = 'pending'
    ORDER BY s.name ASC;
  `,

  // Impostazioni
  getSetting: `
    SELECT value, type FROM settings WHERE key = ?;
  `,

  // Cache KML
  getKMLCache: `
    SELECT * FROM kml_cache WHERE zone_id = ? AND plan = ?;
  `,

  // Statistiche generali
  getStats: `
    SELECT 
      (SELECT COUNT(*) FROM stops) as total_stops,
      (SELECT COUNT(*) FROM stops WHERE is_manual = 1) as manual_stops,
      (SELECT COUNT(*) FROM runs) as total_runs,
      (SELECT COUNT(*) FROM runs WHERE status = 'completed') as completed_runs;
  `
};

/**
 * Validazioni per dati
 */
export const VALIDATIONS = {
  zone: {
    id: (value) => Number.isInteger(value) && value > 0,
    name: (value) => typeof value === 'string' && value.trim().length > 0
  },
  
  stop: {
    zone_id: (value) => Number.isInteger(value) && value > 0,
    plan: (value) => ['A', 'B'].includes(value?.toUpperCase()),
    name: (value) => typeof value === 'string' && value.trim().length > 0,
    lat: (value) => typeof value === 'number' && value >= -90 && value <= 90,
    lng: (value) => typeof value === 'number' && value >= -180 && value <= 180,
    is_manual: (value) => [0, 1].includes(value)
  },
  
  run: {
    zone_id: (value) => Number.isInteger(value) && value > 0,
    plan: (value) => ['A', 'B'].includes(value?.toUpperCase()),
    status: (value) => ['active', 'completed', 'paused'].includes(value)
  },
  
  run_stop: {
    run_id: (value) => Number.isInteger(value) && value > 0,
    stop_id: (value) => Number.isInteger(value) && value > 0,
    status: (value) => ['pending', 'completed', 'failed', 'skipped'].includes(value)
  }
};

/**
 * Migrazioni database (per future versioni)
 */
export const MIGRATIONS = {
  '1.0.0': [
    // Migrazione iniziale - già incluso nello schema
  ],
  
  '1.1.0': [
    // Esempio migrazione futura
    // 'ALTER TABLE stops ADD COLUMN priority INTEGER DEFAULT 0;'
  ]
};

export default {
  DATABASE_SCHEMA,
  DATABASE_INDEXES,
  SEED_DATA,
  QUERIES,
  VALIDATIONS,
  MIGRATIONS
};
