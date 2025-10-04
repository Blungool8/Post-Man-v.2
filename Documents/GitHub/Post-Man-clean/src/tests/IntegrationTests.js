/**
 * Integration Tests - Post-Man v3
 * Test di integrazione completa per tutti i servizi v3
 * 
 * @fileoverview Test end-to-end per architettura v3 completa
 */

import postManV3Service from '../services/IntegrationService/PostManV3Service';
import kmlService from '../services/KMLService/KMLService';
import databaseService from '../services/DatabaseService/DatabaseService';

/**
 * Test di integrazione completa
 * @returns {Promise<void>}
 */
export async function runIntegrationTests() {
  console.log('🧪 Inizio test di integrazione Post-Man v3...');
  
  try {
    // Test 1: Inizializzazione
    console.log('\n📋 Test 1: Inizializzazione servizi');
    await postManV3Service.initialize();
    console.log('✅ Servizi inizializzati');
    
    // Test 2: Verifica KML disponibile
    console.log('\n📋 Test 2: Verifica KML Zona 9 Sottozona B');
    const isKMLAvailable = await kmlService.isKMLAvailable(9, 'B');
    console.log(`✅ KML disponibile: ${isKMLAvailable}`);
    
    if (!isKMLAvailable) {
      console.log('⚠️ KML non disponibile, salto test di caricamento');
      return;
    }
    
    // Test 3: Caricamento zona completa
    console.log('\n📋 Test 3: Caricamento Zona 9 Sottozona B');
    const zoneResult = await postManV3Service.loadZone(9, 'B');
    
    if (zoneResult.success) {
      console.log('✅ Zona caricata con successo');
      console.log(`📊 Statistiche:`);
      console.log(`   - Percorsi: ${zoneResult.routes.length}`);
      console.log(`   - Fermate: ${zoneResult.stops.length}`);
      console.log(`   - Valido: ${zoneResult.metadata.isValid}`);
    } else {
      console.log('❌ Errore caricamento zona');
      return;
    }
    
    // Test 4: Database
    console.log('\n📋 Test 4: Test database');
    const dbStats = await databaseService.getStats();
    console.log('✅ Statistiche database:', dbStats);
    
    // Test 5: Fermata manuale
    console.log('\n📋 Test 5: Aggiunta fermata manuale');
    const manualStop = await postManV3Service.addManualStop({
      latitude: 44.96544,
      longitude: 9.58337,
      name: 'Test Fermata Manuale',
      description: 'Fermata di test',
      zone: 9,
      subzone: 'B'
    });
    console.log(`✅ Fermata manuale aggiunta: ${manualStop.name} (${manualStop.id})`);
    
    // Test 6: Aggiornamento posizione GPS
    console.log('\n📋 Test 6: Aggiornamento posizione GPS');
    const testLocation = {
      latitude: 44.96544,
      longitude: 9.58337,
      accuracy: 10
    };
    
    postManV3Service.updateUserLocation(testLocation);
    console.log('✅ Posizione GPS aggiornata');
    
    // Test 7: Selezione fermata
    console.log('\n📋 Test 7: Selezione fermata per navigazione');
    if (zoneResult.stops.length > 0) {
      const firstStop = zoneResult.stops[0];
      postManV3Service.selectStopForNavigation(firstStop);
      console.log(`✅ Fermata selezionata: ${firstStop.name}`);
    }
    
    // Test 8: Run di lavoro
    console.log('\n📋 Test 8: Inizio run di lavoro');
    const runId = await postManV3Service.startRun({
      zone_id: 9,
      plan: 'B',
      notes: 'Test run di integrazione'
    });
    console.log(`✅ Run iniziata: ${runId}`);
    
    // Test 9: Statistiche complete
    console.log('\n📋 Test 9: Statistiche complete');
    const completeStats = await postManV3Service.getCompleteStats();
    console.log('✅ Statistiche complete:', {
      database: completeStats.database,
      map: completeStats.map,
      manualStops: completeStats.manualStops
    });
    
    // Test 10: Export dati
    console.log('\n📋 Test 10: Export dati');
    const exportedData = await postManV3Service.exportData();
    console.log(`✅ Dati esportati (${exportedData.length} caratteri)`);
    
    console.log('\n🎉 Tutti i test di integrazione completati con successo!');
    
    // Test di pulizia
    console.log('\n📋 Test di pulizia');
    postManV3Service.deselectStop();
    console.log('✅ Pulizia completata');
    
  } catch (error) {
    console.error('❌ Errore durante test di integrazione:', error);
  }
}

/**
 * Test performance
 * @returns {Promise<void>}
 */
export async function runPerformanceTests() {
  console.log('\n⚡ Test di performance...');
  
  try {
    const startTime = Date.now();
    
    // Test caricamento ripetuto (cache)
    for (let i = 0; i < 5; i++) {
      const loadStart = Date.now();
      await postManV3Service.loadZone(9, 'B');
      const loadTime = Date.now() - loadStart;
      console.log(`   Caricamento ${i + 1}: ${loadTime}ms`);
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`⚡ Test performance completato in ${totalTime}ms`);
    
  } catch (error) {
    console.error('❌ Errore test performance:', error);
  }
}

/**
 * Test stress
 * @returns {Promise<void>}
 */
export async function runStressTests() {
  console.log('\n💪 Test di stress...');
  
  try {
    // Test aggiunta multiple fermate manuali
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(postManV3Service.addManualStop({
        latitude: 44.96544 + (i * 0.001),
        longitude: 9.58337 + (i * 0.001),
        name: `Stress Test ${i + 1}`,
        description: `Fermata di stress test ${i + 1}`,
        zone: 9,
        subzone: 'B'
      }));
    }
    
    const results = await Promise.all(promises);
    console.log(`💪 Aggiunte ${results.length} fermate manuali simultaneamente`);
    
    // Test statistiche sotto stress
    const stats = await postManV3Service.getCompleteStats();
    console.log(`💪 Statistiche sotto stress:`, stats.manualStops);
    
  } catch (error) {
    console.error('❌ Errore test stress:', error);
  }
}

/**
 * Esegue tutti i test
 * @returns {Promise<void>}
 */
export async function runAllTests() {
  console.log('🚀 Inizio test completi Post-Man v3...');
  
  await runIntegrationTests();
  await runPerformanceTests();
  await runStressTests();
  
  console.log('\n✅ Tutti i test completati!');
}

export default {
  runIntegrationTests,
  runPerformanceTests,
  runStressTests,
  runAllTests
};
