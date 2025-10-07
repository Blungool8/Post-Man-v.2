/**
 * KML Service Tests - Post-Man v3
 * Test per verificare il funzionamento del servizio KML
 * 
 * @fileoverview Test di integrazione per il servizio KML completo
 */

import kmlService from './KMLService';
import { parseKML } from './KMLParser';
import { validateKML } from './KMLValidator';

/**
 * Test del servizio KML completo
 * @returns {Promise<void>}
 */
export async function testKMLService() {
  console.log('🧪 Inizio test KML Service...');
  
  try {
    // Test 1: Verifica disponibilità KML Zona 9 Sottozona B
    console.log('\n📋 Test 1: Verifica disponibilità KML');
    const isAvailable = await kmlService.isKMLAvailable(9, 'B');
    console.log(`✅ KML Zona 9 Sottozona B disponibile: ${isAvailable}`);
    
    if (!isAvailable) {
      console.log('⚠️ KML non disponibile, salto test di caricamento');
      return;
    }
    
    // Test 2: Caricamento KML
    console.log('\n📋 Test 2: Caricamento KML');
    const loadResult = await kmlService.loadKMLForZone(9, 'B');
    
    if (loadResult.success) {
      console.log('✅ KML caricato con successo');
      console.log(`📊 Statistiche:`);
      console.log(`   - Percorsi: ${loadResult.metadata.routeCount}`);
      console.log(`   - Punti totali: ${loadResult.metadata.totalPoints}`);
      console.log(`   - Tempo caricamento: ${loadResult.metadata.loadTime}ms`);
      console.log(`   - Valido: ${loadResult.metadata.isValid}`);
      
      if (!loadResult.metadata.isValid) {
        console.log('⚠️ KML ha errori di validazione:');
        loadResult.validation.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log(`❌ Errore caricamento KML: ${loadResult.error}`);
    }
    
    // Test 3: Lista KML disponibili
    console.log('\n📋 Test 3: Lista KML disponibili');
    const availableKMLs = await kmlService.listAvailableKMLs();
    console.log(`✅ KML disponibili: ${availableKMLs.length}`);
    
    availableKMLs.forEach(kml => {
      console.log(`   - Zona ${kml.zone} Sottozona ${kml.subzone} (${kml.filename})`);
    });
    
    // Test 4: Cache
    console.log('\n📋 Test 4: Test cache');
    const cacheStats = kmlService.getCacheStats();
    console.log(`✅ Elementi in cache: ${cacheStats.size}`);
    console.log(`✅ Chiavi cache: ${cacheStats.keys.join(', ')}`);
    
    // Test 5: Ricaricamento (dovrebbe usare cache)
    console.log('\n📋 Test 5: Ricaricamento (cache)');
    const startTime = Date.now();
    const reloadResult = await kmlService.loadKMLForZone(9, 'B');
    const reloadTime = Date.now() - startTime;
    
    console.log(`✅ Ricaricamento completato in ${reloadTime}ms (dovrebbe essere molto veloce)`);
    
    // Test 6: Forza ricaricamento
    console.log('\n📋 Test 6: Forza ricaricamento');
    const forceReloadResult = await kmlService.loadKMLForZone(9, 'B', true);
    console.log(`✅ Ricaricamento forzato completato`);
    
    console.log('\n🎉 Tutti i test completati con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante i test:', error);
  }
}

/**
 * Test del parser KML con contenuto di esempio
 * @returns {Promise<void>}
 */
export async function testKMLParser() {
  console.log('\n🧪 Test KML Parser...');
  
  try {
    // Contenuto KML di esempio (semplificato)
    const sampleKML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test Zona 9 Sottozona B</name>
    <description>Test KML</description>
    <Placemark>
      <name>Test Percorso</name>
      <LineString>
        <coordinates>
          9.58337,44.96544,0
          9.58333,44.96549,0
          9.58331,44.96552,0
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
    
    // Test parsing
    const parsed = parseKML(sampleKML);
    console.log('✅ KML parsato con successo');
    console.log(`📊 Metadati:`, parsed.metadata);
    console.log(`📊 Percorsi: ${parsed.routes.length}`);
    console.log(`📊 Fermate: ${parsed.stops.length}`);
    
    if (parsed.routes.length > 0) {
      const route = parsed.routes[0];
      console.log(`📊 Primo percorso: "${route.name}" con ${route.path.length} punti`);
    }
    
    // Test validazione
    const validation = validateKML(parsed);
    console.log(`📊 Validazione: ${validation.isValid ? 'VALIDO' : 'NON VALIDO'}`);
    
    if (validation.errors.length > 0) {
      console.log('⚠️ Errori:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.log('⚠️ Avvisi:', validation.warnings);
    }
    
  } catch (error) {
    console.error('❌ Errore test parser:', error);
  }
}

/**
 * Esegue tutti i test
 * @returns {Promise<void>}
 */
export async function runAllTests() {
  console.log('🚀 Inizio test completi KML Service...');
  
  await testKMLParser();
  await testKMLService();
  
  console.log('\n✅ Tutti i test completati!');
}

// Export per uso esterno
export default {
  testKMLService,
  testKMLParser,
  runAllTests
};
