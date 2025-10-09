import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Inizializza il database
  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('postman.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Crea le tabelle necessarie
  async createTables() {
    const createRoutesTable = `
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        total_stops INTEGER DEFAULT 0,
        completed_stops INTEGER DEFAULT 0
      );
    `;

    const createStopsTable = `
      CREATE TABLE IF NOT EXISTS stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        order_index INTEGER NOT NULL,
        notes TEXT,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
      );
    `;

    const createUserLocationTable = `
      CREATE TABLE IF NOT EXISTS user_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.execAsync(createRoutesTable);
    await this.db.execAsync(createStopsTable);
    await this.db.execAsync(createUserLocationTable);
  }

  // CRUD Operations per Routes
  async createRoute(routeData) {
    try {
      const { name, description = '', status = 'active' } = routeData;
      
      const result = await this.db.runAsync(
        'INSERT INTO routes (name, description, status) VALUES (?, ?, ?)',
        [name, description, status]
      );
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  async getRoutes() {
    try {
      const routes = await this.db.getAllAsync(
        'SELECT * FROM routes ORDER BY created_at DESC'
      );
      return routes;
    } catch (error) {
      console.error('Error getting routes:', error);
      throw error;
    }
  }

  async getRouteById(routeId) {
    try {
      const route = await this.db.getFirstAsync(
        'SELECT * FROM routes WHERE id = ?',
        [routeId]
      );
      return route;
    } catch (error) {
      console.error('Error getting route by id:', error);
      throw error;
    }
  }

  async updateRoute(routeId, routeData) {
    try {
      const { name, description, status } = routeData;
      
      await this.db.runAsync(
        'UPDATE routes SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description, status, routeId]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  async deleteRoute(routeId) {
    try {
      await this.db.runAsync('DELETE FROM routes WHERE id = ?', [routeId]);
      return true;
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }

  // CRUD Operations per Stops
  async createStop(stopData) {
    try {
      const { 
        route_id, 
        name, 
        address = '', 
        latitude, 
        longitude, 
        status = 'pending',
        order_index,
        notes = ''
      } = stopData;
      
      const result = await this.db.runAsync(
        'INSERT INTO stops (route_id, name, address, latitude, longitude, status, order_index, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [route_id, name, address, latitude, longitude, status, order_index, notes]
      );
      
      // Aggiorna il conteggio delle fermate nel route
      await this.updateRouteStopCount(route_id);
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating stop:', error);
      throw error;
    }
  }

  async getStopsByRouteId(routeId) {
    try {
      const stops = await this.db.getAllAsync(
        'SELECT * FROM stops WHERE route_id = ? ORDER BY order_index ASC',
        [routeId]
      );
      return stops;
    } catch (error) {
      console.error('Error getting stops by route id:', error);
      throw error;
    }
  }

  async getStopById(stopId) {
    try {
      const stop = await this.db.getFirstAsync(
        'SELECT * FROM stops WHERE id = ?',
        [stopId]
      );
      return stop;
    } catch (error) {
      console.error('Error getting stop by id:', error);
      throw error;
    }
  }

  async updateStop(stopId, stopData) {
    try {
      const { name, address, latitude, longitude, status, notes } = stopData;
      
      const updateFields = [];
      const updateValues = [];
      
      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(address);
      }
      if (latitude !== undefined) {
        updateFields.push('latitude = ?');
        updateValues.push(latitude);
      }
      if (longitude !== undefined) {
        updateFields.push('longitude = ?');
        updateValues.push(longitude);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
        if (status === 'completed') {
          updateFields.push('completed_at = CURRENT_TIMESTAMP');
        }
      }
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }
      
      updateValues.push(stopId);
      
      await this.db.runAsync(
        `UPDATE stops SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      // Aggiorna il conteggio delle fermate completate nel route
      const stop = await this.getStopById(stopId);
      if (stop) {
        await this.updateRouteStopCount(stop.route_id);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating stop:', error);
      throw error;
    }
  }

  async deleteStop(stopId) {
    try {
      const stop = await this.getStopById(stopId);
      await this.db.runAsync('DELETE FROM stops WHERE id = ?', [stopId]);
      
      // Aggiorna il conteggio delle fermate nel route
      if (stop) {
        await this.updateRouteStopCount(stop.route_id);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting stop:', error);
      throw error;
    }
  }

  // Helper per aggiornare il conteggio delle fermate
  async updateRouteStopCount(routeId) {
    try {
      const totalStops = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM stops WHERE route_id = ?',
        [routeId]
      );
      
      const completedStops = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM stops WHERE route_id = ? AND status = "completed"',
        [routeId]
      );
      
      await this.db.runAsync(
        'UPDATE routes SET total_stops = ?, completed_stops = ? WHERE id = ?',
        [totalStops.count, completedStops.count, routeId]
      );
    } catch (error) {
      console.error('Error updating route stop count:', error);
    }
  }

  // Operations per User Location
  async saveUserLocation(locationData) {
    try {
      const { latitude, longitude, accuracy } = locationData;
      
      await this.db.runAsync(
        'INSERT INTO user_locations (latitude, longitude, accuracy) VALUES (?, ?, ?)',
        [latitude, longitude, accuracy]
      );
      
      return true;
    } catch (error) {
      console.error('Error saving user location:', error);
      throw error;
    }
  }

  async getRecentUserLocations(limit = 10) {
    try {
      const locations = await this.db.getAllAsync(
        'SELECT * FROM user_locations ORDER BY timestamp DESC LIMIT ?',
        [limit]
      );
      return locations;
    } catch (error) {
      console.error('Error getting recent user locations:', error);
      throw error;
    }
  }

  // Utility methods
  async clearAllData() {
    try {
      await this.db.execAsync('DELETE FROM stops');
      await this.db.execAsync('DELETE FROM routes');
      await this.db.execAsync('DELETE FROM user_locations');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async getDatabaseStats() {
    try {
      const routeCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM routes');
      const stopCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM stops');
      const locationCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM user_locations');
      
      return {
        routes: routeCount.count,
        stops: stopCount.count,
        locations: locationCount.count
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  // Chiude la connessione al database
  async close() {
    try {
      if (this.db) {
        await this.db.closeAsync();
        this.db = null;
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

// Singleton instance
const databaseService = new DatabaseService();

export default databaseService;
