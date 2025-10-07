// Configurazione Zone CTD Castel San Giovanni
// Via Bellini 17, 29015 Castel San Giovanni (PC)

export const CTD_INFO = {
  name: "CTD Castel San Giovanni",
  address: "Via Bellini 17, 29015 Castel San Giovanni (PC)",
  province: "Piacenza",
  region: "Emilia-Romagna",
  totalZones: 25
};

export const ZONE_DATA = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Zona ${i + 1}`,
  description: `Zona postale ${i + 1} - CTD Castel San Giovanni`,
  area: `Area ${i + 1} - Provincia di Piacenza`,
  mapImage: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#e3f2fd"/>
      <text x="200" y="120" text-anchor="middle" font-family="Arial" font-size="28" fill="#2196F3">
        Zona ${i + 1}
      </text>
      <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="18" fill="#4CAF50">
        CTD Castel San Giovanni
      </text>
      <text x="200" y="190" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
        Provincia di Piacenza
      </text>
      <circle cx="200" cy="220" r="8" fill="#FFD800"/>
      <text x="200" y="225" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">
        Centro Zona
      </text>
    </svg>
  `)}`,
  // Per ora tutte le mappe sono uguali, poi caricheranno le mappe reali
  realMapPath: `./assets/maps/zona_${i + 1}.jpg`,
  // Informazioni specifiche per ogni zona (da completare con dati reali)
  municipalities: getMunicipalitiesForZone(i + 1),
  estimatedStops: Math.floor(Math.random() * 50) + 20, // Stima fermate per zona
  deliveryDays: ['A', 'B'], // Ogni zona divisa in A e B
  workingDays: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì']
}));

// Funzione per ottenere i comuni serviti da ogni zona
function getMunicipalitiesForZone(zoneId) {
  const municipalitiesByZone = {
    1: ['Castel San Giovanni', 'Sarmato', 'Borgonovo Val Tidone'],
    2: ['Piacenza Centro', 'Piacenza Nord'],
    3: ['Piacenza Sud', 'Piacenza Est'],
    4: ['Piacenza Ovest', 'San Nicolò'],
    5: ['Gossolengo', 'Rivergaro', 'Gazzola'],
    6: ['Podenzano', 'Pontenure', 'Cadeo'],
    7: ['Carpaneto Piacentino', 'Gropparello', 'Vernasca'],
    8: ['Fiorenzuola d\'Arda', 'Cadeo', 'Pontenure'],
    9: ['Cortemaggiore', 'San Pietro in Cerro', 'Villanova sull\'Arda'],
    10: ['Busseto', 'Villanova sull\'Arda', 'Besenzone'],
    11: ['Alseno', 'Besenzone', 'Villanova sull\'Arda'],
    12: ['Lugagnano Val d\'Arda', 'Morasso', 'Vernasca'],
    13: ['Morfasso', 'Vernasca', 'Gropparello'],
    14: ['Bettola', 'Farini', 'Ferriere'],
    15: ['Coli', 'Farini', 'Bettola'],
    16: ['Corte Brugnatella', 'Farini', 'Bettola'],
    17: ['Travo', 'Gazzola', 'Rivergaro'],
    18: ['Piozzano', 'Gazzola', 'Rivergaro'],
    19: ['Agazzano', 'Gazzola', 'Rivergaro'],
    20: ['Gragnano Trebbiense', 'Rivergaro', 'Gazzola'],
    21: ['Rottofreno', 'Sarmato', 'Castel San Giovanni'],
    22: ['Calendasco', 'Sarmato', 'Rottofreno'],
    23: ['Monticelli d\'Ongina', 'Caorso', 'San Pietro in Cerro'],
    24: ['Caorso', 'Monticelli d\'Ongina', 'San Pietro in Cerro'],
    25: ['Ponte dell\'Olio', 'Bettola', 'Farini']
  };
  
  return municipalitiesByZone[zoneId] || [`Zona ${zoneId} - Comuni da definire`];
}

// Configurazione per la gestione delle mappe
export const MAP_CONFIG = {
  // Dimensioni mappe
  mapWidth: 400,
  mapHeight: 300,
  
  // Formati supportati
  supportedFormats: ['jpg', 'jpeg', 'png'],
  
  // Percorso mappe offline
  offlineMapsPath: './assets/maps/',
  
    // Configurazione GPS per ogni zona
    gpsConfig: {
      // Coordinate approssimative del centro di ogni zona
      getCenterCoordinates: (zoneId) => {
        const coordinates = {
          1: { latitude: 45.0600, longitude: 9.4300 }, // Castel San Giovanni
          2: { latitude: 45.0526, longitude: 9.6934 }, // Piacenza Centro
          3: { latitude: 45.0526, longitude: 9.6934 }, // Piacenza Sud
          4: { latitude: 45.0526, longitude: 9.6934 }, // Piacenza Ovest
          5: { latitude: 44.9500, longitude: 9.6000 }, // Gossolengo
          6: { latitude: 44.9000, longitude: 9.7000 }, // Podenzano
          7: { latitude: 44.8500, longitude: 9.5000 }, // Carpaneto Piacentino
          8: { latitude: 44.8000, longitude: 9.8000 }, // Fiorenzuola d'Arda
          9: { latitude: 44.7500, longitude: 9.9000 }, // Cortemaggiore
          10: { latitude: 44.7000, longitude: 10.0000 }, // Busseto
          11: { latitude: 44.6500, longitude: 9.4000 }, // Alseno
          12: { latitude: 44.6000, longitude: 9.3000 }, // Lugagnano Val d'Arda
          13: { latitude: 44.5500, longitude: 9.2000 }, // Morfasso
          14: { latitude: 44.5000, longitude: 9.1000 }, // Bettola
          15: { latitude: 44.4500, longitude: 9.0000 }, // Coli
          16: { latitude: 44.4000, longitude: 8.9000 }, // Corte Brugnatella
          17: { latitude: 44.3500, longitude: 9.6000 }, // Travo
          18: { latitude: 44.3000, longitude: 9.5000 }, // Piozzano
          19: { latitude: 44.2500, longitude: 9.4000 }, // Agazzano
          20: { latitude: 44.2000, longitude: 9.3000 }, // Gragnano Trebbiense
          21: { latitude: 44.1500, longitude: 9.2000 }, // Rottofreno
          22: { latitude: 44.1000, longitude: 9.1000 }, // Calendasco
          23: { latitude: 44.0500, longitude: 9.0000 }, // Monticelli d'Ongina
          24: { latitude: 44.0000, longitude: 8.9000 }, // Caorso
          25: { latitude: 43.9500, longitude: 8.8000 }, // Ponte dell'Olio
        };
        return coordinates[zoneId] || { latitude: 45.0526, longitude: 9.6934 };
      },
    
    // Raggio di ricerca fermate (in metri)
    searchRadius: 5000,
    
    // Precisione GPS richiesta
    accuracy: 'high'
  }
};

// Esempi di fermate per ogni zona (dati di test)
export const EXAMPLE_STOPS_BY_ZONE = {
  1: [
    { name: 'Via Roma 15', address: 'Via Roma 15, Castel San Giovanni, PC 29015' },
    { name: 'Piazza Garibaldi 8', address: 'Piazza Garibaldi 8, Castel San Giovanni, PC 29015' },
    { name: 'Via Bellini 25', address: 'Via Bellini 25, Castel San Giovanni, PC 29015' }
  ],
  2: [
    { name: 'Piazza Cavalli 1', address: 'Piazza Cavalli 1, Piacenza, PC 29121' },
    { name: 'Via Roma 45', address: 'Via Roma 45, Piacenza, PC 29121' },
    { name: 'Corso Vittorio Emanuele 12', address: 'Corso Vittorio Emanuele 12, Piacenza, PC 29121' }
  ],
  // ... altre zone da completare
};

export default {
  CTD_INFO,
  ZONE_DATA,
  MAP_CONFIG,
  EXAMPLE_STOPS_BY_ZONE
};
