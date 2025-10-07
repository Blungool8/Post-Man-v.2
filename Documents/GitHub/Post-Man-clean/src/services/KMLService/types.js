/**
 * Type Definitions for KML Service - Post-Man v3
 * 
 * @fileoverview Definizioni dei tipi per il servizio KML
 */

/**
 * @typedef {Object} LatLng
 * @property {number} latitude - Latitudine
 * @property {number} longitude - Longitudine
 * @property {number} [altitude] - Altitudine (opzionale)
 */

/**
 * @typedef {Object} Route
 * @property {string} id - ID unico del percorso
 * @property {string} name - Nome del percorso
 * @property {LatLng[]} path - Array di coordinate del percorso
 * @property {number} pointCount - Numero di punti nel percorso
 * @property {string} [style] - Stile KML (opzionale)
 * @property {string} [description] - Descrizione (opzionale)
 * @property {RouteStats} [stats] - Statistiche del percorso (opzionale)
 */

/**
 * @typedef {Object} Stop
 * @property {string} id - ID unico della fermata
 * @property {string} name - Nome della fermata
 * @property {LatLng} coordinate - Coordinate della fermata
 * @property {string} [description] - Descrizione (opzionale)
 * @property {boolean} [isManual] - Se aggiunta manualmente
 */

/**
 * @typedef {Object} RouteStats
 * @property {number} pointCount - Numero di punti
 * @property {number} totalDistance - Distanza totale in metri
 * @property {Object} boundingBox - Bounding box del percorso
 * @property {number} boundingBox.north - Latitudine massima
 * @property {number} boundingBox.south - Latitudine minima
 * @property {number} boundingBox.east - Longitudine massima
 * @property {number} boundingBox.west - Longitudine minima
 * @property {LatLng} center - Centro del percorso
 */

/**
 * @typedef {Object} KMLMetadata
 * @property {string} name - Nome del documento
 * @property {string} description - Descrizione del documento
 * @property {number} [zone] - Numero zona (se estraibile dal nome)
 * @property {string} [subzone] - Sottozona (se estraibile dal nome)
 */

/**
 * @typedef {Object} ParsedKML
 * @property {KMLMetadata} metadata - Metadati del KML
 * @property {Route[]} routes - Array di percorsi
 * @property {Stop[]} stops - Array di fermate
 * @property {Object} rawDocument - Documento KML grezzo (per debug)
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Se il KML è valido
 * @property {string[]} errors - Array di errori
 * @property {string[]} warnings - Array di avvisi
 * @property {Object} stats - Statistiche di validazione
 * @property {number} stats.routeCount - Numero di percorsi
 * @property {number} stats.validRoutes - Numero di percorsi validi
 * @property {number} stats.totalPoints - Numero totale di punti
 * @property {number} stats.averagePointsPerRoute - Punti medi per percorso
 * @property {number} stats.stopCount - Numero di fermate
 */

/**
 * @typedef {Object} KMLLoadResult
 * @property {boolean} success - Se il caricamento è riuscito
 * @property {number} zone - Numero della zona
 * @property {string} subzone - Sottozona
 * @property {ParsedKML} [parsedKML] - KML parsato (se successo)
 * @property {ValidationResult} [validation] - Risultato validazione (se successo)
 * @property {Object} metadata - Metadati del caricamento
 * @property {number} metadata.loadTime - Tempo di caricamento in ms
 * @property {number} metadata.fileSize - Dimensione file in caratteri
 * @property {number} metadata.routeCount - Numero di percorsi
 * @property {number} metadata.totalPoints - Numero totale di punti
 * @property {boolean} metadata.isValid - Se il KML è valido
 * @property {string} [error] - Messaggio di errore (se fallimento)
 * @property {boolean} [metadata.error] - Se c'è stato un errore
 */

/**
 * @typedef {Object} KMLInfo
 * @property {number} zone - Numero della zona
 * @property {string} subzone - Sottozona
 * @property {string} filename - Nome del file
 * @property {boolean} exists - Se il file esiste
 * @property {number} [size] - Dimensione del file in bytes
 * @property {Date} [modified] - Data di modifica
 */

/**
 * @typedef {Object} CacheStats
 * @property {number} size - Numero di elementi in cache
 * @property {string[]} keys - Chiavi in cache
 * @property {number} loadingCount - Numero di caricamenti in corso
 * @property {string[]} loadingKeys - Chiavi in caricamento
 */

// Export per TypeScript/JSDoc
export default {
  // Types
  LatLng: 'Object',
  Route: 'Object',
  Stop: 'Object',
  RouteStats: 'Object',
  KMLMetadata: 'Object',
  ParsedKML: 'Object',
  ValidationResult: 'Object',
  KMLLoadResult: 'Object',
  KMLInfo: 'Object',
  CacheStats: 'Object'
};
