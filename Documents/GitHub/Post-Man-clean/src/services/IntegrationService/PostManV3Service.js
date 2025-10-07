/**
 * Post-Man v3 Integration Service
 * Servizio principale che integra tutti i componenti v3
 * 
 * @fileoverview Coordina KML, Map, GPS, Navigation e Database per architettura v3 completa
 */

import kmlService from '../KMLService/KMLService';
import mapStateService from '../MapService/MapStateService';
import navigationService from '../NavigationService/NavigationService';
import manualStopService from '../StopService/ManualStopService';
import databaseService from '../DatabaseService/DatabaseService';

/**
 * Servizio principale Post-Man v3
 */
class PostManV3Service {
  constructor() {
    this.isInitialized = false;
    this.listeners = new Map();
  }

  /**
   * Inizializza tutti i servizi
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('🚀 Inizializzazione Post-Man v3...');
      
      // Inizializza database
      await databaseService.initialize();
      
      // Setup listener per sincronizzazione
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ Post-Man v3 inizializzato con successo');
      
      this.notifyListeners('initialized');
      
    } catch (error) {
      console.error('❌ Errore inizializzazione Post-Man v3:', error);
      throw error;
    }
  }

  /**
   * Setup listener per sincronizzazione tra servizi
   */
  setupEventListeners() {
    // Sincronizza fermate manuali con database
    manualStopService.addListener('manualStopAdded', async (data) => {
      try {
        await databaseService.insertStop({
          zone_id: data.stop.zone_id,
          plan: data.stop.plan,
          name: data.stop.name,
          description: data.stop.description,
          lat: data.stop.latitude,
          lng: data.stop.longitude,
          is_manual: 1
        });
        console.log('💾 Fermata manuale sincronizzata con database');
      } catch (error) {
        console.error('❌ Errore sincronizzazione fermata manuale:', error);
      }
    });

    // Sincronizza selezione fermata con navigation
    mapStateService.addListener('stopSelected', (data) => {
      navigationService.selectStop(data.stop, this.lastUserLocation);
    });

    mapStateService.addListener('stopDeselected', () => {
      navigationService.deselectStop();
    });
  }

  /**
   * Carica zona/sottozona completa (KML + Database)
   * @param {number} zone - Numero zona
   * @param {string} subzone - Sottozona ('A' o 'B')
   * @returns {Promise<Object>} Risultato caricamento
   */
  async loadZone(zone, subzone) {
    try {
      console.log(`📍 Caricamento Zona ${zone} Sottozona ${subzone}...`);
      
      // 1. Carica KML
      const kmlResult = await kmlService.loadKMLForZone(zone, subzone);
      
      if (!kmlResult.success) {
        throw new Error(`Errore caricamento KML: ${kmlResult.error}`);
      }
      
      // 2. Carica fermate dal database
      const dbStops = await databaseService.getStopsByZone(zone, subzone);
      
      // 3. Combina percorsi KML con fermate database
      const combinedData = {
        routes: kmlResult.parsedKML.routes,
        stops: dbStops
      };
      
      // 4. Aggiorna stato mappa
      await mapStateService.switchToZone(zone, subzone, combinedData);
      
      // 5. Salva cache KML
      await databaseService.saveKMLCache({
        zone_id: zone,
        plan: subzone,
        content: 'cached', // Contenuto già parsato
        parsed_data: kmlResult.parsedKML,
        file_size: kmlResult.metadata.fileSize,
        last_modified: new Date().toISOString()
      });
      
      const result = {
        success: true,
        zone,
        subzone,
        routes: combinedData.routes,
        stops: combinedData.stops,
        validation: kmlResult.validation,
        metadata: kmlResult.metadata
      };
      
      console.log(`✅ Zona ${zone} Sottozona ${subzone} caricata:`, {
        routes: result.routes.length,
        stops: result.stops.length
      });
      
      this.notifyListeners('zoneLoaded', result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Errore caricamento Zona ${zone} Sottozona ${subzone}:`, error);
      throw error;
    }
  }

  /**
   * Aggiunge fermata manuale completa
   * @param {Object} stopData - Dati fermata
   * @returns {Promise<Object>} Fermata creata
   */
  async addManualStop(stopData) {
    try {
      // Aggiunge fermata manuale
      const manualStop = manualStopService.addManualStop(stopData);
      
      // Aggiorna stato mappa se zona corrispondente
      const currentState = mapStateService.getCurrentState();
      if (currentState.zone === stopData.zone && currentState.subzone === stopData.subzone) {
        mapStateService.addManualStop(manualStop);
      }
      
      console.log(`✅ Fermata manuale aggiunta: ${manualStop.name}`);
      
      this.notifyListeners('manualStopAdded', { stop: manualStop });
      
      return manualStop;
      
    } catch (error) {
      console.error('❌ Errore aggiunta fermata manuale:', error);
      throw error;
    }
  }

  /**
   * Aggiorna posizione GPS e marker visibili
   * @param {Object} userLocation - Posizione utente
   */
  updateUserLocation(userLocation) {
    this.lastUserLocation = userLocation;
    
    // Aggiorna navigation service
    navigationService.updateUserLocation(userLocation);
    
    // Calcola marker visibili
    const currentState = mapStateService.getCurrentState();
    if (currentState.stops && currentState.stops.length > 0) {
      const visibleStops = this.calculateVisibleStops(userLocation, currentState.stops);
      mapStateService.updateMarkers(visibleStops);
    }
  }

  /**
   * Calcola fermate visibili basandosi su posizione GPS
   * @param {Object} userLocation - Posizione utente
   * @param {Array} allStops - Tutte le fermate
   * @returns {Array} Fermate visibili
   */
  calculateVisibleStops(userLocation, allStops) {
    // Importa funzione da GPSMarkerService
    const { getVisibleStops } = require('../MapService/GPSMarkerService');
    
    return getVisibleStops(userLocation, allStops, 200); // Raggio 200m
  }

  /**
   * Seleziona fermata per navigazione
   * @param {Object} stop - Fermata da selezionare
   */
  selectStopForNavigation(stop) {
    mapStateService.selectStop(stop);
  }

  /**
   * Deseleziona fermata
   */
  deselectStop() {
    mapStateService.deselectStop();
  }

  /**
   * Inizia una nuova run di lavoro
   * @param {Object} runData - Dati run
   * @returns {Promise<number>} ID run creata
   */
  async startRun(runData) {
    try {
      const runId = await databaseService.startRun(runData);
      console.log(`🏃 Run iniziata: ${runId}`);
      
      this.notifyListeners('runStarted', { runId, runData });
      
      return runId;
      
    } catch (error) {
      console.error('❌ Errore inizio run:', error);
      throw error;
    }
  }

  /**
   * Completa una fermata in run corrente
   * @param {Object} completionData - Dati completamento
   * @returns {Promise<boolean>} True se completata
   */
  async completeStop(completionData) {
    try {
      const { stopId, latitude, longitude, accuracy, notes } = completionData;
      
      // Ottieni run attiva
      const activeRun = await databaseService.getActiveRun();
      if (!activeRun) {
        throw new Error('Nessuna run attiva');
      }
      
      // Completa fermata
      const success = await databaseService.completeStopInRun(stopId, {
        latitude,
        longitude,
        accuracy,
        notes
      });
      
      if (success) {
        console.log(`✅ Fermata completata: ${stopId}`);
        this.notifyListeners('stopCompleted', { stopId, completionData });
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Errore completamento fermata:', error);
      throw error;
    }
  }

  /**
   * Ottiene statistiche complete
   * @returns {Promise<Object>} Statistiche
   */
  async getCompleteStats() {
    try {
      const dbStats = await databaseService.getStats();
      const mapStats = mapStateService.getStats();
      const manualStats = manualStopService.getStats();
      const navStats = navigationService.getCurrentState();
      
      return {
        database: dbStats,
        map: mapStats,
        manualStops: manualStats,
        navigation: navStats,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Errore statistiche:', error);
      throw error;
    }
  }

  /**
   * Esporta dati in formato JSON
   * @returns {Promise<string>} JSON dei dati
   */
  async exportData() {
    try {
      const stats = await this.getCompleteStats();
      const manualStops = await databaseService.getManualStops();
      const runs = await databaseService.getRunsByZone(9, 'B'); // Esempio
      
      const exportData = {
        version: '3.0.0',
        exportedAt: new Date().toISOString(),
        stats,
        data: {
          manualStops,
          runs
        }
      };
      
      return JSON.stringify(exportData, null, 2);
      
    } catch (error) {
      console.error('❌ Errore export dati:', error);
      throw error;
    }
  }

  /**
   * Reset completo di tutti i servizi
   */
  async reset() {
    try {
      console.log('🔄 Reset completo Post-Man v3...');
      
      // Reset tutti i servizi
      mapStateService.reset();
      navigationService.reset();
      manualStopService.reset();
      await databaseService.reset();
      kmlService.clearCache();
      
      this.isInitialized = false;
      this.listeners.clear();
      
      console.log('✅ Reset completato');
      
    } catch (error) {
      console.error('❌ Errore reset:', error);
      throw error;
    }
  }

  /**
   * Verifica stato inizializzazione
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && databaseService.isReady();
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
}

// Istanza singleton
export const postManV3Service = new PostManV3Service();

export default postManV3Service;
