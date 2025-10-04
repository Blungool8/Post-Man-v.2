/**
 * Manual Stop Service - Post-Man v3
 * Gestione fermate aggiunte manualmente dall'utente
 * 
 * @fileoverview Servizio per aggiungere, gestire e salvare fermate manuali
 */

/**
 * Servizio per gestire fermate manuali
 */
class ManualStopService {
  constructor() {
    this.manualStops = [];
    this.listeners = new Map();
  }

  /**
   * Aggiunge una fermata manuale
   * @param {Object} stopData - Dati fermata {latitude, longitude, name, description?, zone, subzone}
   * @returns {Object} Fermata creata
   */
  addManualStop(stopData) {
    try {
      const { latitude, longitude, name, description = '', zone, subzone } = stopData;

      // Validazione dati
      if (!latitude || !longitude || !name || !zone || !subzone) {
        throw new Error('Dati fermata incompleti');
      }

      if (!this.isValidCoordinate(latitude, longitude)) {
        throw new Error('Coordinate non valide');
      }

      // Crea fermata manuale
      const manualStop = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        name: name.trim(),
        description: description.trim(),
        zone_id: parseInt(zone, 10),
        plan: subzone.toUpperCase(),
        is_manual: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Aggiunge alla lista
      this.manualStops.push(manualStop);

      // Notifica aggiunta
      this.notifyListeners('manualStopAdded', {
        stop: manualStop,
        totalCount: this.manualStops.length
      });

      console.log(`✅ Fermata manuale aggiunta: ${manualStop.name} (${manualStop.id})`);

      return manualStop;

    } catch (error) {
      console.error('❌ Errore aggiunta fermata manuale:', error);
      throw error;
    }
  }

  /**
   * Rimuove una fermata manuale
   * @param {string} stopId - ID fermata da rimuovere
   * @returns {boolean} True se rimossa
   */
  removeManualStop(stopId) {
    const index = this.manualStops.findIndex(stop => stop.id === stopId);
    
    if (index === -1) {
      console.warn(`⚠️ Fermata manuale non trovata: ${stopId}`);
      return false;
    }

    const removedStop = this.manualStops.splice(index, 1)[0];

    // Notifica rimozione
    this.notifyListeners('manualStopRemoved', {
      stopId,
      stop: removedStop,
      totalCount: this.manualStops.length
    });

    console.log(`🗑️ Fermata manuale rimossa: ${removedStop.name} (${stopId})`);

    return true;
  }

  /**
   * Aggiorna una fermata manuale
   * @param {string} stopId - ID fermata
   * @param {Object} updateData - Dati da aggiornare
   * @returns {Object|null} Fermata aggiornata
   */
  updateManualStop(stopId, updateData) {
    const stop = this.manualStops.find(s => s.id === stopId);
    
    if (!stop) {
      console.warn(`⚠️ Fermata manuale non trovata per aggiornamento: ${stopId}`);
      return null;
    }

    // Aggiorna dati
    const updatedStop = {
      ...stop,
      ...updateData,
      id: stopId, // Mantieni ID originale
      is_manual: 1, // Mantieni flag manuale
      updated_at: new Date().toISOString()
    };

    // Sostituisci nella lista
    const index = this.manualStops.findIndex(s => s.id === stopId);
    this.manualStops[index] = updatedStop;

    // Notifica aggiornamento
    this.notifyListeners('manualStopUpdated', {
      stopId,
      oldStop: stop,
      updatedStop,
      totalCount: this.manualStops.length
    });

    console.log(`✏️ Fermata manuale aggiornata: ${updatedStop.name} (${stopId})`);

    return updatedStop;
  }

  /**
   * Ottiene tutte le fermate manuali
   * @param {number} [zone] - Filtra per zona (opzionale)
   * @param {string} [subzone] - Filtra per sottozona (opzionale)
   * @returns {Array} Array di fermate manuali
   */
  getManualStops(zone = null, subzone = null) {
    let filteredStops = [...this.manualStops];

    if (zone !== null) {
      filteredStops = filteredStops.filter(stop => stop.zone_id === zone);
    }

    if (subzone !== null) {
      filteredStops = filteredStops.filter(stop => stop.plan === subzone.toUpperCase());
    }

    return filteredStops;
  }

  /**
   * Ottiene una fermata manuale per ID
   * @param {string} stopId - ID fermata
   * @returns {Object|null} Fermata trovata
   */
  getManualStop(stopId) {
    return this.manualStops.find(stop => stop.id === stopId) || null;
  }

  /**
   * Verifica se una fermata è manuale
   * @param {string} stopId - ID fermata
   * @returns {boolean} True se è manuale
   */
  isManualStop(stopId) {
    return this.manualStops.some(stop => stop.id === stopId);
  }

  /**
   * Ottiene statistiche delle fermate manuali
   * @returns {Object} Statistiche
   */
  getStats() {
    const totalCount = this.manualStops.length;
    
    // Raggruppa per zona
    const byZone = {};
    this.manualStops.forEach(stop => {
      const zoneKey = `${stop.zone_id}_${stop.plan}`;
      byZone[zoneKey] = (byZone[zoneKey] || 0) + 1;
    });

    // Statistiche per data
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const addedToday = this.manualStops.filter(stop => {
      const createdDate = new Date(stop.created_at);
      return createdDate >= today;
    }).length;

    return {
      totalCount,
      byZone,
      addedToday,
      lastAdded: this.manualStops.length > 0 ? this.manualStops[this.manualStops.length - 1].created_at : null
    };
  }

  /**
   * Valida coordinate
   * @param {number} latitude - Latitudine
   * @param {number} longitude - Longitudine
   * @returns {boolean} True se valide
   */
  isValidCoordinate(latitude, longitude) {
    return (
      !isNaN(latitude) && !isNaN(longitude) &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      isFinite(latitude) && isFinite(longitude)
    );
  }

  /**
   * Cerca fermate manuali per nome
   * @param {string} searchTerm - Termine di ricerca
   * @returns {Array} Fermate trovate
   */
  searchManualStops(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [...this.manualStops];
    }

    const term = searchTerm.toLowerCase().trim();
    
    return this.manualStops.filter(stop => 
      stop.name.toLowerCase().includes(term) ||
      (stop.description && stop.description.toLowerCase().includes(term))
    );
  }

  /**
   * Esporta fermate manuali in formato JSON
   * @returns {string} JSON delle fermate
   */
  exportManualStops() {
    return JSON.stringify({
      manualStops: this.manualStops,
      exportedAt: new Date().toISOString(),
      count: this.manualStops.length
    }, null, 2);
  }

  /**
   * Importa fermate manuali da JSON
   * @param {string} jsonData - JSON delle fermate
   * @returns {Object} Risultato importazione
   */
  importManualStops(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.manualStops || !Array.isArray(data.manualStops)) {
        throw new Error('Formato dati non valido');
      }

      const importedCount = data.manualStops.length;
      const validStops = [];

      // Valida ogni fermata
      for (const stop of data.manualStops) {
        if (this.isValidManualStop(stop)) {
          validStops.push(stop);
        }
      }

      // Aggiunge fermate valide
      this.manualStops.push(...validStops);

      // Notifica importazione
      this.notifyListeners('manualStopsImported', {
        importedCount,
        validCount: validStops.length,
        totalCount: this.manualStops.length
      });

      console.log(`📥 Importate ${validStops.length} fermate manuali (${importedCount} totali)`);

      return {
        success: true,
        importedCount,
        validCount: validStops.length,
        errors: importedCount - validStops.length
      };

    } catch (error) {
      console.error('❌ Errore importazione fermate manuali:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Valida una fermata manuale per importazione
   * @param {Object} stop - Fermata da validare
   * @returns {boolean} True se valida
   */
  isValidManualStop(stop) {
    return (
      stop &&
      stop.id &&
      stop.latitude &&
      stop.longitude &&
      stop.name &&
      stop.zone_id &&
      stop.plan &&
      stop.is_manual === 1 &&
      this.isValidCoordinate(stop.latitude, stop.longitude)
    );
  }

  /**
   * Svuota tutte le fermate manuali
   */
  clearAllManualStops() {
    const count = this.manualStops.length;
    this.manualStops = [];

    // Notifica svuotamento
    this.notifyListeners('allManualStopsCleared', {
      clearedCount: count
    });

    console.log(`🧹 Rimosse ${count} fermate manuali`);
  }

  /**
   * Aggiunge listener per eventi
   * @param {string} event - Nome evento
   * @param {Function} callback - Callback
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Rimuove listener
   * @param {string} event - Nome evento
   * @param {Function} callback - Callback
   */
  removeListener(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Notifica eventi ai listener
   * @param {string} event - Nome evento
   * @param {Object} data - Dati evento
   */
  notifyListeners(event, data = {}) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Errore in listener per evento ${event}:`, error);
      }
    });
  }

  /**
   * Reset completo del servizio
   */
  reset() {
    this.clearAllManualStops();
    this.listeners.clear();
    console.log('🔄 ManualStopService reset');
  }
}

// Istanza singleton
export const manualStopService = new ManualStopService();

export default manualStopService;
