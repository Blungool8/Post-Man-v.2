/**
 * Database Service - Post-Man v3
 * Servizio principale per gestione database SQLite
 * 
 * @fileoverview Servizio per operazioni CRUD e persistenza dati
 */

import * as SQLite from 'expo-sqlite';
import { 
  DATABASE_SCHEMA, 
  DATABASE_INDEXES, 
  SEED_DATA, 
  QUERIES, 
  VALIDATIONS 
} from './DatabaseSchema';

/**
 * Servizio database SQLite
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.dbName = 'postman_v3.db';
  }

  /**
   * Inizializza il database
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('🗄️ Inizializzazione database...');
      
      // Apre connessione database
      this.db = SQLite.openDatabaseSync(this.dbName);
      
      // Crea tabelle
      await this.createTables();
      
      // Crea indici
      await this.createIndexes();
      
      // Inserisce dati seed
      await this.seedData();
      
      this.isInitialized = true;
      console.log('✅ Database inizializzato con successo');
      
    } catch (error) {
      console.error('❌ Errore inizializzazione database:', error);
      throw error;
    }
  }

  /**
   * Crea tutte le tabelle
   * @returns {Promise<void>}
   */
  async createTables() {
    const tables = Object.values(DATABASE_SCHEMA);
    
    for (const tableSQL of tables) {
      this.db.execSync(tableSQL);
    }
    
    console.log(`📋 Create ${tables.length} tabelle`);
  }

  /**
   * Crea indici per performance
   * @returns {Promise<void>}
   */
  async createIndexes() {
    for (const indexSQL of DATABASE_INDEXES) {
      this.db.execSync(indexSQL);
    }
    
    console.log(`📊 Creati ${DATABASE_INDEXES.length} indici`);
  }

  /**
   * Inserisce dati iniziali
   * @returns {Promise<void>}
   */
  async seedData() {
    // Inserisce zone
    for (const zone of SEED_DATA.zones) {
      await this.insertZone(zone);
    }
    
    // Inserisce impostazioni
    for (const setting of SEED_DATA.settings) {
      await this.insertSetting(setting.key, setting.value, setting.type);
    }
    
    console.log('🌱 Dati seed inseriti');
  }

  /**
   * Verifica se il database è inizializzato
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Assicura che il database sia inizializzato
   */
  ensureInitialized() {
    if (!this.isReady()) {
      throw new Error('Database non inizializzato. Chiamare initialize() prima.');
    }
  }

  // ==================== OPERAZIONI ZONE ====================

  /**
   * Inserisce una nuova zona
   * @param {Object} zone - Dati zona
   * @returns {Promise<number>} ID zona inserita
   */
  async insertZone(zone) {
    this.ensureInitialized();
    
    const { name, description = '' } = zone;
    
    if (!VALIDATIONS.zone.name(name)) {
      throw new Error('Nome zona non valido');
    }

    const result = this.db.runSync(
      'INSERT INTO zones (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    return result.lastInsertRowId;
  }

  /**
   * Ottiene tutte le zone
   * @returns {Promise<Array>} Array di zone
   */
  async getZones() {
    this.ensureInitialized();
    
    return this.db.getAllSync('SELECT * FROM zones ORDER BY name ASC');
  }

  /**
   * Ottiene una zona per ID
   * @param {number} zoneId - ID zona
   * @returns {Promise<Object|null>} Zona trovata
   */
  async getZone(zoneId) {
    this.ensureInitialized();
    
    const result = this.db.getFirstSync(
      'SELECT * FROM zones WHERE id = ?',
      [zoneId]
    );
    
    return result || null;
  }

  // ==================== OPERAZIONI FERMATE ====================

  /**
   * Inserisce una nuova fermata
   * @param {Object} stop - Dati fermata
   * @returns {Promise<number>} ID fermata inserita
   */
  async insertStop(stop) {
    this.ensureInitialized();
    
    const { zone_id, plan, name, description = '', lat, lng, is_manual = 0 } = stop;
    
    // Validazione
    if (!VALIDATIONS.stop.zone_id(zone_id)) throw new Error('zone_id non valido');
    if (!VALIDATIONS.stop.plan(plan)) throw new Error('plan non valido');
    if (!VALIDATIONS.stop.name(name)) throw new Error('name non valido');
    if (!VALIDATIONS.stop.lat(lat)) throw new Error('lat non valido');
    if (!VALIDATIONS.stop.lng(lng)) throw new Error('lng non valido');
    if (!VALIDATIONS.stop.is_manual(is_manual)) throw new Error('is_manual non valido');

    const result = this.db.runSync(
      `INSERT INTO stops (zone_id, plan, name, description, lat, lng, is_manual) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [zone_id, plan.toUpperCase(), name, description, lat, lng, is_manual]
    );
    
    return result.lastInsertRowId;
  }

  /**
   * Ottiene fermate per zona/sottozona
   * @param {number} zoneId - ID zona
   * @param {string} plan - Piano ('A' o 'B')
   * @returns {Promise<Array>} Array di fermate
   */
  async getStopsByZone(zoneId, plan) {
    this.ensureInitialized();
    
    return this.db.getAllSync(QUERIES.getStopsByZone, [zoneId, plan.toUpperCase()]);
  }

  /**
   * Ottiene tutte le fermate manuali
   * @returns {Promise<Array>} Array di fermate manuali
   */
  async getManualStops() {
    this.ensureInitialized();
    
    return this.db.getAllSync(QUERIES.getManualStops);
  }

  /**
   * Ottiene una fermata per ID
   * @param {number} stopId - ID fermata
   * @returns {Promise<Object|null>} Fermata trovata
   */
  async getStop(stopId) {
    this.ensureInitialized();
    
    const result = this.db.getFirstSync(
      'SELECT * FROM stops WHERE id = ?',
      [stopId]
    );
    
    return result || null;
  }

  /**
   * Aggiorna una fermata
   * @param {number} stopId - ID fermata
   * @param {Object} updateData - Dati da aggiornare
   * @returns {Promise<boolean>} True se aggiornata
   */
  async updateStop(stopId, updateData) {
    this.ensureInitialized();
    
    const allowedFields = ['name', 'description', 'lat', 'lng'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(stopId);
    
    const result = this.db.runSync(
      `UPDATE stops SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.changes > 0;
  }

  /**
   * Elimina una fermata
   * @param {number} stopId - ID fermata
   * @returns {Promise<boolean>} True se eliminata
   */
  async deleteStop(stopId) {
    this.ensureInitialized();
    
    const result = this.db.runSync(
      'DELETE FROM stops WHERE id = ?',
      [stopId]
    );
    
    return result.changes > 0;
  }

  // ==================== OPERAZIONI RUN ====================

  /**
   * Inizia una nuova run
   * @param {Object} runData - Dati run
   * @returns {Promise<number>} ID run creata
   */
  async startRun(runData) {
    this.ensureInitialized();
    
    const { zone_id, plan, notes = '' } = runData;
    
    if (!VALIDATIONS.run.zone_id(zone_id)) throw new Error('zone_id non valido');
    if (!VALIDATIONS.run.plan(plan)) throw new Error('plan non valido');

    const result = this.db.runSync(
      `INSERT INTO runs (zone_id, plan, status, notes) VALUES (?, ?, 'active', ?)`,
      [zone_id, plan.toUpperCase(), notes]
    );
    
    return result.lastInsertRowId;
  }

  /**
   * Completa una run
   * @param {number} runId - ID run
   * @param {Object} completionData - Dati completamento
   * @returns {Promise<boolean>} True se completata
   */
  async completeRun(runId, completionData = {}) {
    this.ensureInitialized();
    
    const { total_distance = null, total_time = null, notes = '' } = completionData;
    
    const result = this.db.runSync(
      `UPDATE runs SET 
       status = 'completed', 
       ended_at = CURRENT_TIMESTAMP,
       total_distance = ?,
       total_time = ?,
       notes = ?
       WHERE id = ?`,
      [total_distance, total_time, notes, runId]
    );
    
    return result.changes > 0;
  }

  /**
   * Ottiene run attiva
   * @returns {Promise<Object|null>} Run attiva
   */
  async getActiveRun() {
    this.ensureInitialized();
    
    const result = this.db.getFirstSync(QUERIES.getActiveRun);
    return result || null;
  }

  /**
   * Ottiene run per zona
   * @param {number} zoneId - ID zona
   * @param {string} plan - Piano
   * @returns {Promise<Array>} Array di run
   */
  async getRunsByZone(zoneId, plan) {
    this.ensureInitialized();
    
    return this.db.getAllSync(QUERIES.getRunsByZone, [zoneId, plan.toUpperCase()]);
  }

  // ==================== OPERAZIONI RUN_STOPS ====================

  /**
   * Aggiunge fermata a una run
   * @param {Object} runStopData - Dati run_stop
   * @returns {Promise<number>} ID run_stop creata
   */
  async addStopToRun(runStopData) {
    this.ensureInitialized();
    
    const { run_id, stop_id, status = 'pending', notes = '' } = runStopData;
    
    if (!VALIDATIONS.run_stop.run_id(run_id)) throw new Error('run_id non valido');
    if (!VALIDATIONS.run_stop.stop_id(stop_id)) throw new Error('stop_id non valido');
    if (!VALIDATIONS.run_stop.status(status)) throw new Error('status non valido');

    const result = this.db.runSync(
      `INSERT INTO run_stops (run_id, stop_id, status, notes) VALUES (?, ?, ?, ?)`,
      [run_id, stop_id, status, notes]
    );
    
    return result.lastInsertRowId;
  }

  /**
   * Completa una fermata in una run
   * @param {number} runStopId - ID run_stop
   * @param {Object} completionData - Dati completamento
   * @returns {Promise<boolean>} True se completata
   */
  async completeStopInRun(runStopId, completionData = {}) {
    this.ensureInitialized();
    
    const { latitude = null, longitude = null, accuracy = null, notes = '' } = completionData;
    
    const result = this.db.runSync(
      `UPDATE run_stops SET 
       status = 'completed',
       completed_at = CURRENT_TIMESTAMP,
       latitude = ?,
       longitude = ?,
       accuracy = ?,
       notes = ?
       WHERE id = ?`,
      [latitude, longitude, accuracy, notes, runStopId]
    );
    
    return result.changes > 0;
  }

  /**
   * Ottiene statistiche fermate per run
   * @param {number} runId - ID run
   * @returns {Promise<Object>} Statistiche
   */
  async getRunStopStats(runId) {
    this.ensureInitialized();
    
    const stats = this.db.getAllSync(QUERIES.getRunStopStats, [runId]);
    
    const result = {
      pending: 0,
      completed: 0,
      failed: 0,
      skipped: 0
    };
    
    stats.forEach(stat => {
      result[stat.status] = stat.count;
    });
    
    return result;
  }

  // ==================== OPERAZIONI IMPOSTAZIONI ====================

  /**
   * Ottiene un'impostazione
   * @param {string} key - Chiave impostazione
   * @returns {Promise<any>} Valore impostazione
   */
  async getSetting(key) {
    this.ensureInitialized();
    
    const result = this.db.getFirstSync(QUERIES.getSetting, [key]);
    
    if (!result) {
      return null;
    }
    
    // Converte tipo
    switch (result.type) {
      case 'number':
        return parseFloat(result.value);
      case 'boolean':
        return result.value === 'true';
      case 'json':
        return JSON.parse(result.value);
      default:
        return result.value;
    }
  }

  /**
   * Imposta un'impostazione
   * @param {string} key - Chiave impostazione
   * @param {any} value - Valore impostazione
   * @param {string} type - Tipo valore
   * @returns {Promise<void>}
   */
  async setSetting(key, value, type = 'string') {
    this.ensureInitialized();
    
    let stringValue;
    switch (type) {
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = String(value);
    }
    
    this.db.runSync(
      `INSERT OR REPLACE INTO settings (key, value, type) VALUES (?, ?, ?)`,
      [key, stringValue, type]
    );
  }

  /**
   * Inserisce un'impostazione (alias per setSetting)
   * @param {string} key - Chiave impostazione
   * @param {any} value - Valore impostazione
   * @param {string} type - Tipo valore
   * @returns {Promise<void>}
   */
  async insertSetting(key, value, type = 'string') {
    return this.setSetting(key, value, type);
  }

  // ==================== OPERAZIONI CACHE KML ====================

  /**
   * Salva cache KML
   * @param {Object} cacheData - Dati cache
   * @returns {Promise<void>}
   */
  async saveKMLCache(cacheData) {
    this.ensureInitialized();
    
    const { zone_id, plan, content, parsed_data, file_size, last_modified } = cacheData;
    
    this.db.runSync(
      `INSERT OR REPLACE INTO kml_cache 
       (zone_id, plan, content, parsed_data, file_size, last_modified) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [zone_id, plan.toUpperCase(), content, JSON.stringify(parsed_data), file_size, last_modified]
    );
  }

  /**
   * Ottiene cache KML
   * @param {number} zoneId - ID zona
   * @param {string} plan - Piano
   * @returns {Promise<Object|null>} Cache KML
   */
  async getKMLCache(zoneId, plan) {
    this.ensureInitialized();
    
    const result = this.db.getFirstSync(QUERIES.getKMLCache, [zoneId, plan.toUpperCase()]);
    
    if (!result) {
      return null;
    }
    
    return {
      ...result,
      parsed_data: JSON.parse(result.parsed_data)
    };
  }

  // ==================== UTILITÀ ====================

  /**
   * Ottiene statistiche generali
   * @returns {Promise<Object>} Statistiche
   */
  async getStats() {
    this.ensureInitialized();
    
    const result = this.db.getFirstSync(QUERIES.getStats);
    return result;
  }

  /**
   * Esegue query personalizzata
   * @param {string} query - Query SQL
   * @param {Array} params - Parametri query
   * @returns {Promise<any>} Risultato query
   */
  async executeQuery(query, params = []) {
    this.ensureInitialized();
    
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      return this.db.getAllSync(query, params);
    } else {
      return this.db.runSync(query, params);
    }
  }

  /**
   * Chiude connessione database
   */
  close() {
    if (this.db) {
      this.db.closeSync();
      this.db = null;
      this.isInitialized = false;
      console.log('🔒 Database chiuso');
    }
  }

  /**
   * Reset completo database (ATTENZIONE: cancella tutti i dati)
   */
  async reset() {
    this.ensureInitialized();
    
    console.log('⚠️ Reset database in corso...');
    
    // Elimina tutte le tabelle
    const tables = ['kml_cache', 'run_stops', 'runs', 'stops', 'settings', 'zones'];
    
    for (const table of tables) {
      this.db.execSync(`DROP TABLE IF EXISTS ${table}`);
    }
    
    // Ricrea tutto
    await this.createTables();
    await this.createIndexes();
    await this.seedData();
    
    console.log('🔄 Database resettato');
  }
}

// Istanza singleton
export const databaseService = new DatabaseService();

export default databaseService;