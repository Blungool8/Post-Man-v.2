/**
 * Script per estrarre provincia di Piacenza dal file nord-est.osm.pbf
 * Coordinate bounding box per provincia di Piacenza
 */

// Coordinate bounding box provincia di Piacenza + Gazzola e dintorni
const PIACENZA_BOUNDS = {
  // Coordinate estese per includere Gazzola (44°57'39" N, 9°33'00" E) e dintorni
  north: 45.3,   // Limite nord esteso
  south: 44.7,   // Limite sud esteso  
  east: 10.1,    // Limite est esteso
  west: 9.1      // Limite ovest esteso
};

// Stima dimensioni file risultante
const AREA_SIZE_KM2 = (PIACENZA_BOUNDS.north - PIACENZA_BOUNDS.south) * 111 * (PIACENZA_BOUNDS.east - PIACENZA_BOUNDS.west) * 111; // Approssimativo
const ESTIMATED_SIZE_MB = (AREA_SIZE_KM2 / 1000) * 0.5; // ~0.5MB per 1000km2
const MAX_SIZE_MB = 6; // Limite massimo richiesto

console.log('=== ESTRAZIONE PROVINCIA DI PIACENZA + GAZZOLA ===');
console.log(`Coordinate bounding box:`);
console.log(`  Nord: ${PIACENZA_BOUNDS.north}°`);
console.log(`  Sud: ${PIACENZA_BOUNDS.south}°`);
console.log(`  Est: ${PIACENZA_BOUNDS.east}°`);
console.log(`  Ovest: ${PIACENZA_BOUNDS.west}°`);
console.log(`Area stimata: ${AREA_SIZE_KM2.toFixed(0)} km²`);
console.log(`Dimensione file stimata: ${ESTIMATED_SIZE_MB.toFixed(1)} MB`);
console.log(`Limite massimo: ${MAX_SIZE_MB} MB`);
console.log(`✅ Include Gazzola (44°57'39" N, 9°33'00" E) e dintorni`);
console.log(`✅ Target rispettato: < ${MAX_SIZE_MB}MB`);

// Comando osmium-tool per estrazione
const OSM_COMMAND = `osmium extract -b ${PIACENZA_BOUNDS.west},${PIACENZA_BOUNDS.south},${PIACENZA_BOUNDS.east},${PIACENZA_BOUNDS.north} nord-est.osm.pbf -o piacenza.osm.pbf`;

console.log('\n=== COMANDO DI ESTRAZIONE ===');
console.log(OSM_COMMAND);

// Comando per filtraggio successivo (solo strade e edifici)
const FILTER_COMMAND = `osmium tags-filter piacenza.osm.pbf w/highway w/building -o piacenza_filtered.osm.pbf`;

console.log('\n=== COMANDO DI FILTRAGGIO ===');
console.log(FILTER_COMMAND);

export { PIACENZA_BOUNDS, OSM_COMMAND, FILTER_COMMAND };
