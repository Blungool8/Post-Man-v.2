/**
 * GPS Marker Service - Post-Man v3
 * Gestione marker GPS-driven con logica di visibilità basata su distanza
 * 
 * @fileoverview Servizio per gestire marker visibili solo con GPS ON + entro raggio
 */

/**
 * Calcola distanza tra due punti usando formula Haversine
 * @param {Object} point1 - Primo punto {latitude, longitude}
 * @param {Object} point2 - Secondo punto {latitude, longitude}
 * @returns {number} Distanza in metri
 */
function haversineDistance(point1, point2) {
  const R = 6371000; // Raggio Terra in metri
  const lat1Rad = point1.latitude * Math.PI / 180;
  const lat2Rad = point2.latitude * Math.PI / 180;
  const deltaLatRad = (point2.latitude - point1.latitude) * Math.PI / 180;
  const deltaLngRad = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Filtra fermate visibili basandosi su posizione GPS e raggio
 * @param {Object} userLocation - Posizione utente {latitude, longitude, accuracy}
 * @param {Array} allStops - Array di tutte le fermate
 * @param {number} radius - Raggio in metri (default 200m)
 * @returns {Array} Array di fermate visibili
 */
export function getVisibleStops(userLocation, allStops, radius = 200) {
  // Se non c'è posizione GPS o accuracy > 50m, non mostrare marker
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return [];
  }

  if (userLocation.accuracy && userLocation.accuracy > 50) {
    return [];
  }

  const visibleStops = [];

  for (const stop of allStops) {
    if (!stop.latitude || !stop.longitude) {
      continue;
    }

    const distance = haversineDistance(userLocation, {
      latitude: stop.latitude,
      longitude: stop.longitude
    });

    if (distance <= radius) {
      visibleStops.push({
        ...stop,
        distance: Math.round(distance)
      });
    }
  }

  // Ordina per distanza (più vicine prima)
  return visibleStops.sort((a, b) => a.distance - b.distance);
}

/**
 * Calcola bearing (direzione) tra due punti
 * @param {Object} from - Punto di partenza {latitude, longitude}
 * @param {Object} to - Punto di arrivo {latitude, longitude}
 * @returns {number} Bearing in gradi (0-360)
 */
export function calculateBearing(from, to) {
  const lat1Rad = from.latitude * Math.PI / 180;
  const lat2Rad = to.latitude * Math.PI / 180;
  const deltaLngRad = (to.longitude - from.longitude) * Math.PI / 180;

  const y = Math.sin(deltaLngRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLngRad);

  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Converte bearing in direzione cardinale
 * @param {number} bearing - Bearing in gradi
 * @returns {string} Direzione cardinale (N, NE, E, SE, S, SW, W, NW)
 */
export function bearingToCardinal(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Trova la fermata più vicina
 * @param {Object} userLocation - Posizione utente
 * @param {Array} allStops - Array di fermate
 * @returns {Object|null} Fermata più vicina con distanza e direzione
 */
export function findNearestStop(userLocation, allStops) {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return null;
  }

  if (userLocation.accuracy && userLocation.accuracy > 50) {
    return null;
  }

  let nearestStop = null;
  let minDistance = Infinity;

  for (const stop of allStops) {
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

  const bearing = calculateBearing(userLocation, {
    latitude: nearestStop.latitude,
    longitude: nearestStop.longitude
  });

  return {
    ...nearestStop,
    distance: Math.round(minDistance),
    bearing: Math.round(bearing),
    direction: bearingToCardinal(bearing)
  };
}

/**
 * Calcola statistiche delle fermate vicine
 * @param {Object} userLocation - Posizione utente
 * @param {Array} allStops - Array di fermate
 * @param {number} radius - Raggio in metri
 * @returns {Object} Statistiche
 */
export function calculateNearbyStopsStats(userLocation, allStops, radius = 200) {
  const visibleStops = getVisibleStops(userLocation, allStops, radius);
  
  if (visibleStops.length === 0) {
    return {
      count: 0,
      nearestDistance: null,
      averageDistance: null,
      totalStops: allStops.length
    };
  }

  const distances = visibleStops.map(stop => stop.distance);
  const nearestDistance = Math.min(...distances);
  const averageDistance = Math.round(distances.reduce((sum, dist) => sum + dist, 0) / distances.length);

  return {
    count: visibleStops.length,
    nearestDistance,
    averageDistance,
    totalStops: allStops.length,
    radius
  };
}

/**
 * Filtra fermate per zona/sottozona
 * @param {Array} allStops - Array di tutte le fermate
 * @param {number} zone - Numero zona
 * @param {string} subzone - Sottozona ('A' o 'B')
 * @returns {Array} Fermate della zona specificata
 */
export function filterStopsByZone(allStops, zone, subzone) {
  return allStops.filter(stop => {
    return stop.zone_id === zone && stop.plan === subzone;
  });
}

/**
 * Crea marker per una fermata
 * @param {Object} stop - Fermata
 * @param {Object} options - Opzioni marker
 * @returns {Object} Configurazione marker
 */
export function createStopMarker(stop, options = {}) {
  const defaultOptions = {
    color: '#FFD800', // Giallo Poste
    size: 'normal',
    showDistance: true,
    showDirection: false
  };

  const markerOptions = { ...defaultOptions, ...options };

  return {
    id: stop.id,
    coordinate: {
      latitude: stop.latitude,
      longitude: stop.longitude
    },
    title: stop.name,
    description: stop.description || '',
    pinColor: markerOptions.color,
    // Proprietà aggiuntive per rendering personalizzato
    stopData: {
      ...stop,
      markerOptions
    }
  };
}

/**
 * Crea array di marker per fermate visibili
 * @param {Array} visibleStops - Fermate visibili
 * @param {Object} options - Opzioni marker
 * @returns {Array} Array di marker
 */
export function createVisibleMarkers(visibleStops, options = {}) {
  return visibleStops.map(stop => createStopMarker(stop, options));
}

/**
 * Aggiorna marker esistenti con nuove posizioni
 * @param {Array} existingMarkers - Marker esistenti
 * @param {Array} visibleStops - Fermate visibili aggiornate
 * @param {Object} options - Opzioni marker
 * @returns {Array} Marker aggiornati
 */
export function updateMarkers(existingMarkers, visibleStops, options = {}) {
  const newMarkers = createVisibleMarkers(visibleStops, options);
  
  // Mantieni marker manuali se presenti
  const manualMarkers = existingMarkers.filter(marker => 
    marker.stopData && marker.stopData.isManual
  );

  return [...newMarkers, ...manualMarkers];
}
