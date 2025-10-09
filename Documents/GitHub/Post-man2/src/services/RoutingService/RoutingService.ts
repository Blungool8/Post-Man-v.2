/**
 * RoutingService - Servizio per calcolo percorsi su strada
 * Integrazione con OpenRouteService API (open source, gratuita)
 * 
 * Funzionalità:
 * - Calcolo percorsi tra waypoints seguendo strade reali
 * - Supporto multiple coordinate
 * - Conversione a GeoJSON
 */

import { LatLng } from '../KMLService/KMLParser';

export interface RoutingConfig {
  apiKey: string;
  provider: 'openrouteservice';
  profile?: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';
}

export interface RouteResponse {
  coordinates: LatLng[];
  distance: number; // metri
  duration: number; // secondi
  geometry: string; // encoded polyline
}

export interface RoutingError {
  code: string;
  message: string;
}

class RoutingService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openrouteservice.org/v2';
  private profile: string;
  private requestCache: Map<string, RouteResponse> = new Map();

  constructor(config: RoutingConfig) {
    this.apiKey = config.apiKey;
    this.profile = config.profile || 'driving-car';
    
    if (!this.apiKey || this.apiKey === 'YOUR_ORS_API_KEY') {
      console.warn('[RoutingService] ⚠️ API Key non configurata. Usa chiave di default (limitata)');
    }
  }

  /**
   * Calcola percorso tra array di waypoints seguendo le strade
   * @param waypoints - Array di coordinate [lng, lat]
   * @returns Percorso su strada con coordinate dettagliate
   */
  async calculateRoute(waypoints: number[][]): Promise<RouteResponse> {
    if (waypoints.length < 2) {
      throw new Error('Servono almeno 2 waypoints per calcolare un percorso');
    }

    // Limita a 50 waypoints (limite OpenRouteService)
    const limitedWaypoints = waypoints.length > 50 
      ? this.decimateWaypoints(waypoints, 50)
      : waypoints;

    console.log(`[RoutingService] Calcolo percorso con ${limitedWaypoints.length} waypoints...`);

    // Controlla cache
    const cacheKey = this.getCacheKey(limitedWaypoints);
    if (this.requestCache.has(cacheKey)) {
      console.log('[RoutingService] ✅ Percorso trovato in cache');
      return this.requestCache.get(cacheKey)!;
    }

    try {
      const url = `${this.baseUrl}/directions/${this.profile}/geojson`;
      
      const requestBody = {
        coordinates: limitedWaypoints,
        instructions: false,
        geometry: true,
        elevation: false
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouteService error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Estrai coordinate dal GeoJSON response
      const coordinates = this.extractCoordinatesFromGeoJSON(data);
      const properties = data.features?.[0]?.properties?.summary || {};

      const result: RouteResponse = {
        coordinates,
        distance: properties.distance || 0,
        duration: properties.duration || 0,
        geometry: JSON.stringify(data.features?.[0]?.geometry || {})
      };

      // Salva in cache
      this.requestCache.set(cacheKey, result);
      
      console.log(`[RoutingService] ✅ Percorso calcolato: ${coordinates.length} punti, ${(result.distance/1000).toFixed(2)} km`);
      
      return result;

    } catch (error) {
      console.error('[RoutingService] ❌ Errore calcolo percorso:', error);
      
      // Fallback: ritorna waypoints originali come linea retta
      console.warn('[RoutingService] ⚠️ Uso fallback (linea retta)');
      return this.fallbackStraightLine(waypoints);
    }
  }

  /**
   * Calcola percorso da array di LatLng
   */
  async calculateRouteFromLatLng(waypoints: LatLng[]): Promise<RouteResponse> {
    const coords = waypoints.map(w => [w.longitude, w.latitude]);
    return this.calculateRoute(coords);
  }

  /**
   * Decima waypoints per rispettare limite API
   */
  private decimateWaypoints(waypoints: number[][], maxCount: number): number[][] {
    if (waypoints.length <= maxCount) return waypoints;
    
    const result: number[][] = [waypoints[0]]; // Sempre primo punto
    const step = (waypoints.length - 1) / (maxCount - 1);
    
    for (let i = 1; i < maxCount - 1; i++) {
      const index = Math.round(i * step);
      result.push(waypoints[index]);
    }
    
    result.push(waypoints[waypoints.length - 1]); // Sempre ultimo punto
    
    console.log(`[RoutingService] Decimati waypoints: ${waypoints.length} → ${result.length}`);
    return result;
  }

  /**
   * Estrai coordinate da risposta GeoJSON OpenRouteService
   */
  private extractCoordinatesFromGeoJSON(geoJSON: any): LatLng[] {
    try {
      const geometry = geoJSON.features?.[0]?.geometry;
      
      if (!geometry || !geometry.coordinates) {
        throw new Error('GeoJSON invalido: mancano coordinate');
      }

      // OpenRouteService ritorna [lng, lat] - convertiamo a LatLng
      return geometry.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

    } catch (error) {
      console.error('[RoutingService] Errore estrazione coordinate:', error);
      return [];
    }
  }

  /**
   * Fallback: ritorna waypoints originali come linea retta
   */
  private fallbackStraightLine(waypoints: number[][]): RouteResponse {
    const coordinates: LatLng[] = waypoints.map(w => ({
      latitude: w[1],
      longitude: w[0]
    }));

    // Calcola distanza approssimativa
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += this.calculateDistance(coordinates[i], coordinates[i + 1]);
    }

    return {
      coordinates,
      distance: totalDistance,
      duration: 0,
      geometry: ''
    };
  }

  /**
   * Calcola distanza tra due punti (Haversine formula)
   * @returns distanza in metri
   */
  private calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371e3; // Raggio Terra in metri
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Genera chiave cache per waypoints
   */
  private getCacheKey(waypoints: number[][]): string {
    return waypoints
      .map(w => `${w[0].toFixed(5)},${w[1].toFixed(5)}`)
      .join('|');
  }

  /**
   * Pulisce cache
   */
  clearCache(): void {
    this.requestCache.clear();
    console.log('[RoutingService] Cache pulita');
  }

  /**
   * Ottiene informazioni sul servizio
   */
  getServiceInfo(): { provider: string; profile: string; hasApiKey: boolean } {
    return {
      provider: 'OpenRouteService',
      profile: this.profile,
      hasApiKey: !!this.apiKey && this.apiKey !== 'YOUR_ORS_API_KEY'
    };
  }
}

export default RoutingService;

