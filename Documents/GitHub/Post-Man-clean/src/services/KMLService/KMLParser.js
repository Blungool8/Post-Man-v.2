/**
 * KML Parser Service - Post-Man v3
 * Parsing e validazione dei file KML usando fast-xml-parser
 * 
 * @fileoverview Servizio per parsare file KML e estrarre percorsi e fermate
 */

import { XMLParser } from 'fast-xml-parser';

/**
 * Parser XML ottimizzato per file KML
 */
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
  parseTagValue: false, // Mantiene le coordinate come stringhe per parsing manuale
});

/**
 * Parsa una stringa KML e estrae percorsi e metadati
 * @param {string} kmlContent - Contenuto XML del file KML
 * @returns {Promise<ParsedKML>} Oggetto con percorsi parsati
 */
export function parseKML(kmlContent) {
  try {
    if (!kmlContent || typeof kmlContent !== 'string') {
      throw new Error('Contenuto KML non valido');
    }

    // Parse del documento XML
    const parsedXML = xmlParser.parse(kmlContent);
    
    if (!parsedXML.kml || !parsedXML.kml.Document) {
      throw new Error('Struttura KML non valida: manca Document');
    }

    const document = parsedXML.kml.Document;
    
    // Estrae metadati del documento
    const metadata = {
      name: document.name || 'Percorso Sconosciuto',
      description: document.description || '',
      zone: null,
      subzone: null
    };

    // Estrae zona e sottozona dal nome se disponibile
    if (metadata.name) {
      const zoneMatch = metadata.name.match(/Zona\s*(\d+)/i);
      const subzoneMatch = metadata.name.match(/Sottozona\s*([AB])/i);
      
      if (zoneMatch) metadata.zone = parseInt(zoneMatch[1], 10);
      if (subzoneMatch) metadata.subzone = subzoneMatch[1];
    }

    // Estrae percorsi (LineString)
    const routes = extractRoutes(document);
    
    // Estrae fermate (Point) - per ora vuoto, verrà implementato in v3.1
    const stops = extractStops(document);

    return {
      metadata,
      routes,
      stops,
      rawDocument: document // Per debug e analisi future
    };

  } catch (error) {
    console.error('Errore parsing KML:', error);
    throw new Error(`Errore parsing KML: ${error.message}`);
  }
}

/**
 * Estrae tutti i percorsi (LineString) dal documento KML
 * @param {Object} document - Documento KML parsato
 * @returns {Array<Route>} Array di percorsi
 */
function extractRoutes(document) {
  const routes = [];
  
  try {
    // Cerca Placemark con LineString
    const placemarks = findPlacemarks(document);
    
    for (const placemark of placemarks) {
      if (placemark.LineString && placemark.LineString.coordinates) {
        const route = parseRoute(placemark);
        if (route) {
          routes.push(route);
        }
      }
    }
    
    return routes;
  } catch (error) {
    console.error('Errore estrazione percorsi:', error);
    return [];
  }
}

/**
 * Estrae fermate (Point) dal documento KML
 * @param {Object} document - Documento KML parsato
 * @returns {Array<Stop>} Array di fermate
 */
function extractStops(document) {
  // Per v3, le fermate non sono ancora presenti nei file KML
  // Questa funzione è preparata per future estensioni
  return [];
}

/**
 * Trova tutti i Placemark nel documento KML
 * @param {Object} document - Documento KML parsato
 * @returns {Array} Array di Placemark
 */
function findPlacemarks(document) {
  const placemarks = [];
  
  // Cerca in Folder
  if (document.Folder) {
    if (Array.isArray(document.Folder.Placemark)) {
      placemarks.push(...document.Folder.Placemark);
    } else if (document.Folder.Placemark) {
      placemarks.push(document.Folder.Placemark);
    }
  }
  
  // Cerca direttamente in Document
  if (document.Placemark) {
    if (Array.isArray(document.Placemark)) {
      placemarks.push(...document.Placemark);
    } else {
      placemarks.push(document.Placemark);
    }
  }
  
  return placemarks;
}

/**
 * Parsa un singolo percorso (Placemark con LineString)
 * @param {Object} placemark - Placemark KML
 * @returns {Route|null} Percorso parsato
 */
function parseRoute(placemark) {
  try {
    const name = placemark.name || 'Percorso Sconosciuto';
    const coordinates = placemark.LineString.coordinates;
    
    if (!coordinates) {
      console.warn('Placemark senza coordinate:', placemark);
      return null;
    }
    
    // Parsa le coordinate
    const path = parseCoordinates(coordinates);
    
    if (!path || path.length < 2) {
      console.warn('Percorso con meno di 2 punti:', name);
      return null;
    }
    
    return {
      id: generateRouteId(name, path.length),
      name,
      path,
      pointCount: path.length,
      style: placemark.styleUrl || null,
      description: placemark.description || null
    };
    
  } catch (error) {
    console.error('Errore parsing singolo percorso:', error);
    return null;
  }
}

/**
 * Parsa stringa di coordinate KML in array di punti
 * @param {string} coordinatesString - Stringa coordinate KML
 * @returns {Array<{latitude: number, longitude: number, altitude?: number}>} Array di punti
 */
function parseCoordinates(coordinatesString) {
  try {
    if (!coordinatesString || typeof coordinatesString !== 'string') {
      return [];
    }
    
    // Split per linee e poi per virgole
    const lines = coordinatesString.trim().split(/\s+/);
    const points = [];
    
    for (const line of lines) {
      const coords = line.split(',');
      
      if (coords.length >= 2) {
        const longitude = parseFloat(coords[0]);
        const latitude = parseFloat(coords[1]);
        const altitude = coords.length >= 3 ? parseFloat(coords[2]) : 0;
        
        // Validazione coordinate
        if (isValidCoordinate(latitude, longitude)) {
          points.push({
            latitude,
            longitude,
            altitude
          });
        }
      }
    }
    
    return points;
  } catch (error) {
    console.error('Errore parsing coordinate:', error);
    return [];
  }
}

/**
 * Valida se le coordinate sono valide
 * @param {number} latitude - Latitudine
 * @param {number} longitude - Longitudine
 * @returns {boolean} True se valide
 */
function isValidCoordinate(latitude, longitude) {
  return (
    !isNaN(latitude) && !isNaN(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

/**
 * Genera un ID unico per un percorso
 * @param {string} name - Nome del percorso
 * @param {number} pointCount - Numero di punti
 * @returns {string} ID unico
 */
function generateRouteId(name, pointCount) {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const timestamp = Date.now();
  return `${cleanName}_${pointCount}_${timestamp}`;
}

/**
 * Calcola le statistiche di un percorso parsato
 * @param {Route} route - Percorso
 * @returns {Object} Statistiche del percorso
 */
export function calculateRouteStats(route) {
  if (!route || !route.path || route.path.length < 2) {
    return null;
  }
  
  const points = route.path;
  let totalDistance = 0;
  
  // Calcola distanza totale (approssimativa)
  for (let i = 1; i < points.length; i++) {
    const dist = haversineDistance(points[i-1], points[i]);
    totalDistance += dist;
  }
  
  // Trova bounding box
  const lats = points.map(p => p.latitude);
  const lngs = points.map(p => p.longitude);
  
  return {
    pointCount: points.length,
    totalDistance: Math.round(totalDistance),
    boundingBox: {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    },
    center: {
      latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
      longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2
    }
  };
}

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
