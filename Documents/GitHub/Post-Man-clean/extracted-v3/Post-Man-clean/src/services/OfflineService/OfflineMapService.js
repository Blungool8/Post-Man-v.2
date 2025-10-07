import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

class OfflineMapService {
  constructor() {
    this.tileCacheDir = `${FileSystem.documentDirectory}tiles/`;
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
    this.tileSize = 256; // Standard tile size
    this.supportedZoomLevels = [10, 11, 12, 13, 14, 15, 16, 17, 18];
    this.db = null;
  }

  // Inizializza il servizio mappe offline
  async initialize() {
    try {
      // Crea directory cache tiles
      await this.ensureCacheDirectory();
      
      // Inizializza database per metadati tiles
      await this.initializeTileDatabase();
      
      console.log('OfflineMapService initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing OfflineMapService:', error);
      throw error;
    }
  }

  // Crea directory cache se non esiste
  async ensureCacheDirectory() {
    const dirInfo = await FileSystem.getInfoAsync(this.tileCacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.tileCacheDir, { intermediates: true });
    }
  }

  // Inizializza database per metadati tiles
  async initializeTileDatabase() {
    this.db = await SQLite.openDatabaseAsync('offline_tiles.db');
    
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tile_cache (
        z INTEGER NOT NULL,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (z, x, y)
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS download_regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        center_lat REAL NOT NULL,
        center_lng REAL NOT NULL,
        radius_km REAL NOT NULL,
        zoom_levels TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        total_tiles INTEGER DEFAULT 0,
        downloaded_tiles INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      );
    `);
  }

  // Scarica tiles per una regione specifica
  async downloadRegionTiles(regionConfig) {
    const {
      name,
      centerLat,
      centerLng,
      radiusKm,
      zoomLevels = [12, 13, 14, 15, 16],
      onProgress
    } = regionConfig;

    try {
      // Calcola bounds della regione
      const bounds = this.calculateRegionBounds(centerLat, centerLng, radiusKm);
      
      // Crea record regione nel database
      const regionId = await this.createDownloadRegion({
        name,
        center_lat: centerLat,
        center_lng: centerLng,
        radius_km: radiusKm,
        zoom_levels: JSON.stringify(zoomLevels)
      });

      let totalTiles = 0;
      let downloadedTiles = 0;

      // Calcola numero totale tiles
      for (const zoom of zoomLevels) {
        const tilesForZoom = this.calculateTilesForZoom(bounds, zoom);
        totalTiles += tilesForZoom.length;
      }

      await this.updateRegionTotalTiles(regionId, totalTiles);

      // Scarica tiles per ogni zoom level
      for (const zoom of zoomLevels) {
        const tiles = this.calculateTilesForZoom(bounds, zoom);
        
        for (const tile of tiles) {
          try {
            await this.downloadTile(tile.x, tile.y, zoom);
            downloadedTiles++;
            
            // Aggiorna progresso
            if (onProgress) {
              onProgress({
                regionId,
                downloadedTiles,
                totalTiles,
                currentZoom: zoom,
                progress: (downloadedTiles / totalTiles) * 100
              });
            }

            // Aggiorna database
            await this.updateRegionDownloadedTiles(regionId, downloadedTiles);
            
          } catch (error) {
            console.error(`Error downloading tile ${zoom}/${tile.x}/${tile.y}:`, error);
          }
        }
      }

      // Marca regione come completata
      await this.completeDownloadRegion(regionId);
      
      return {
        regionId,
        totalTiles,
        downloadedTiles,
        success: true
      };

    } catch (error) {
      console.error('Error downloading region tiles:', error);
      throw error;
    }
  }

  // Scarica un singolo tile
  async downloadTile(x, y, z) {
    const tileUrl = this.getTileUrl(x, y, z);
    const tilePath = this.getTilePath(x, y, z);
    
    // Verifica se tile esiste già
    const tileInfo = await FileSystem.getInfoAsync(tilePath);
    if (tileInfo.exists) {
      await this.updateTileAccessTime(z, x, y);
      return tilePath;
    }

    // Scarica tile
    const downloadResult = await FileSystem.downloadAsync(tileUrl, tilePath);
    
    if (downloadResult.status === 200) {
      // Salva metadati nel database
      await this.saveTileMetadata(z, x, y, tilePath, downloadResult.headers['content-length'] || 0);
      return tilePath;
    } else {
      throw new Error(`Failed to download tile: ${downloadResult.status}`);
    }
  }

  // Ottiene URL per tile
  getTileUrl(x, y, z) {
    // Usa OpenStreetMap tiles (gratuiti)
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }

  // Ottiene path locale per tile
  getTilePath(x, y, z) {
    return `${this.tileCacheDir}${z}/${x}/${y}.png`;
  }

  // Calcola bounds di una regione
  calculateRegionBounds(centerLat, centerLng, radiusKm) {
    const earthRadius = 6371; // km
    const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
    const lngDelta = (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(centerLat * Math.PI / 180);

    return {
      north: centerLat + latDelta,
      south: centerLat - latDelta,
      east: centerLng + lngDelta,
      west: centerLng - lngDelta
    };
  }

  // Calcola tiles necessari per un zoom level
  calculateTilesForZoom(bounds, zoom) {
    const tiles = [];
    
    const minX = Math.floor(this.lngToTileX(bounds.west, zoom));
    const maxX = Math.floor(this.lngToTileX(bounds.east, zoom));
    const minY = Math.floor(this.latToTileY(bounds.north, zoom));
    const maxY = Math.floor(this.latToTileY(bounds.south, zoom));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ x, y });
      }
    }

    return tiles;
  }

  // Converte longitudine a tile X
  lngToTileX(lng, zoom) {
    return ((lng + 180) / 360) * Math.pow(2, zoom);
  }

  // Converte latitudine a tile Y
  latToTileY(lat, zoom) {
    return (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
  }

  // Verifica se tile è disponibile offline
  async isTileAvailableOffline(x, y, z) {
    const tilePath = this.getTilePath(x, y, z);
    const tileInfo = await FileSystem.getInfoAsync(tilePath);
    return tileInfo.exists;
  }

  // Ottiene path tile offline se disponibile
  async getOfflineTilePath(x, y, z) {
    const isAvailable = await this.isTileAvailableOffline(x, y, z);
    if (isAvailable) {
      await this.updateTileAccessTime(z, x, y);
      return this.getTilePath(x, y, z);
    }
    return null;
  }

  // Gestisce cache tiles (LRU)
  async manageCacheSize() {
    try {
      const cacheSize = await this.getCacheSize();
      
      if (cacheSize > this.maxCacheSize) {
        // Ottieni tiles meno recentemente utilizzati
        const oldTiles = await this.db.getAllAsync(`
          SELECT z, x, y, file_path 
          FROM tile_cache 
          ORDER BY last_accessed ASC 
          LIMIT 100
        `);

        // Rimuovi tiles più vecchi
        for (const tile of oldTiles) {
          await this.removeTile(tile.z, tile.x, tile.y);
        }
      }
    } catch (error) {
      console.error('Error managing cache size:', error);
    }
  }

  // Ottiene dimensione cache
  async getCacheSize() {
    try {
      const result = await this.db.getFirstAsync(`
        SELECT SUM(file_size) as total_size 
        FROM tile_cache
      `);
      return result?.total_size || 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  // Rimuove un tile
  async removeTile(z, x, y) {
    try {
      const tilePath = this.getTilePath(x, y, z);
      await FileSystem.deleteAsync(tilePath, { idempotent: true });
      
      await this.db.runAsync(`
        DELETE FROM tile_cache 
        WHERE z = ? AND x = ? AND y = ?
      `, [z, x, y]);
    } catch (error) {
      console.error('Error removing tile:', error);
    }
  }

  // Database operations
  async createDownloadRegion(regionData) {
    const result = await this.db.runAsync(`
      INSERT INTO download_regions (name, center_lat, center_lng, radius_km, zoom_levels)
      VALUES (?, ?, ?, ?, ?)
    `, [regionData.name, regionData.center_lat, regionData.center_lng, regionData.radius_km, regionData.zoom_levels]);
    
    return result.lastInsertRowId;
  }

  async updateRegionTotalTiles(regionId, totalTiles) {
    await this.db.runAsync(`
      UPDATE download_regions 
      SET total_tiles = ? 
      WHERE id = ?
    `, [totalTiles, regionId]);
  }

  async updateRegionDownloadedTiles(regionId, downloadedTiles) {
    await this.db.runAsync(`
      UPDATE download_regions 
      SET downloaded_tiles = ? 
      WHERE id = ?
    `, [downloadedTiles, regionId]);
  }

  async completeDownloadRegion(regionId) {
    await this.db.runAsync(`
      UPDATE download_regions 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [regionId]);
  }

  async saveTileMetadata(z, x, y, filePath, fileSize) {
    await this.db.runAsync(`
      INSERT OR REPLACE INTO tile_cache (z, x, y, file_path, file_size, last_accessed)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [z, x, y, filePath, fileSize]);
  }

  async updateTileAccessTime(z, x, y) {
    await this.db.runAsync(`
      UPDATE tile_cache 
      SET last_accessed = CURRENT_TIMESTAMP 
      WHERE z = ? AND x = ? AND y = ?
    `, [z, x, y]);
  }

  // Ottiene regioni scaricate
  async getDownloadedRegions() {
    return await this.db.getAllAsync(`
      SELECT * FROM download_regions 
      ORDER BY created_at DESC
    `);
  }

  // Ottiene statistiche cache
  async getCacheStats() {
    const stats = await this.db.getFirstAsync(`
      SELECT 
        COUNT(*) as total_tiles,
        SUM(file_size) as total_size,
        MIN(created_at) as oldest_tile,
        MAX(last_accessed) as last_access
      FROM tile_cache
    `);
    
    return stats;
  }

  // Pulisce cache completa
  async clearCache() {
    try {
      // Rimuovi tutti i file tiles
      await FileSystem.deleteAsync(this.tileCacheDir, { idempotent: true });
      await this.ensureCacheDirectory();
      
      // Pulisci database
      await this.db.execAsync('DELETE FROM tile_cache');
      await this.db.execAsync('DELETE FROM download_regions');
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }
}

// Singleton instance
const offlineMapService = new OfflineMapService();

export default offlineMapService;
