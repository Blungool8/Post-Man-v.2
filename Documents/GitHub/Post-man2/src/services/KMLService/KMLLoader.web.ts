/**
 * KMLLoader Web - Versione web-compatible
 * Web non supporta expo-asset/expo-file-system
 * Carica KML direttamente via fetch
 */

import type { KMLLoadResult } from './KMLLoader';

class KMLLoaderWeb {
  /**
   * Carica file KML da assets su web usando fetch
   */
  static async loadFromAssets(zoneId: number, part: 'A' | 'B'): Promise<KMLLoadResult> {
    const fileName = `CTD_CastelSanGiovanni_Z${String(zoneId).padStart(2, '0')}_${part}.kml`;
    const assetPath = `/assets/kml/${fileName}`;
    
    console.log(`[KMLLoaderWeb] Caricamento ${fileName} da ${assetPath}...`);
    
    try {
      const response = await fetch(assetPath);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      const result: KMLLoadResult = {
        content,
        source: 'assets',
        fileName,
        size: content.length
      };
      
      console.log(`[KMLLoaderWeb] ✅ ${fileName} caricato con successo (${result.size} bytes)`);
      return result;
      
    } catch (error) {
      console.error(`[KMLLoaderWeb] ❌ Errore caricamento ${fileName}:`, error);
      throw new Error(`Impossibile caricare ${fileName}: ${(error as Error).message}`);
    }
  }
  
  /**
   * Carica file KML da storage (non supportato su web)
   */
  static async loadFromStorage(filePath: string): Promise<KMLLoadResult> {
    throw new Error('loadFromStorage non supportato su web. Usa file picker HTML5.');
  }
  
  /**
   * Verifica esistenza file
   */
  static async checkKMLExists(zoneId: number, part: 'A' | 'B'): Promise<boolean> {
    const fileName = `CTD_CastelSanGiovanni_Z${String(zoneId).padStart(2, '0')}_${part}.kml`;
    
    // Su web, possiamo solo provare a fetchare
    try {
      const response = await fetch(`/assets/kml/${fileName}`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default KMLLoaderWeb;

