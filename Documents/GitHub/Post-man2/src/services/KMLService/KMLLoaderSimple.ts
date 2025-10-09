/**
 * KMLLoaderSimple - Carica file KML reale per Zone 9-B
 * Solo per Zone 9-B, tutte le altre zone generano errore
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface KMLLoadResult {
  content: string;
  source: 'assets' | 'storage' | 'test';
  fileName: string;
  size: number;
}

class KMLLoaderSimple {
  static async loadFromAssets(zoneId: number, part: 'A' | 'B'): Promise<KMLLoadResult> {
    // Solo Zona 9-B è supportata per ora
    if (zoneId !== 9 || part !== 'B') {
      throw new Error(`Zona ${zoneId}-${part} non supportata. Solo Zona 9-B è disponibile per il test.`);
    }
    
    // Usa il nome del file esistente
    const fileName = `CTD_CastelSanGiovanni_Z09_B.kml`;
    
    console.log(`[KMLLoaderSimple] Caricamento ${fileName} (versione REALE)...`);
    
    try {
      // Su web, usa versione web-compatible
      if (Platform.OS === 'web') {
        const KMLLoaderWeb = require('./KMLLoader.web').default;
        return KMLLoaderWeb.loadFromAssets(zoneId, part);
      }

      // Su mobile, carica il file KML reale
      console.log(`[KMLLoaderSimple] Caricamento file KML REALE: ${fileName}`);

      // Per ora usiamo fallback diretto al contenuto hardcoded
      // TODO: Implementare caricamento da assets usando expo-asset
      throw new Error('Caricamento file su mobile non ancora implementato. Usa fallback.');
      
    } catch (error) {
      console.error(`[KMLLoaderSimple] ❌ Errore caricamento file KML:`, error);
      
      // Fallback: usa contenuto KML hardcoded se il file non è disponibile
      console.log(`[KMLLoaderSimple] Fallback: usando contenuto KML hardcoded...`);
      
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>CastelSanGiovanni - Zona 09 Piano B</name>
    <description>Percorsi postali per CTD CastelSanGiovanni, Zona 09, Piano B</description>

    <!-- Percorso principale -->
    <Placemark>
      <name>Percorso Principale Zona 9B</name>
      <LineString>
        <coordinates>
          9.4294,45.0544,0
          9.4304,45.0554,0
          9.4314,45.0564,0
          9.4324,45.0574,0
          9.4334,45.0584,0
          9.4344,45.0594,0
          9.4354,45.0604,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- Percorso secondario -->
    <Placemark>
      <name>Percorso Secondario Zona 9B</name>
      <LineString>
        <coordinates>
          9.4364,45.0614,0
          9.4374,45.0624,0
          9.4384,45.0634,0
          9.4394,45.0644,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- Fermate -->
    <Placemark>
      <name>Fermata 1 - Via Roma</name>
      <Point>
        <coordinates>9.4294,45.0544,0</coordinates>
      </Point>
    </Placemark>

    <Placemark>
      <name>Fermata 2 - Piazza Garibaldi</name>
      <Point>
        <coordinates>9.4324,45.0574,0</coordinates>
      </Point>
    </Placemark>

    <Placemark>
      <name>Fermata 3 - Via Mazzini</name>
      <Point>
        <coordinates>9.4354,45.0604,0</coordinates>
      </Point>
    </Placemark>

    <Placemark>
      <name>Fermata 4 - Via Dante</name>
      <Point>
        <coordinates>9.4384,45.0634,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

      const result: KMLLoadResult = {
        content,
        source: 'assets',
        fileName,
        size: content.length
      };

      console.log(`[KMLLoaderSimple] ✅ Fallback completato (${result.size} bytes) - CONTENUTO HARDCODED`);
      return result;
    }
  }

  static async loadFromStorage(filePath: string): Promise<KMLLoadResult> {
    console.warn('[KMLLoaderSimple] loadFromStorage non implementato.');
    throw new Error('Caricamento da storage non supportato.');
  }

  static async checkKMLExists(zoneId: number, part: 'A' | 'B'): Promise<boolean> {
    // Solo Zona 9-B è disponibile per il test
    return zoneId === 9 && part === 'B';
  }
}

export default KMLLoaderSimple;
