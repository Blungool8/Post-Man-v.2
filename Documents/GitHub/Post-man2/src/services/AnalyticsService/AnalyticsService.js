import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

class AnalyticsService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.sessionId = null;
    this.sessionStartTime = null;
    this.events = [];
  }

  // Inizializza il servizio analytics
  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('analytics.db');
      await this.createTables();
      this.isInitialized = true;
      
      // Genera nuova sessione
      await this.startNewSession();
      
      console.log('AnalyticsService initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing AnalyticsService:', error);
      throw error;
    }
  }

  // Crea tabelle per analytics
  async createTables() {
    // Tabella sessioni
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration_seconds INTEGER,
        platform TEXT NOT NULL,
        app_version TEXT NOT NULL,
        device_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabella eventi
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_name TEXT NOT NULL,
        properties TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
      );
    `);

    // Tabella metriche performance
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        unit TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
      );
    `);

    // Tabella utilizzo funzionalità
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS feature_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        feature_name TEXT NOT NULL,
        usage_count INTEGER DEFAULT 1,
        total_duration_seconds INTEGER DEFAULT 0,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
      );
    `);
  }

  // Inizia una nuova sessione
  async startNewSession() {
    try {
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = new Date();
      
      const deviceInfo = await this.getDeviceInfo();
      
      await this.db.runAsync(`
        INSERT INTO sessions (id, start_time, platform, app_version, device_info)
        VALUES (?, ?, ?, ?, ?)
      `, [
        this.sessionId,
        this.sessionStartTime.toISOString(),
        Platform.OS,
        '1.0.0', // App version
        JSON.stringify(deviceInfo)
      ]);

      // Traccia evento sessione iniziata
      await this.trackEvent('session', 'session_started', {
        session_id: this.sessionId,
        platform: Platform.OS,
        device_info: deviceInfo
      });

      console.log('New session started:', this.sessionId);
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  }

  // Termina la sessione corrente
  async endSession() {
    if (!this.sessionId || !this.sessionStartTime) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime - this.sessionStartTime) / 1000);

      await this.db.runAsync(`
        UPDATE sessions 
        SET end_time = ?, duration_seconds = ?
        WHERE id = ?
      `, [endTime.toISOString(), duration, this.sessionId]);

      // Traccia evento sessione terminata
      await this.trackEvent('session', 'session_ended', {
        session_id: this.sessionId,
        duration_seconds: duration
      });

      console.log('Session ended:', this.sessionId, 'Duration:', duration, 'seconds');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Traccia un evento
  async trackEvent(eventType, eventName, properties = {}) {
    if (!this.isInitialized || !this.sessionId) return;

    try {
      const event = {
        session_id: this.sessionId,
        event_type: eventType,
        event_name: eventName,
        properties: JSON.stringify(properties),
        timestamp: new Date().toISOString()
      };

      await this.db.runAsync(`
        INSERT INTO events (session_id, event_type, event_name, properties)
        VALUES (?, ?, ?, ?)
      `, [event.session_id, event.event_type, event.event_name, event.properties]);

      // Aggiungi alla cache locale per batch processing
      this.events.push(event);

      console.log('Event tracked:', eventName, properties);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Traccia utilizzo funzionalità
  async trackFeatureUsage(featureName, durationSeconds = 0) {
    if (!this.isInitialized || !this.sessionId) return;

    try {
      // Verifica se feature esiste già
      const existing = await this.db.getFirstAsync(`
        SELECT * FROM feature_usage 
        WHERE session_id = ? AND feature_name = ?
      `, [this.sessionId, featureName]);

      if (existing) {
        // Aggiorna utilizzo esistente
        await this.db.runAsync(`
          UPDATE feature_usage 
          SET usage_count = usage_count + 1,
              total_duration_seconds = total_duration_seconds + ?,
              last_used = CURRENT_TIMESTAMP
          WHERE session_id = ? AND feature_name = ?
        `, [durationSeconds, this.sessionId, featureName]);
      } else {
        // Crea nuovo record
        await this.db.runAsync(`
          INSERT INTO feature_usage (session_id, feature_name, usage_count, total_duration_seconds)
          VALUES (?, ?, 1, ?)
        `, [this.sessionId, featureName, durationSeconds]);
      }

      // Traccia evento
      await this.trackEvent('feature', 'feature_used', {
        feature_name: featureName,
        duration_seconds: durationSeconds
      });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }

  // Traccia metrica performance
  async trackPerformanceMetric(metricName, value, unit = 'ms') {
    if (!this.isInitialized || !this.sessionId) return;

    try {
      await this.db.runAsync(`
        INSERT INTO performance_metrics (session_id, metric_name, metric_value, unit)
        VALUES (?, ?, ?, ?)
      `, [this.sessionId, metricName, value, unit]);

      console.log('Performance metric tracked:', metricName, value, unit);
    } catch (error) {
      console.error('Error tracking performance metric:', error);
    }
  }

  // Eventi specifici dell'app
  async trackAppStart() {
    await this.trackEvent('app', 'app_started', {
      timestamp: new Date().toISOString()
    });
  }

  async trackAppBackground() {
    await this.trackEvent('app', 'app_backgrounded', {
      timestamp: new Date().toISOString()
    });
  }

  async trackAppForeground() {
    await this.trackEvent('app', 'app_foregrounded', {
      timestamp: new Date().toISOString()
    });
  }

  async trackMapInteraction(interactionType, properties = {}) {
    await this.trackEvent('map', `map_${interactionType}`, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  async trackGPSUpdate(accuracy, latitude, longitude) {
    await this.trackEvent('gps', 'gps_update', {
      accuracy,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
  }

  async trackStopCompleted(stopId, stopName, distance) {
    await this.trackEvent('route', 'stop_completed', {
      stop_id: stopId,
      stop_name: stopName,
      distance_meters: distance,
      timestamp: new Date().toISOString()
    });
  }

  async trackRouteImported(fileType, routeCount, success) {
    await this.trackEvent('import', 'route_imported', {
      file_type: fileType,
      route_count: routeCount,
      success,
      timestamp: new Date().toISOString()
    });
  }

  async trackOfflineMapDownload(regionName, tileCount, success) {
    await this.trackEvent('offline', 'map_downloaded', {
      region_name: regionName,
      tile_count: tileCount,
      success,
      timestamp: new Date().toISOString()
    });
  }

  async trackNavigationMode(enabled) {
    await this.trackEvent('navigation', 'mode_toggled', {
      enabled,
      timestamp: new Date().toISOString()
    });
  }

  // Ottiene statistiche utilizzo
  async getUsageStats(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Statistiche sessioni
      const sessionStats = await this.db.getFirstAsync(`
        SELECT 
          COUNT(*) as total_sessions,
          AVG(duration_seconds) as avg_session_duration,
          SUM(duration_seconds) as total_time_spent
        FROM sessions 
        WHERE start_time >= ?
      `, [cutoffDate.toISOString()]);

      // Top funzionalità utilizzate
      const topFeatures = await this.db.getAllAsync(`
        SELECT 
          feature_name,
          SUM(usage_count) as total_usage,
          SUM(total_duration_seconds) as total_duration
        FROM feature_usage 
        WHERE session_id IN (
          SELECT id FROM sessions WHERE start_time >= ?
        )
        GROUP BY feature_name
        ORDER BY total_usage DESC
        LIMIT 10
      `, [cutoffDate.toISOString()]);

      // Eventi più comuni
      const topEvents = await this.db.getAllAsync(`
        SELECT 
          event_name,
          COUNT(*) as event_count
        FROM events 
        WHERE session_id IN (
          SELECT id FROM sessions WHERE start_time >= ?
        )
        GROUP BY event_name
        ORDER BY event_count DESC
        LIMIT 10
      `, [cutoffDate.toISOString()]);

      // Metriche performance medie
      const performanceStats = await this.db.getAllAsync(`
        SELECT 
          metric_name,
          AVG(metric_value) as avg_value,
          MIN(metric_value) as min_value,
          MAX(metric_value) as max_value,
          COUNT(*) as sample_count
        FROM performance_metrics 
        WHERE session_id IN (
          SELECT id FROM sessions WHERE start_time >= ?
        )
        GROUP BY metric_name
      `, [cutoffDate.toISOString()]);

      return {
        sessionStats,
        topFeatures,
        topEvents,
        performanceStats,
        period: `${days} days`
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }

  // Esporta dati analytics
  async exportAnalyticsData() {
    try {
      const sessions = await this.db.getAllAsync('SELECT * FROM sessions ORDER BY start_time DESC');
      const events = await this.db.getAllAsync('SELECT * FROM events ORDER BY timestamp DESC');
      const features = await this.db.getAllAsync('SELECT * FROM feature_usage ORDER BY last_used DESC');
      const performance = await this.db.getAllAsync('SELECT * FROM performance_metrics ORDER BY timestamp DESC');

      const exportData = {
        export_date: new Date().toISOString(),
        sessions,
        events,
        features,
        performance,
        summary: await this.getUsageStats(30)
      };

      // Salva file di export
      const fileName = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
      
      return filePath;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  // Utility functions
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      // Aggiungi altre info dispositivo se disponibili
    };
  }

  // Pulisce dati vecchi (più di 90 giorni)
  async cleanupOldData() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      await this.db.runAsync('DELETE FROM sessions WHERE start_time < ?', [cutoffDate.toISOString()]);
      await this.db.runAsync('DELETE FROM events WHERE timestamp < ?', [cutoffDate.toISOString()]);
      await this.db.runAsync('DELETE FROM performance_metrics WHERE timestamp < ?', [cutoffDate.toISOString()]);
      await this.db.runAsync('DELETE FROM feature_usage WHERE last_used < ?', [cutoffDate.toISOString()]);

      console.log('Old analytics data cleaned up');
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }
}

// Singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
