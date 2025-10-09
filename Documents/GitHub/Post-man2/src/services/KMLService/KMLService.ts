/**
 * KMLService - Servizio unificato per gestione KML
 * Milestone M1 - Integrazione completa
 * 
 * Orchestra KMLLoader, KMLParser e KMLValidator per fornire
 * un'interfaccia semplice al resto dell'app
 */

import KMLLoaderSimple from './KMLLoaderSimple';
import type { KMLLoadResult } from './KMLLoaderSimple';
import KMLParser from './KMLParser';
import type { ParsedKML, RouteSegment, Stop } from './KMLParser';
import KMLValidator from './KMLValidator';
import type { ValidationResult } from './KMLValidator';

export interface KMLData {
  parsed: ParsedKML;
  validation: ValidationResult;
  loadInfo: KMLLoadResult;
}

class KMLService {
  // Cache per evitare di ricaricare lo stesso file
  private static cache = new Map<string, KMLData>();
  
  /**
   * Carica, parsa e valida file KML per zona/sottozona
   * @param zoneId - ID della zona (es. 9)
   * @param part - Sottozona A o B
   * @returns Dati KML parsati e validati
   */
  static async loadKMLForZone(zoneId: number, part: 'A' | 'B'): Promise<KMLData> {
    const cacheKey = `zone_${zoneId}_${part}`;
    
    // Controlla cache
    if (this.cache.has(cacheKey)) {
      console.log(`[KMLService] ✅ Usando cache per ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }
    
    console.log(`[KMLService] Caricamento KML per Zona ${zoneId} - Sottozona ${part}...`);
    
    try {
      // Step 1: Carica file KML
      const loadResult = await KMLLoaderSimple.loadFromAssets(zoneId, part);
      console.log(`[KMLService] Step 1/3: File caricato (${loadResult.size} bytes)`);
      
      // Step 2: Parsa contenuto
      const parsed = KMLParser.parse(loadResult.content, loadResult.fileName);
      console.log(`[KMLService] Step 2/3: Parsing completato (${parsed.routes.length} routes, ${parsed.stops.length} stops)`);
      
      // Step 3: Valida
      const validation = KMLValidator.validate(loadResult.content, parsed);
      console.log(`[KMLService] Step 3/3: Validazione ${validation.valid ? 'passata' : 'fallita'}`);
      
      if (!validation.valid) {
        console.error('[KMLService] Validazione fallita:', validation.errors);
        // Log del report completo
        console.log(KMLValidator.generateReport(validation));
        throw new Error(`KML non valido: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('[KMLService] Warnings di validazione:', validation.warnings);
      }
      
      const kmlData: KMLData = {
        parsed,
        validation,
        loadInfo: loadResult
      };
      
      // Salva in cache
      this.cache.set(cacheKey, kmlData);
      
      console.log(`[KMLService] ✅ KML caricato e validato con successo per Zona ${zoneId} - Sottozona ${part}`);
      
      return kmlData;
      
    } catch (error) {
      console.error(`[KMLService] ❌ Errore caricamento KML:`, error);
      throw new Error(`Impossibile caricare KML per Zona ${zoneId} - Sottozona ${part}: ${(error as Error).message}`);
    }
  }
  
  /**
   * Ottieni solo i percorsi (routes) per una zona
   */
  static async getRoutesForZone(zoneId: number, part: 'A' | 'B'): Promise<RouteSegment[]> {
    const kmlData = await this.loadKMLForZone(zoneId, part);
    return kmlData.parsed.routes;
  }
  
  /**
   * Ottieni solo le fermate (stops) per una zona
   */
  static async getStopsForZone(zoneId: number, part: 'A' | 'B'): Promise<Stop[]> {
    const kmlData = await this.loadKMLForZone(zoneId, part);
    return kmlData.parsed.stops;
  }
  
  /**
   * Ottieni routes semplificate (per performance)
   * @param threshold - Numero di punti oltre il quale semplificare (default 5000)
   * @param tolerance - Tolleranza semplificazione in gradi (default 0.00005)
   */
  static async getSimplifiedRoutesForZone(
    zoneId: number, 
    part: 'A' | 'B',
    threshold: number = 5000,
    tolerance: number = 0.00005
  ): Promise<RouteSegment[]> {
    const kmlData = await this.loadKMLForZone(zoneId, part);
    
    return kmlData.parsed.routes.map(route => {
      if (route.coordinates.length > threshold) {
        console.log(`[KMLService] Semplificazione route "${route.name}" (${route.coordinates.length} -> ...)`)
;
        const simplified = KMLParser.simplifyPolyline(route.coordinates, tolerance);
        return {
          ...route,
          coordinates: simplified
        };
      }
      return route;
    });
  }
  
  /**
   * Ottieni bounds (limiti geografici) per centrare mappa
   */
  static async getBoundsForZone(zoneId: number, part: 'A' | 'B') {
    const kmlData = await this.loadKMLForZone(zoneId, part);
    return kmlData.parsed.bounds;
  }
  
  /**
   * Ottieni metadata KML
   */
  static async getMetadataForZone(zoneId: number, part: 'A' | 'B') {
    const kmlData = await this.loadKMLForZone(zoneId, part);
    return kmlData.parsed.metadata;
  }
  
  /**
   * Svuota cache (utile quando si cambia zona)
   */
  static clearCache() {
    console.log('[KMLService] Cache svuotata');
    this.cache.clear();
  }
  
  /**
   * Svuota cache per una zona specifica
   */
  static clearCacheForZone(zoneId: number, part: 'A' | 'B') {
    const cacheKey = `zone_${zoneId}_${part}`;
    console.log(`[KMLService] Cache eliminata per ${cacheKey}`);
    this.cache.delete(cacheKey);
  }
  
  /**
   * Verifica se esiste un KML per la zona
   */
  static async checkKMLExists(zoneId: number, part: 'A' | 'B'): Promise<boolean> {
    return KMLLoaderSimple.checkKMLExists(zoneId, part);
  }
  
  /**
   * Genera report di validazione per una zona
   */
  static async generateValidationReport(zoneId: number, part: 'A' | 'B'): Promise<string> {
    try {
      const kmlData = await this.loadKMLForZone(zoneId, part);
      return KMLValidator.generateReport(kmlData.validation);
    } catch (error) {
      return `❌ Errore generazione report: ${(error as Error).message}`;
    }
  }
}

export default KMLService;

