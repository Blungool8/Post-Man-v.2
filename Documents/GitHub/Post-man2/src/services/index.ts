/**
 * Export centrale servizi
 * Semplifica import in tutta l'applicazione
 */

// KML Services
export { default as KMLParser } from './KMLService/KMLParser';
export { default as KMLLoader } from './KMLService/KMLLoader';
export { default as KMLService } from './KMLService/KMLService';
export { default as KMLToGeoJSON } from './KMLService/KMLToGeoJSON';
export type { ParsedKML, RouteSegment, Stop, LatLng } from './KMLService/KMLParser';
export type { GeoJSONFeature, GeoJSONFeatureCollection, GeoJSONGeometry } from './KMLService/KMLToGeoJSON';

// Routing Service
export { default as RoutingService } from './RoutingService/RoutingService';
export type { RoutingConfig, RouteResponse, RoutingError } from './RoutingService/RoutingService';

// Database Service
export { default as SupabaseService } from './DatabaseService/SupabaseService';
export type { DatabaseConfig, SavedRoute, UserPreferences } from './DatabaseService/SupabaseService';

