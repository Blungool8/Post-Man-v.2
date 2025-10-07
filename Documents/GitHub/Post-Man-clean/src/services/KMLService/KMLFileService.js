/**
 * KML File Service - Post-Man v3
 * Gestisce la verifica e il caricamento dei file KML
 * 
 * @fileoverview Servizio per gestire file KML unici per zona/sottozona
 */

import * as FileSystem from 'expo-file-system';

/**
 * Verifica se un file KML esiste per la zona/sottozona specificata
 * @param {number} zone - Numero della zona (es. 9)
 * @param {string} subzone - Sottozona ('A' o 'B')
 * @returns {Promise<boolean>} True se il file esiste
 */
export async function verifyKMLFile(zone, subzone) {
  try {
    const filename = `Zona${zone}_Sottozona${subzone}.kml`;
    const kmlPath = `${FileSystem.bundleDirectory}assets/kml/${filename}`;
    
    const fileInfo = await FileSystem.getInfoAsync(kmlPath);
    return fileInfo.exists;
  } catch (error) {
    console.error('Errore verifica file KML:', error);
    return false;
  }
}

/**
 * Carica il contenuto di un file KML per zona/sottozona
 * @param {number} zone - Numero della zona
 * @param {string} subzone - Sottozona ('A' o 'B')
 * @returns {Promise<string>} Contenuto XML del file KML
 */
export async function loadKML(zone, subzone) {
  try {
    const filename = `Zona${zone}_Sottozona${subzone}.kml`;
    const kmlPath = `${FileSystem.bundleDirectory}assets/kml/${filename}`;
    
    // Verifica che il file esista
    const fileInfo = await FileSystem.getInfoAsync(kmlPath);
    if (!fileInfo.exists) {
      throw new Error(`File KML non trovato: ${filename}`);
    }
    
    // Legge il contenuto del file
    const kmlContent = await FileSystem.readAsStringAsync(kmlPath);
    
    if (!kmlContent || kmlContent.trim().length === 0) {
      throw new Error(`File KML vuoto: ${filename}`);
    }
    
    return kmlContent;
  } catch (error) {
    console.error('Errore caricamento KML:', error);
    throw new Error(`Impossibile caricare KML per Zona ${zone} Sottozona ${subzone}: ${error.message}`);
  }
}

/**
 * Lista tutti i file KML disponibili
 * @returns {Promise<Array<{zone: number, subzone: string}>>} Lista delle combinazioni zona/sottozona disponibili
 */
export async function listAvailableKMLFiles() {
  try {
    const kmlDir = `${FileSystem.bundleDirectory}assets/kml/`;
    const dirInfo = await FileSystem.getInfoAsync(kmlDir);
    
    if (!dirInfo.exists || !dirInfo.isDirectory) {
      return [];
    }
    
    const files = await FileSystem.readDirectoryAsync(kmlDir);
    const kmlFiles = [];
    
    // Pattern: Zona{N}_Sottozona{X}.kml
    const pattern = /^Zona(\d+)_Sottozona([AB])\.kml$/;
    
    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        kmlFiles.push({
          zone: parseInt(match[1], 10),
          subzone: match[2],
          filename: file
        });
      }
    }
    
    return kmlFiles.sort((a, b) => {
      if (a.zone !== b.zone) return a.zone - b.zone;
      return a.subzone.localeCompare(b.subzone);
    });
  } catch (error) {
    console.error('Errore listaggio file KML:', error);
    return [];
  }
}

/**
 * Ottiene informazioni dettagliate su un file KML
 * @param {number} zone - Numero della zona
 * @param {string} subzone - Sottozona
 * @returns {Promise<{exists: boolean, size?: number, modified?: Date}>} Info del file
 */
export async function getKMLFileInfo(zone, subzone) {
  try {
    const filename = `Zona${zone}_Sottozona${subzone}.kml`;
    const kmlPath = `${FileSystem.bundleDirectory}assets/kml/${filename}`;
    
    const fileInfo = await FileSystem.getInfoAsync(kmlPath);
    
    if (!fileInfo.exists) {
      return { exists: false };
    }
    
    return {
      exists: true,
      size: fileInfo.size,
      modified: fileInfo.modificationTime ? new Date(fileInfo.modificationTime * 1000) : null,
      filename
    };
  } catch (error) {
    console.error('Errore info file KML:', error);
    return { exists: false };
  }
}
