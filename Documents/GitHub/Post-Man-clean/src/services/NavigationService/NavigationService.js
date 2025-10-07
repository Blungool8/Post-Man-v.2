/**
 * Navigation Service - Post-Man v3
 * Gestione navigazione e banner "Prossima Fermata"
 * 
 * @fileoverview Servizio per gestire navigazione tra fermate e banner informativi
 */

import { haversineDistance, calculateBearing, bearingToCardinal } from '../MapService/GPSMarkerService';

/**
 * Servizio per gestire la navigazione
 */
class NavigationService {
  constructor() {
    this.currentSelectedStop = null;
    this.bannerVisible = false;
    this.updateInterval = null;
    this.lastUserLocation = null;
    
    this.listeners = new Map();
  }

  /**
   * Seleziona una fermata e attiva il banner
   * @param {Object} stop - Fermata selezionata
   * @param {Object} userLocation - Posizione utente corrente
   */
  selectStop(stop, userLocation = null) {
    console.log(`📍 Fermata selezionata: ${stop.name}`);
    
    this.currentSelectedStop = stop;
    this.bannerVisible = true;
    this.lastUserLocation = userLocation;
    
    // Calcola informazioni iniziali
    const navigationInfo = this.calculateNavigationInfo(stop, userLocation);
    
    // Notifica selezione
    this.notifyListeners('stopSelected', {
      stop,
      navigationInfo,
      bannerVisible: true
    });
    
    // Avvia aggiornamento periodico se abbiamo posizione GPS
    if (userLocation) {
      this.startPeriodicUpdates();
    }
  }

  /**
   * Deseleziona fermata e nasconde banner
   */
  deselectStop() {
    console.log('📍 Fermata deselezionata');
    
    this.currentSelectedStop = null;
    this.bannerVisible = false;
    this.lastUserLocation = null;
    
    // Ferma aggiornamenti periodici
    this.stopPeriodicUpdates();
    
    // Notifica deselezione
    this.notifyListeners('stopDeselected', {
      bannerVisible: false
    });
  }

  /**
   * Aggiorna posizione utente per calcoli di navigazione
   * @param {Object} userLocation - Nuova posizione utente
   */
  updateUserLocation(userLocation) {
    this.lastUserLocation = userLocation;
    
    if (this.bannerVisible && this.currentSelectedStop) {
      const navigationInfo = this.calculateNavigationInfo(this.currentSelectedStop, userLocation);
      
      this.notifyListeners('navigationUpdated', {
        stop: this.currentSelectedStop,
        navigationInfo,
        userLocation
      });
    }
  }

  /**
   * Calcola informazioni di navigazione per una fermata
   * @param {Object} stop - Fermata
   * @param {Object} userLocation - Posizione utente
   * @returns {Object} Informazioni di navigazione
   */
  calculateNavigationInfo(stop, userLocation) {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return {
        distance: null,
        distanceText: 'Posizione GPS non disponibile',
        bearing: null,
        direction: null,
        eta: null,
        canNavigate: false
      };
    }

    if (!stop.latitude || !stop.longitude) {
      return {
        distance: null,
        distanceText: 'Coordinate fermata non valide',
        bearing: null,
        direction: null,
        eta: null,
        canNavigate: false
      };
    }

    // Calcola distanza
    const distance = haversineDistance(userLocation, {
      latitude: stop.latitude,
      longitude: stop.longitude
    });

    // Calcola bearing e direzione
    const bearing = calculateBearing(userLocation, {
      latitude: stop.latitude,
      longitude: stop.longitude
    });

    const direction = bearingToCardinal(bearing);

    // Stima ETA (assumendo velocità media di 5 km/h a piedi)
    const walkingSpeed = 5000; // metri all'ora
    const etaMinutes = Math.round((distance / walkingSpeed) * 60);

    // Formatta testo distanza
    const distanceText = this.formatDistance(distance);

    return {
      distance: Math.round(distance),
      distanceText,
      bearing: Math.round(bearing),
      direction,
      eta: etaMinutes,
      etaText: this.formatETA(etaMinutes),
      canNavigate: true,
      accuracy: userLocation.accuracy || null
    };
  }

  /**
   * Formatta distanza in testo leggibile
   * @param {number} distance - Distanza in metri
   * @returns {string} Testo formattato
   */
  formatDistance(distance) {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      const km = (distance / 1000).toFixed(1);
      return `${km}km`;
    }
  }

  /**
   * Formatta ETA in testo leggibile
   * @param {number} etaMinutes - ETA in minuti
   * @returns {string} Testo formattato
   */
  formatETA(etaMinutes) {
    if (etaMinutes < 1) {
      return '< 1 min';
    } else if (etaMinutes < 60) {
      return `${etaMinutes} min`;
    } else {
      const hours = Math.floor(etaMinutes / 60);
      const minutes = etaMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Avvia aggiornamenti periodici del banner
   */
  startPeriodicUpdates() {
    // Ferma eventuali aggiornamenti precedenti
    this.stopPeriodicUpdates();
    
    // Aggiorna ogni secondo
    this.updateInterval = setInterval(() => {
      if (this.bannerVisible && this.currentSelectedStop && this.lastUserLocation) {
        const navigationInfo = this.calculateNavigationInfo(this.currentSelectedStop, this.lastUserLocation);
        
        this.notifyListeners('navigationUpdated', {
          stop: this.currentSelectedStop,
          navigationInfo,
          userLocation: this.lastUserLocation
        });
      }
    }, 1000);
  }

  /**
   * Ferma aggiornamenti periodici
   */
  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Trova la fermata più vicina
   * @param {Array} stops - Array di fermate
   * @param {Object} userLocation - Posizione utente
   * @returns {Object|null} Fermata più vicina con info navigazione
   */
  findNearestStop(stops, userLocation) {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return null;
    }

    if (!stops || stops.length === 0) {
      return null;
    }

    let nearestStop = null;
    let minDistance = Infinity;

    for (const stop of stops) {
      if (!stop.latitude || !stop.longitude) {
        continue;
      }

      const distance = haversineDistance(userLocation, {
        latitude: stop.latitude,
        longitude: stop.longitude
      });

      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    }

    if (!nearestStop) {
      return null;
    }

    const navigationInfo = this.calculateNavigationInfo(nearestStop, userLocation);

    return {
      stop: nearestStop,
      navigationInfo,
      isNearest: true
    };
  }

  /**
   * Ottiene stato corrente del servizio
   * @returns {Object} Stato corrente
   */
  getCurrentState() {
    return {
      selectedStop: this.currentSelectedStop,
      bannerVisible: this.bannerVisible,
      lastUserLocation: this.lastUserLocation,
      isUpdating: !!this.updateInterval
    };
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
    this.deselectStop();
    this.listeners.clear();
    console.log('🔄 NavigationService reset');
  }
}

// Istanza singleton
export const navigationService = new NavigationService();

export default navigationService;
