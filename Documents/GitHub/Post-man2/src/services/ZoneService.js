import { ZONE_DATA, MAP_CONFIG, CTD_INFO } from '../config/ZoneConfig';
import KMLService from './KMLService/KMLService';

class ZoneService {
  // Ottieni tutte le zone disponibili
  static getAllZones() {
    return ZONE_DATA;
  }

  // Ottieni una zona specifica per ID
  static getZoneById(zoneId) {
    console.log(`ZoneService.getZoneById chiamato con zoneId: ${zoneId} (tipo: ${typeof zoneId})`);
    console.log('ZONE_DATA disponibili:', ZONE_DATA.map(z => ({ id: z.id, name: z.name })));
    
    // Test con conversione di tipo
    const zoneIdNumber = Number(zoneId);
    const zoneIdString = String(zoneId);
    
    console.log(`Tentativo 1: zone.id === ${zoneId} (${typeof zoneId})`);
    let result = ZONE_DATA.find(zone => zone.id === zoneId);
    
    if (!result) {
      console.log(`Tentativo 2: zone.id === ${zoneIdNumber} (${typeof zoneIdNumber})`);
      result = ZONE_DATA.find(zone => zone.id === zoneIdNumber);
    }
    
    if (!result) {
      console.log(`Tentativo 3: zone.id === ${zoneIdString} (${typeof zoneIdString})`);
      result = ZONE_DATA.find(zone => zone.id === zoneIdString);
    }
    
    if (!result) {
      console.log(`Tentativo 4: zone.id == ${zoneId} (conversione automatica)`);
      result = ZONE_DATA.find(zone => zone.id == zoneId);
    }
    console.log(`Risultato getZoneById(${zoneId}):`, result ? 'TROVATO' : 'NON TROVATO');
    
    if (!result) {
      console.error(`ZONA ${zoneId} NON TROVATA! Zone disponibili:`, ZONE_DATA.map(z => z.id));
    }
    
    return result;
  }

  // Ottieni informazioni CTD
  static getCTDInfo() {
    return CTD_INFO;
  }

  // Carica mappa per zona e parte (A o B)
  static async loadZoneMap(zoneId, part) {
    console.log(`ZoneService.loadZoneMap chiamato con zoneId: ${zoneId}, part: ${part}`);
    
    const zone = this.getZoneById(zoneId);
    if (!zone) {
      console.error(`Zona ${zoneId} non trovata`);
      throw new Error(`Zona ${zoneId} non trovata`);
    }

    if (!['A', 'B'].includes(part)) {
      console.error(`Parte ${part} non valida`);
      throw new Error('Parte deve essere A o B');
    }

    // Solo Zona 9-B ha KML reale disponibile
    const hasRealKML = zoneId === 9 && part === 'B';
    
    if (hasRealKML) {
      try {
        // Carica KML reale per Zona 9-B
        console.log(`[ZoneService] Caricamento KML REALE per Zona ${zoneId} - Sottozona ${part}...`);
        const kmlData = await KMLService.loadKMLForZone(zoneId, part);
        
        const bounds = kmlData.parsed.bounds;
        const centerCoords = {
          latitude: (bounds.north + bounds.south) / 2,
          longitude: (bounds.east + bounds.west) / 2
        };
        
        console.log(`[ZoneService] KML REALE caricato con successo:`);
        console.log(`  - Routes: ${kmlData.parsed.routes.length}`);
        console.log(`  - Stops: ${kmlData.parsed.stops.length}`);
        console.log(`  - Total points: ${kmlData.parsed.totalPoints}`);
        console.log(`  - Center: ${centerCoords.latitude}, ${centerCoords.longitude}`);

        const result = {
          zoneId,
          part,
          kmlData: kmlData.parsed,
          validation: kmlData.validation,
          routes: kmlData.parsed.routes,
          stops: kmlData.parsed.stops,
          bounds: kmlData.parsed.bounds,
          municipalities: zone.municipalities,
          estimatedStops: kmlData.parsed.stops.length || zone.estimatedStops,
          centerCoordinates: centerCoords,
          metadata: kmlData.parsed.metadata,
          hasRealKML: true
        };
        
        console.log('[ZoneService] ✅ loadZoneMap con KML REALE completato con successo');
        return result;
        
      } catch (error) {
        console.error(`[ZoneService] ❌ Errore caricamento KML REALE:`, error);
        throw error; // Non fare fallback per Zone 9-B, deve funzionare
      }
    } else {
      // Per tutte le altre zone, usa dati di esempio
      console.log(`[ZoneService] Zona ${zoneId}-${part} non supportata per KML reale, usando dati di esempio`);
      
      const centerCoords = MAP_CONFIG.gpsConfig.getCenterCoordinates(zoneId);
      
      // Genera dati di esempio per la zona
      const exampleRoutes = this.generateExampleRoutes(zoneId, part, centerCoords);
      const exampleStops = this.generateExampleStops(zoneId, part, centerCoords);
      
      const result = {
        zoneId,
        part,
        routes: exampleRoutes,
        stops: exampleStops,
        municipalities: zone.municipalities,
        estimatedStops: zone.estimatedStops,
        centerCoordinates: centerCoords,
        bounds: this.calculateBoundsFromStops(exampleStops),
        hasRealKML: false,
        isExampleData: true
      };
      
      console.log(`[ZoneService] ✅ Dati di esempio generati per Zona ${zoneId}-${part}:`);
      console.log(`  - Routes: ${exampleRoutes.length}`);
      console.log(`  - Stops: ${exampleStops.length}`);
      console.log(`  - Center: ${centerCoords.latitude}, ${centerCoords.longitude}`);
      
      return result;
    }
  }

  // Ottieni fermate per zona dal KML
  static async getStopsForZone(zoneId, part) {
    console.log(`ZoneService.getStopsForZone chiamato con zoneId: ${zoneId}, part: ${part}`);
    
    const zone = this.getZoneById(zoneId);
    if (!zone) {
      console.error(`Zona ${zoneId} non trovata in getStopsForZone`);
      return [];
    }

    // Solo Zona 9-B ha KML reale disponibile
    const hasRealKML = zoneId === 9 && part === 'B';
    
    if (hasRealKML) {
      try {
        // Carica fermate dal KML usando KMLService
        console.log(`[ZoneService] Caricamento fermate REALE dal KML per Zona ${zoneId} - Sottozona ${part}...`);
        const stops = await KMLService.getStopsForZone(zoneId, part);
        
        // Arricchisci fermate con dati aggiuntivi
        const enrichedStops = stops.map((stop, index) => ({
          ...stop,
          address: `${stop.name}, ${zone.municipalities[0]}, PC`,
          status: 'pending',
          zone: zoneId,
          part: part
        }));

        console.log(`[ZoneService] ✅ ${enrichedStops.length} fermate REALE caricate dal KML per zona ${zoneId} parte ${part}`);
        return enrichedStops;
        
      } catch (error) {
        console.error(`[ZoneService] ❌ Errore caricamento fermate REALE:`, error);
        throw error; // Non fare fallback per Zone 9-B, deve funzionare
      }
    } else {
      // Per tutte le altre zone, usa fermate di esempio
      console.log(`[ZoneService] Zona ${zoneId}-${part} non supportata per fermate reali, usando fermate di esempio`);
      const centerCoords = MAP_CONFIG.gpsConfig.getCenterCoordinates(zoneId);
      
      const exampleStops = this.generateExampleStops(zoneId, part, centerCoords);
      
      console.log(`[ZoneService] ✅ ${exampleStops.length} fermate di esempio generate per zona ${zoneId} parte ${part}`);
      return exampleStops;
    }
  }

  // Trova fermate vicine alla posizione GPS
  static async findNearbyStops(userLocation, zoneId, part, radius = 1000) {
    const allStops = await this.getStopsForZone(zoneId, part);
    
    return allStops.filter(stop => {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        stop.latitude,
        stop.longitude
      );
      return distance <= radius;
    });
  }

  // Calcola distanza tra due punti (formula Haversine)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raggio della Terra in metri
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distanza in metri
  }

  // Ottimizza percorso per fermate (algoritmo semplice)
  static optimizeRoute(stops, startLocation) {
    if (!stops || stops.length === 0) return [];

    // Algoritmo Nearest Neighbor semplice
    const route = [];
    const unvisited = [...stops];
    let currentLocation = startLocation;

    while (unvisited.length > 0) {
      // Trova la fermata più vicina
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        unvisited[0].latitude,
        unvisited[0].longitude
      );

      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          unvisited[i].latitude,
          unvisited[i].longitude
        );
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      // Aggiungi la fermata più vicina al percorso
      const nearestStop = unvisited.splice(nearestIndex, 1)[0];
      route.push(nearestStop);
      currentLocation = {
        latitude: nearestStop.latitude,
        longitude: nearestStop.longitude
      };
    }

    return route;
  }

  // Salva configurazione zona nel database locale
  static async saveZoneConfiguration(zoneId, part, configuration) {
    // Implementazione per salvare nel database SQLite
    // Per ora simuliamo il salvataggio
    console.log(`Salvando configurazione per Zona ${zoneId} - Parte ${part}:`, configuration);
    return true;
  }

  // Carica configurazione zona dal database locale
  static async loadZoneConfiguration(zoneId, part) {
    // Implementazione per caricare dal database SQLite
    // Per ora simuliamo il caricamento
    console.log(`Caricando configurazione per Zona ${zoneId} - Parte ${part}`);
    return null;
  }

  // Verifica se una zona è disponibile per la parte specificata
  static isZonePartAvailable(zoneId, part) {
    const zone = this.getZoneById(zoneId);
    if (!zone) return false;
    
    return zone.deliveryDays.includes(part);
  }

  // Ottieni statistiche zona
  static getZoneStats(zoneId, part) {
    const zone = this.getZoneById(zoneId);
    if (!zone) return null;

    return {
      totalStops: zone.estimatedStops,
      completedStops: Math.floor(Math.random() * zone.estimatedStops),
      pendingStops: zone.estimatedStops - Math.floor(Math.random() * zone.estimatedStops),
      municipalities: zone.municipalities.length,
      workingDays: zone.workingDays.length
    };
  }

  // Genera percorsi di esempio per zone senza KML reale
  static generateExampleRoutes(zoneId, part, centerCoords) {
    const routes = [];
    const numRoutes = Math.floor(Math.random() * 3) + 2; // 2-4 percorsi
    
    for (let i = 1; i <= numRoutes; i++) {
      const route = {
        id: `route_${zoneId}_${part}_${i}`,
        name: `Percorso ${i} - Zona ${zoneId}${part}`,
        coordinates: this.generateRouteCoordinates(centerCoords, i),
        color: this.getRouteColor(i),
        description: `Percorso di esempio per Zona ${zoneId} - Sottozona ${part}`
      };
      routes.push(route);
    }
    
    return routes;
  }

  // Genera fermate di esempio per zone senza KML reale
  static generateExampleStops(zoneId, part, centerCoords) {
    const stops = [];
    const numStops = Math.floor(Math.random() * 8) + 5; // 5-12 fermate
    
    for (let i = 1; i <= numStops; i++) {
      const stop = {
        id: `stop_${zoneId}_${part}_${i}`,
        name: `Fermata ${i}`,
        latitude: centerCoords.latitude + (Math.random() - 0.5) * 0.01,
        longitude: centerCoords.longitude + (Math.random() - 0.5) * 0.01,
        address: `Via di esempio ${i}, ${zoneId}`,
        status: 'pending',
        zone: zoneId,
        part: part
      };
      stops.push(stop);
    }
    
    return stops;
  }

  // Genera coordinate per un percorso di esempio
  static generateRouteCoordinates(centerCoords, routeIndex) {
    const coordinates = [];
    const numPoints = Math.floor(Math.random() * 5) + 3; // 3-7 punti
    
    for (let i = 0; i < numPoints; i++) {
      const lat = centerCoords.latitude + (Math.random() - 0.5) * 0.005;
      const lng = centerCoords.longitude + (Math.random() - 0.5) * 0.005;
      coordinates.push([lng, lat, 0]);
    }
    
    return coordinates;
  }

  // Ottieni colore per percorso
  static getRouteColor(routeIndex) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    return colors[(routeIndex - 1) % colors.length];
  }

  // Calcola bounds dalle fermate
  static calculateBoundsFromStops(stops) {
    if (!stops || stops.length === 0) {
      return {
        north: 45.1,
        south: 45.0,
        east: 9.5,
        west: 9.4
      };
    }

    const lats = stops.map(stop => stop.latitude);
    const lngs = stops.map(stop => stop.longitude);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }
}

export default ZoneService;
