/**
 * KMLParser - Parser XML per file KML
 * Milestone M1 - Task T11
 * 
 * Estrae:
 * - LineString (percorsi/route)
 * - Placemark con Point (fermate/stops)
 * - Metadata del documento
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  name: string;
  coordinates: LatLng[];
}

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface ParsedKML {
  metadata: {
    documentName: string;
    description: string;
    source: string;
    parsedAt: string;
  };
  routes: RouteSegment[];
  stops: Stop[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  totalPoints: number;
}

class KMLParser {
  /**
   * Parsa contenuto KML e estrae route e stops
   * Usa parsing basato su regex (compatibile React Native)
   */
  static parse(kmlContent: string, fileName: string): ParsedKML {
    console.log('[KMLParser] Inizio parsing KML...');
    
    try {
      // Estrai metadata
      const metadata = this.extractMetadataRegex(kmlContent, fileName);
      console.log('[KMLParser] Metadata estratto:', metadata);
      
      // Estrai routes (LineString)
      const routes = this.extractRoutesRegex(kmlContent);
      console.log(`[KMLParser] ${routes.length} percorsi estratti`);
      
      // Estrai stops (Placemark con Point)
      const stops = this.extractStopsRegex(kmlContent);
      console.log(`[KMLParser] ${stops.length} fermate estratte`);
      
      // Calcola bounds
      const allCoords = routes.flatMap(r => r.coordinates);
      const bounds = this.calculateBounds(allCoords);
      
      const totalPoints = allCoords.length;
      console.log(`[KMLParser] ✅ Parsing completato: ${totalPoints} punti totali`);
      
      return {
        metadata,
        routes,
        stops,
        bounds,
        totalPoints
      };
      
    } catch (error) {
      console.error('[KMLParser] ❌ Errore parsing:', error);
      throw new Error(`Errore parsing KML: ${(error as Error).message}`);
    }
  }
  
  /**
   * Estrai metadata dal documento KML usando regex
   */
  private static extractMetadataRegex(kmlContent: string, fileName: string) {
    // Estrai nome del documento
    const nameMatch = kmlContent.match(/<Document>[\s\S]*?<name>(.*?)<\/name>/);
    const documentName = nameMatch ? nameMatch[1].trim() : 'Unnamed';
    
    // Estrai descrizione
    const descMatch = kmlContent.match(/<Document>[\s\S]*?<description>(.*?)<\/description>/);
    const description = descMatch ? descMatch[1].trim() : '';
    
    return {
      documentName,
      description,
      source: fileName,
      parsedAt: new Date().toISOString()
    };
  }
  
  /**
   * Estrai percorsi (LineString) dal KML usando regex
   */
  private static extractRoutesRegex(kmlContent: string): RouteSegment[] {
    const routes: RouteSegment[] = [];
    
    // Regex per trovare tutti i Placemark con LineString
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let placemarkMatch;
    let routeIndex = 0;
    
    while ((placemarkMatch = placemarkRegex.exec(kmlContent)) !== null) {
      const placemarkContent = placemarkMatch[1];
      
      // Controlla se contiene LineString
      if (placemarkContent.includes('<LineString>')) {
        // Estrai nome
        const nameMatch = placemarkContent.match(/<name>(.*?)<\/name>/);
        const name = nameMatch ? nameMatch[1].trim() : `Percorso ${routeIndex + 1}`;
        
        // Estrai coordinate
        const coordsMatch = placemarkContent.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
        if (coordsMatch) {
          const coordinates = this.parseCoordinates(coordsMatch[1]);
          
          if (coordinates.length > 0) {
            routes.push({ name, coordinates });
            console.log(`[KMLParser] Route "${name}": ${coordinates.length} punti`);
            routeIndex++;
          }
        }
      }
    }
    
    return routes;
  }
  
  /**
   * Estrai fermate (Placemark con Point) dal KML usando regex
   */
  private static extractStopsRegex(kmlContent: string): Stop[] {
    const stops: Stop[] = [];
    
    // Regex per trovare tutti i Placemark con Point
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let placemarkMatch;
    let stopIndex = 0;
    
    while ((placemarkMatch = placemarkRegex.exec(kmlContent)) !== null) {
      const placemarkContent = placemarkMatch[1];
      
      // Controlla se contiene Point (ma non LineString)
      if (placemarkContent.includes('<Point>') && !placemarkContent.includes('<LineString>')) {
        // Estrai nome
        const nameMatch = placemarkContent.match(/<name>(.*?)<\/name>/);
        const name = nameMatch ? nameMatch[1].trim() : `Fermata ${stopIndex + 1}`;
        
        // Estrai descrizione
        const descMatch = placemarkContent.match(/<description>(.*?)<\/description>/);
        const description = descMatch ? descMatch[1].trim() : undefined;
        
        // Estrai coordinate
        const coordsMatch = placemarkContent.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
        if (coordsMatch) {
          const coords = this.parseCoordinates(coordsMatch[1]);
          
          if (coords.length > 0) {
            stops.push({
              id: `stop_${stopIndex + 1}`,
              name,
              latitude: coords[0].latitude,
              longitude: coords[0].longitude,
              description
            });
            stopIndex++;
          }
        }
      }
    }
    
    return stops;
  }
  
  /**
   * Parsa stringa coordinate KML
   * Formato: "lon,lat,alt lon,lat,alt ..."
   */
  private static parseCoordinates(coordsText: string): LatLng[] {
    const coordinates: LatLng[] = [];
    
    // Rimuovi whitespace extra e split per spazi/newline
    const coordPairs = coordsText
      .trim()
      .split(/\s+/)
      .filter(s => s.length > 0);
    
    for (const pair of coordPairs) {
      const parts = pair.split(',');
      
      if (parts.length >= 2) {
        const longitude = parseFloat(parts[0]);
        const latitude = parseFloat(parts[1]);
        
        // Valida coordinate
        if (!isNaN(latitude) && !isNaN(longitude) &&
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180) {
          coordinates.push({ latitude, longitude });
        } else {
          console.warn(`[KMLParser] Coordinata invalida ignorata: ${pair}`);
        }
      }
    }
    
    return coordinates;
  }
  
  /**
   * Calcola bounds (limiti geografici) da un array di coordinate
   */
  private static calculateBounds(coordinates: LatLng[]) {
    if (coordinates.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }
    
    let north = -90;
    let south = 90;
    let east = -180;
    let west = 180;
    
    for (const coord of coordinates) {
      if (coord.latitude > north) north = coord.latitude;
      if (coord.latitude < south) south = coord.latitude;
      if (coord.longitude > east) east = coord.longitude;
      if (coord.longitude < west) west = coord.longitude;
    }
    
    return { north, south, east, west };
  }
  
  /**
   * Semplifica polyline usando Douglas-Peucker algorithm
   * @param points - Array di coordinate
   * @param tolerance - Tolleranza in gradi (default 0.00005 ≈ 5 metri)
   */
  static simplifyPolyline(points: LatLng[], tolerance: number = 0.00005): LatLng[] {
    if (points.length <= 2) return points;
    
    console.log(`[KMLParser] Semplificazione polyline: ${points.length} punti...`);
    
    const simplified = this.douglasPeucker(points, tolerance);
    
    console.log(`[KMLParser] ✅ Polyline semplificata: ${simplified.length} punti (riduzione ${Math.round((1 - simplified.length/points.length) * 100)}%)`);
    
    return simplified;
  }
  
  /**
   * Algoritmo Douglas-Peucker per semplificazione polyline
   */
  private static douglasPeucker(points: LatLng[], tolerance: number): LatLng[] {
    if (points.length <= 2) return points;
    
    let maxDistance = 0;
    let index = 0;
    const end = points.length - 1;
    
    // Trova punto più distante dalla linea
    for (let i = 1; i < end; i++) {
      const distance = this.perpendicularDistance(
        points[i],
        points[0],
        points[end]
      );
      
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }
    
    // Se max distanza > tolerance, ricorsione
    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, index + 1), tolerance);
      const right = this.douglasPeucker(points.slice(index), tolerance);
      
      return left.slice(0, -1).concat(right);
    } else {
      return [points[0], points[end]];
    }
  }
  
  /**
   * Calcola distanza perpendicolare di un punto da una linea
   */
  private static perpendicularDistance(point: LatLng, lineStart: LatLng, lineEnd: LatLng): number {
    const dx = lineEnd.longitude - lineStart.longitude;
    const dy = lineEnd.latitude - lineStart.latitude;
    
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return 0;
    
    const u = ((point.longitude - lineStart.longitude) * dx +
               (point.latitude - lineStart.latitude) * dy) / (mag * mag);
    
    const closestPoint = {
      latitude: lineStart.latitude + u * dy,
      longitude: lineStart.longitude + u * dx
    };
    
    const distLat = point.latitude - closestPoint.latitude;
    const distLng = point.longitude - closestPoint.longitude;
    
    return Math.sqrt(distLat * distLat + distLng * distLng);
  }
}

export default KMLParser;

