/**
 * KML Service - Post-Man v3
 * Servizio principale per gestione completa dei file KML
 * 
 * @fileoverview Coordina caricamento, parsing e validazione dei file KML
 */

import { loadKML, verifyKMLFile, listAvailableKMLFiles, getKMLFileInfo } from './KMLFileService';
import { parseKML, calculateRouteStats } from './KMLParser';
import { validateKML, validateSingleRoute, generateValidationReport } from './KMLValidator';

/**
 * Servizio principale per gestione KML
 */
class KMLService {
  constructor() {
    this.cache = new Map(); // Cache per KML già caricati
    this.loadingPromises = new Map(); // Evita caricamenti multipli simultanei
  }

  /**
   * Carica e parsifica un file KML per zona/sottozona
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona ('A' o 'B')
   * @param {boolean} forceReload - Forza ricaricamento anche se in cache
   * @returns {Promise<KMLLoadResult>} Risultato del caricamento
   */
  async loadKMLForZone(zone, subzone, forceReload = false) {
    const cacheKey = `${zone}_${subzone}`;
    
    try {
      // Verifica se già in caricamento
      if (this.loadingPromises.has(cacheKey)) {
        return await this.loadingPromises.get(cacheKey);
      }

      // Verifica cache
      if (!forceReload && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Inizia caricamento
      const loadingPromise = this._performKMLLoading(zone, subzone);
      this.loadingPromises.set(cacheKey, loadingPromise);

      const result = await loadingPromise;
      
      // Salva in cache
      this.cache.set(cacheKey, result);
      
      // Rimuovi dalla lista caricamenti
      this.loadingPromises.delete(cacheKey);
      
      return result;

    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Esegue il caricamento effettivo del KML
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   * @returns {Promise<KMLLoadResult>} Risultato del caricamento
   */
  async _performKMLLoading(zone, subzone) {
    const startTime = Date.now();
    
    try {
      // T09: Verifica esistenza file
      const fileExists = await verifyKMLFile(zone, subzone);
      if (!fileExists) {
        throw new Error(`File KML non trovato per Zona ${zone} Sottozona ${subzone}`);
      }

      // T10: Carica contenuto file
      const kmlContent = await loadKML(zone, subzone);
      
      // T11: Parsifica contenuto
      const parsedKML = parseKML(kmlContent);
      
      // T12: Valida KML parsato
      const validation = validateKML(parsedKML);
      
      // Calcola statistiche aggiuntive
      const routesWithStats = parsedKML.routes.map(route => ({
        ...route,
        stats: calculateRouteStats(route)
      }));

      const result = {
        success: true,
        zone,
        subzone,
        parsedKML: {
          ...parsedKML,
          routes: routesWithStats
        },
        validation,
        metadata: {
          loadTime: Date.now() - startTime,
          fileSize: kmlContent.length,
          routeCount: routesWithStats.length,
          totalPoints: routesWithStats.reduce((sum, route) => sum + route.pointCount, 0),
          isValid: validation.isValid
        }
      };

      // Log risultato
      console.log(`✅ KML caricato per Zona ${zone} Sottozona ${subzone}:`, {
        routeCount: result.metadata.routeCount,
        totalPoints: result.metadata.totalPoints,
        loadTime: result.metadata.loadTime + 'ms',
        isValid: result.metadata.isValid
      });

      if (!validation.isValid) {
        console.warn('⚠️ KML caricato ma con errori di validazione:', validation.errors);
      }

      return result;

    } catch (error) {
      const loadTime = Date.now() - startTime;
      
      console.error(`❌ Errore caricamento KML Zona ${zone} Sottozona ${subzone}:`, error);
      
      return {
        success: false,
        zone,
        subzone,
        error: error.message,
        metadata: {
          loadTime,
          error: true
        }
      };
    }
  }

  /**
   * Verifica se un KML è disponibile per zona/sottozona
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   * @returns {Promise<boolean>} True se disponibile
   */
  async isKMLAvailable(zone, subzone) {
    return await verifyKMLFile(zone, subzone);
  }

  /**
   * Lista tutti i KML disponibili
   * @returns {Promise<Array<KMLInfo>>} Lista dei KML disponibili
   */
  async listAvailableKMLs() {
    try {
      const files = await listAvailableKMLFiles();
      const kmlInfos = [];

      for (const file of files) {
        const info = await getKMLFileInfo(file.zone, file.subzone);
        kmlInfos.push({
          zone: file.zone,
          subzone: file.subzone,
          filename: file.filename,
          ...info
        });
      }

      return kmlInfos;
    } catch (error) {
      console.error('Errore listaggio KML:', error);
      return [];
    }
  }

  /**
   * Ottiene informazioni su un KML senza caricarlo
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   * @returns {Promise<KMLInfo>} Informazioni del KML
   */
  async getKMLInfo(zone, subzone) {
    return await getKMLFileInfo(zone, subzone);
  }

  /**
   * Valida un KML già caricato
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   * @returns {Promise<ValidationResult>} Risultato validazione
   */
  async validateKML(zone, subzone) {
    try {
      const result = await this.loadKMLForZone(zone, subzone);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.validation;
    } catch (error) {
      console.error('Errore validazione KML:', error);
      throw error;
    }
  }

  /**
   * Genera report di validazione per un KML
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   * @returns {Promise<string>} Report testuale
   */
  async generateValidationReport(zone, subzone) {
    try {
      const validation = await this.validateKML(zone, subzone);
      return generateValidationReport(validation);
    } catch (error) {
      return `Errore generazione report: ${error.message}`;
    }
  }

  /**
   * Svuota la cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache KML svuotata');
  }

  /**
   * Ottiene statistiche della cache
   * @returns {Object} Statistiche cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      loadingCount: this.loadingPromises.size,
      loadingKeys: Array.from(this.loadingPromises.keys())
    };
  }

  /**
   * Rimuove un KML dalla cache
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   */
  removeFromCache(zone, subzone) {
    const cacheKey = `${zone}_${subzone}`;
    if (this.cache.has(cacheKey)) {
      this.cache.delete(cacheKey);
      console.log(`🗑️ Rimosso dalla cache: Zona ${zone} Sottozona ${subzone}`);
    }
  }

  /**
   * Verifica se un KML è in cache
   * @param {number} zone - Numero della zona
   * @param {string} subzone - Sottozona
   * @returns {boolean} True se in cache
   */
  isInCache(zone, subzone) {
    const cacheKey = `${zone}_${subzone}`;
    return this.cache.has(cacheKey);
  }
}

// Istanza singleton del servizio
export const kmlService = new KMLService();

// Export delle funzioni principali per compatibilità
export const loadKMLForZone = (zone, subzone, forceReload = false) => 
  kmlService.loadKMLForZone(zone, subzone, forceReload);

export const isKMLAvailable = (zone, subzone) => 
  kmlService.isKMLAvailable(zone, subzone);

export const listAvailableKMLs = () => 
  kmlService.listAvailableKMLs();

export const validateKML = (zone, subzone) => 
  kmlService.validateKML(zone, subzone);

export const generateValidationReport = (zone, subzone) => 
  kmlService.generateValidationReport(zone, subzone);

export default kmlService;
