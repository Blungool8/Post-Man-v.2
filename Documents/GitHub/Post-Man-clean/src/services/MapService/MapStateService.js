/**
 * Map State Service - Post-Man v3
 * Gestione stato della mappa e cleanup per cambio zona/sottozona
 * 
 * @fileoverview Servizio per gestire stato mappa e operazioni di cleanup
 */

/**
 * Servizio per gestire lo stato della mappa
 */
class MapStateService {
  constructor() {
    this.currentState = {
      zone: null,
      subzone: null,
      routes: [],
      stops: [],
      markers: [],
      selectedStop: null,
      isLoaded: false,
      isLoading: false
    };
    
    this.listeners = new Map();
  }

  /**
   * Ottiene lo stato corrente
   * @returns {Object} Stato corrente
   */
  getCurrentState() {
    return { ...this.currentState };
  }

  /**
   * Verifica se una zona/sottozona è attualmente caricata
   * @param {number} zone - Numero zona
   * @param {string} subzone - Sottozona
   * @returns {boolean} True se la zona è caricata
   */
  isZoneLoaded(zone, subzone) {
    return this.currentState.zone === zone && 
           this.currentState.subzone === subzone && 
           this.currentState.isLoaded;
  }

  /**
   * Carica una nuova zona/sottozona
   * @param {number} zone - Numero zona
   * @param {string} subzone - Sottozona
   * @param {Object} data - Dati da caricare {routes, stops}
   * @returns {Promise<void>}
   */
  async switchToZone(zone, subzone, data) {
    try {
      console.log(`🔄 Switching to Zona ${zone} Sottozona ${subzone}`);
      
      // Verifica se è la stessa zona
      if (this.isZoneLoaded(zone, subzone)) {
        console.log('✅ Zona già caricata, aggiorno solo i dati');
        await this.updateZoneData(zone, subzone, data);
        return;
      }

      // Cleanup stato precedente
      await this.clearCurrentState();

      // Imposta stato di caricamento
      this.setState({
        zone,
        subzone,
        isLoading: true,
        isLoaded: false
      });

      // Carica nuovi dati
      await this.loadZoneData(zone, subzone, data);

      // Finalizza caricamento
      this.setState({
        isLoading: false,
        isLoaded: true
      });

      console.log(`✅ Zona ${zone} Sottozona ${subzone} caricata con successo`);

    } catch (error) {
      console.error(`❌ Errore caricamento Zona ${zone} Sottozona ${subzone}:`, error);
      
      // Reset stato in caso di errore
      this.setState({
        isLoading: false,
        isLoaded: false
      });
      
      throw error;
    }
  }

  /**
   * Pulisce lo stato corrente
   * @returns {Promise<void>}
   */
  async clearCurrentState() {
    console.log('🧹 Clearing current map state...');
    
    const oldZone = this.currentState.zone;
    const oldSubzone = this.currentState.subzone;
    
    if (oldZone && oldSubzone) {
      console.log(`🗑️ Unloading Zona ${oldZone} Sottozona ${oldSubzone}`);
      
      // Notifica cleanup agli ascoltatori
      this.notifyListeners('beforeCleanup', {
        zone: oldZone,
        subzone: oldSubzone
      });
    }

    // Reset stato
    this.setState({
      zone: null,
      subzone: null,
      routes: [],
      stops: [],
      markers: [],
      selectedStop: null,
      isLoaded: false,
      isLoading: false
    });

    // Notifica cleanup completato
    this.notifyListeners('afterCleanup', {
      zone: oldZone,
      subzone: oldSubzone
    });

    console.log('✅ Map state cleared');
  }

  /**
   * Carica dati per una zona
   * @param {number} zone - Numero zona
   * @param {string} subzone - Sottozona
   * @param {Object} data - Dati da caricare
   * @returns {Promise<void>}
   */
  async loadZoneData(zone, subzone, data) {
    const { routes = [], stops = [] } = data;
    
    console.log(`📊 Loading data for Zona ${zone} Sottozona ${subzone}:`, {
      routeCount: routes.length,
      stopCount: stops.length
    });

    // Filtra dati per zona
    const filteredRoutes = routes.filter(route => 
      !route.zone_id || route.zone_id === zone
    );
    
    const filteredStops = stops.filter(stop => 
      stop.zone_id === zone && stop.plan === subzone
    );

    // Aggiorna stato
    this.setState({
      routes: filteredRoutes,
      stops: filteredStops,
      markers: [] // Marker verranno generati dinamicamente
    });

    // Notifica caricamento dati
    this.notifyListeners('dataLoaded', {
      zone,
      subzone,
      routes: filteredRoutes,
      stops: filteredStops
    });
  }

  /**
   * Aggiorna dati per zona corrente
   * @param {number} zone - Numero zona
   * @param {string} subzone - Sottozona
   * @param {Object} data - Dati aggiornati
   * @returns {Promise<void>}
   */
  async updateZoneData(zone, subzone, data) {
    if (!this.isZoneLoaded(zone, subzone)) {
      throw new Error(`Zona ${zone} Sottozona ${subzone} non è caricata`);
    }

    await this.loadZoneData(zone, subzone, data);
    
    this.notifyListeners('dataUpdated', {
      zone,
      subzone,
      ...data
    });
  }

  /**
   * Aggiorna marker visibili
   * @param {Array} markers - Array di marker
   */
  updateMarkers(markers) {
    this.setState({
      markers: [...markers]
    });

    this.notifyListeners('markersUpdated', {
      markers: [...markers]
    });
  }

  /**
   * Seleziona una fermata
   * @param {Object} stop - Fermata selezionata
   */
  selectStop(stop) {
    this.setState({
      selectedStop: stop
    });

    this.notifyListeners('stopSelected', {
      stop
    });
  }

  /**
   * Deseleziona fermata corrente
   */
  deselectStop() {
    this.setState({
      selectedStop: null
    });

    this.notifyListeners('stopDeselected');
  }

  /**
   * Aggiunge una fermata manuale
   * @param {Object} stop - Fermata da aggiungere
   */
  addManualStop(stop) {
    const manualStop = {
      ...stop,
      id: `manual_${Date.now()}`,
      is_manual: 1,
      created_at: new Date().toISOString()
    };

    this.setState({
      stops: [...this.currentState.stops, manualStop]
    });

    this.notifyListeners('manualStopAdded', {
      stop: manualStop
    });

    return manualStop;
  }

  /**
   * Rimuove una fermata manuale
   * @param {string} stopId - ID fermata da rimuovere
   */
  removeManualStop(stopId) {
    const filteredStops = this.currentState.stops.filter(stop => 
      !(stop.id === stopId && stop.is_manual)
    );

    this.setState({
      stops: filteredStops
    });

    this.notifyListeners('manualStopRemoved', {
      stopId
    });
  }

  /**
   * Aggiorna stato interno
   * @param {Object} newState - Nuovo stato
   */
  setState(newState) {
    const oldState = { ...this.currentState };
    this.currentState = { ...this.currentState, ...newState };
    
    // Notifica cambio stato
    this.notifyListeners('stateChanged', {
      oldState,
      newState: this.currentState,
      changes: Object.keys(newState)
    });
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
   * Ottiene statistiche dello stato corrente
   * @returns {Object} Statistiche
   */
  getStats() {
    return {
      currentZone: this.currentState.zone,
      currentSubzone: this.currentState.subzone,
      routeCount: this.currentState.routes.length,
      stopCount: this.currentState.stops.length,
      manualStopCount: this.currentState.stops.filter(s => s.is_manual).length,
      markerCount: this.currentState.markers.length,
      isLoaded: this.currentState.isLoaded,
      isLoading: this.currentState.isLoading,
      hasSelectedStop: !!this.currentState.selectedStop
    };
  }

  /**
   * Reset completo del servizio
   */
  reset() {
    this.clearCurrentState();
    this.listeners.clear();
    console.log('🔄 MapStateService reset');
  }
}

// Istanza singleton
export const mapStateService = new MapStateService();

export default mapStateService;
