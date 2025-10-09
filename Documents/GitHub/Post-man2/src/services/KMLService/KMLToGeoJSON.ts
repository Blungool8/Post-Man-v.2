/**
 * KMLToGeoJSON - Converte dati KML in formato GeoJSON
 * Supporta LineString e Point per compatibilità con servizi routing
 */

import { ParsedKML, LatLng, RouteSegment, Stop } from './KMLParser';

export interface GeoJSONGeometry {
  type: 'Point' | 'LineString' | 'MultiLineString';
  coordinates: number[] | number[][] | number[][][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJSONGeometry;
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

class KMLToGeoJSON {
  /**
   * Converte ParsedKML completo in GeoJSON FeatureCollection
   */
  static convert(parsedKML: ParsedKML): GeoJSONFeatureCollection {
    console.log('[KMLToGeoJSON] Conversione KML → GeoJSON...');
    
    const features: GeoJSONFeature[] = [];
    
    // Converti routes (LineString)
    parsedKML.routes.forEach((route, index) => {
      const feature = this.routeToGeoJSON(route, index);
      features.push(feature);
    });
    
    // Converti stops (Point)
    parsedKML.stops.forEach((stop) => {
      const feature = this.stopToGeoJSON(stop);
      features.push(feature);
    });
    
    console.log(`[KMLToGeoJSON] ✅ Convertite ${features.length} features (${parsedKML.routes.length} routes, ${parsedKML.stops.length} stops)`);
    
    return {
      type: 'FeatureCollection',
      features
    };
  }
  
  /**
   * Converte singolo RouteSegment in GeoJSON Feature (LineString)
   */
  static routeToGeoJSON(route: RouteSegment, index: number): GeoJSONFeature {
    // GeoJSON usa [lng, lat] invece di {lat, lng}
    const coordinates: number[][] = route.coordinates.map(coord => [
      coord.longitude,
      coord.latitude
    ]);
    
    return {
      type: 'Feature',
      id: `route_${index}`,
      geometry: {
        type: 'LineString',
        coordinates
      },
      properties: {
        name: route.name,
        type: 'route',
        pointCount: coordinates.length
      }
    };
  }
  
  /**
   * Converte singolo Stop in GeoJSON Feature (Point)
   */
  static stopToGeoJSON(stop: Stop): GeoJSONFeature {
    return {
      type: 'Feature',
      id: stop.id,
      geometry: {
        type: 'Point',
        coordinates: [stop.longitude, stop.latitude]
      },
      properties: {
        name: stop.name,
        description: stop.description || '',
        type: 'stop'
      }
    };
  }
  
  /**
   * Estrae solo le coordinate da un percorso per routing
   * Ritorna array di [lng, lat]
   */
  static extractCoordinatesForRouting(route: RouteSegment): number[][] {
    return route.coordinates.map(coord => [
      coord.longitude,
      coord.latitude
    ]);
  }
  
  /**
   * Converte coordinate LatLng in formato GeoJSON [lng, lat]
   */
  static latLngToGeoJSON(coords: LatLng[]): number[][] {
    return coords.map(c => [c.longitude, c.latitude]);
  }
  
  /**
   * Converte coordinate GeoJSON [lng, lat] in formato LatLng
   */
  static geoJSONToLatLng(coords: number[][]): LatLng[] {
    return coords.map(c => ({
      latitude: c[1],
      longitude: c[0]
    }));
  }
}

export default KMLToGeoJSON;


