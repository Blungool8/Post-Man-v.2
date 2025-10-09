/**
 * KMLValidator - Valida file KML secondo requisiti v3
 * Milestone M1 - Task T12
 * 
 * Regole di validazione (da PRD):
 * - Almeno 1 LineString per il percorso
 * - Coordinate valide (lat: -90/+90, lon: -180/+180)
 * - Fermate (Placemark con Point) opzionali ma consigliate
 * - Dimensione file ≤ 5 MB
 */

import { ParsedKML } from './KMLParser';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    fileSize: number;
    routeCount: number;
    stopCount: number;
    totalPoints: number;
    hasStops: boolean;
  };
}

class KMLValidator {
  // Costanti di validazione
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  private static readonly MIN_ROUTES = 1;
  private static readonly MAX_POINTS_WARNING = 5000;
  
  /**
   * Valida file KML caricato
   */
  static validate(kmlContent: string, parsedData: ParsedKML): ValidationResult {
    console.log('[KMLValidator] Inizio validazione KML...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. Verifica dimensione file
    const fileSize = kmlContent.length;
    if (fileSize > this.MAX_FILE_SIZE) {
      errors.push(`File troppo grande: ${(fileSize / 1024 / 1024).toFixed(2)} MB (max 5 MB)`);
    } else if (fileSize > this.MAX_FILE_SIZE * 0.8) {
      warnings.push(`File vicino al limite: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // 2. Verifica presenza percorsi (LineString)
    if (parsedData.routes.length < this.MIN_ROUTES) {
      errors.push('Nessun percorso (LineString) trovato nel file KML');
    }
    
    // 3. Verifica numero di punti
    if (parsedData.totalPoints === 0) {
      errors.push('Nessuna coordinata trovata nei percorsi');
    } else if (parsedData.totalPoints > this.MAX_POINTS_WARNING) {
      warnings.push(
        `Molti punti nel percorso (${parsedData.totalPoints}). ` +
        `Consigliata semplificazione per performance.`
      );
    }
    
    // 4. Verifica coordinate valide
    const invalidCoords = this.validateCoordinates(parsedData);
    if (invalidCoords.length > 0) {
      errors.push(`Trovate ${invalidCoords.length} coordinate invalide`);
    }
    
    // 5. Verifica fermate (opzionali ma consigliate)
    if (parsedData.stops.length === 0) {
      warnings.push('Nessuna fermata (Placemark con Point) trovata. Consigliato aggiungere fermate per navigazione ottimale.');
    }
    
    // 6. Verifica bounds
    const boundsValid = this.validateBounds(parsedData.bounds);
    if (!boundsValid) {
      errors.push('Bounds geografici invalidi');
    }
    
    // 7. Verifica metadata
    if (!parsedData.metadata.documentName || parsedData.metadata.documentName === 'Unnamed') {
      warnings.push('Documento KML senza nome. Consigliato aggiungere <name> nel Document.');
    }
    
    const valid = errors.length === 0;
    
    const result: ValidationResult = {
      valid,
      errors,
      warnings,
      stats: {
        fileSize,
        routeCount: parsedData.routes.length,
        stopCount: parsedData.stops.length,
        totalPoints: parsedData.totalPoints,
        hasStops: parsedData.stops.length > 0
      }
    };
    
    if (valid) {
      console.log('[KMLValidator] ✅ Validazione passata');
    } else {
      console.error('[KMLValidator] ❌ Validazione fallita:', errors);
    }
    
    if (warnings.length > 0) {
      console.warn('[KMLValidator] ⚠️ Warnings:', warnings);
    }
    
    return result;
  }
  
  /**
   * Valida tutte le coordinate nei percorsi
   */
  private static validateCoordinates(parsedData: ParsedKML): string[] {
    const invalid: string[] = [];
    
    parsedData.routes.forEach((route, routeIdx) => {
      route.coordinates.forEach((coord, coordIdx) => {
        if (!this.isValidLatitude(coord.latitude)) {
          invalid.push(`Route ${routeIdx}, coord ${coordIdx}: lat ${coord.latitude} invalida`);
        }
        if (!this.isValidLongitude(coord.longitude)) {
          invalid.push(`Route ${routeIdx}, coord ${coordIdx}: lon ${coord.longitude} invalida`);
        }
      });
    });
    
    parsedData.stops.forEach((stop, stopIdx) => {
      if (!this.isValidLatitude(stop.latitude)) {
        invalid.push(`Stop ${stopIdx} "${stop.name}": lat ${stop.latitude} invalida`);
      }
      if (!this.isValidLongitude(stop.longitude)) {
        invalid.push(`Stop ${stopIdx} "${stop.name}": lon ${stop.longitude} invalida`);
      }
    });
    
    return invalid;
  }
  
  /**
   * Valida latitudine (-90 a +90)
   */
  private static isValidLatitude(lat: number): boolean {
    return !isNaN(lat) && lat >= -90 && lat <= 90;
  }
  
  /**
   * Valida longitudine (-180 a +180)
   */
  private static isValidLongitude(lon: number): boolean {
    return !isNaN(lon) && lon >= -180 && lon <= 180;
  }
  
  /**
   * Valida bounds geografici
   */
  private static validateBounds(bounds: ParsedKML['bounds']): boolean {
    return (
      this.isValidLatitude(bounds.north) &&
      this.isValidLatitude(bounds.south) &&
      this.isValidLongitude(bounds.east) &&
      this.isValidLongitude(bounds.west) &&
      bounds.north >= bounds.south &&
      bounds.east >= bounds.west
    );
  }
  
  /**
   * Genera report di validazione human-readable
   */
  static generateReport(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push('=== KML Validation Report ===\n');
    
    // Status
    if (result.valid) {
      lines.push('✅ Status: VALID\n');
    } else {
      lines.push('❌ Status: INVALID\n');
    }
    
    // Stats
    lines.push('📊 Statistics:');
    lines.push(`  • File size: ${(result.stats.fileSize / 1024).toFixed(2)} KB`);
    lines.push(`  • Routes: ${result.stats.routeCount}`);
    lines.push(`  • Stops: ${result.stats.stopCount}`);
    lines.push(`  • Total points: ${result.stats.totalPoints}`);
    lines.push('');
    
    // Errors
    if (result.errors.length > 0) {
      lines.push('❌ Errors:');
      result.errors.forEach(err => lines.push(`  • ${err}`));
      lines.push('');
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      lines.push('⚠️ Warnings:');
      result.warnings.forEach(warn => lines.push(`  • ${warn}`));
      lines.push('');
    }
    
    lines.push('=============================');
    
    return lines.join('\n');
  }
}

export default KMLValidator;

