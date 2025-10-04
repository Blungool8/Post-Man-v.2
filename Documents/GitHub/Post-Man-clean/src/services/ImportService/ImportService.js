import * as FileSystem from 'expo-file-system';
import { useDatabase } from '../../hooks/useDatabase';

class ImportService {
  constructor() {
    this.supportedFormats = ['json', 'csv'];
  }

  // Valida il formato del file
  validateFileFormat(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    return this.supportedFormats.includes(extension);
  }

  // Importa da file JSON
  async importFromJSON(fileUri) {
    try {
      console.log('Importing from JSON:', fileUri);
      
      // Legge il file JSON
      const jsonContent = await FileSystem.readAsStringAsync(fileUri);
      const data = JSON.parse(jsonContent);
      
      // Valida la struttura del JSON
      this.validateJSONStructure(data);
      
      // Processa i dati
      const processedData = this.processJSONData(data);
      
      return processedData;
    } catch (error) {
      console.error('Error importing from JSON:', error);
      throw new Error(`Errore nell'importazione JSON: ${error.message}`);
    }
  }

  // Importa da file CSV
  async importFromCSV(fileUri) {
    try {
      console.log('Importing from CSV:', fileUri);
      
      // Legge il file CSV
      const csvContent = await FileSystem.readAsStringAsync(fileUri);
      
      // Processa il CSV
      const processedData = this.processCSVData(csvContent);
      
      return processedData;
    } catch (error) {
      console.error('Error importing from CSV:', error);
      throw new Error(`Errore nell'importazione CSV: ${error.message}`);
    }
  }

  // Valida la struttura del JSON
  validateJSONStructure(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Il file JSON deve contenere un oggetto valido');
    }

    // Struttura minima richiesta
    if (!data.route && !data.routes) {
      throw new Error('Il file JSON deve contenere un campo "route" o "routes"');
    }

    const routeData = data.route || data.routes;
    
    if (Array.isArray(routeData)) {
      // Array di percorsi
      routeData.forEach((route, index) => {
        this.validateRouteStructure(route, index);
      });
    } else {
      // Singolo percorso
      this.validateRouteStructure(routeData, 0);
    }
  }

  // Valida la struttura di un singolo percorso
  validateRouteStructure(route, index) {
    if (!route.name) {
      throw new Error(`Percorso ${index + 1}: campo "name" obbligatorio`);
    }

    if (!route.stops || !Array.isArray(route.stops)) {
      throw new Error(`Percorso ${index + 1}: campo "stops" deve essere un array`);
    }

    if (route.stops.length === 0) {
      throw new Error(`Percorso ${index + 1}: deve contenere almeno una fermata`);
    }

    // Valida ogni fermata
    route.stops.forEach((stop, stopIndex) => {
      this.validateStopStructure(stop, index, stopIndex);
    });
  }

  // Valida la struttura di una fermata
  validateStopStructure(stop, routeIndex, stopIndex) {
    if (!stop.name) {
      throw new Error(`Percorso ${routeIndex + 1}, Fermata ${stopIndex + 1}: campo "name" obbligatorio`);
    }

    if (typeof stop.latitude !== 'number' || typeof stop.longitude !== 'number') {
      throw new Error(`Percorso ${routeIndex + 1}, Fermata ${stopIndex + 1}: campi "latitude" e "longitude" obbligatori e devono essere numeri`);
    }

    if (stop.latitude < -90 || stop.latitude > 90) {
      throw new Error(`Percorso ${routeIndex + 1}, Fermata ${stopIndex + 1}: latitude deve essere tra -90 e 90`);
    }

    if (stop.longitude < -180 || stop.longitude > 180) {
      throw new Error(`Percorso ${routeIndex + 1}, Fermata ${stopIndex + 1}: longitude deve essere tra -180 e 180`);
    }
  }

  // Processa i dati JSON
  processJSONData(data) {
    const routeData = data.route || data.routes;
    
    if (Array.isArray(routeData)) {
      return routeData.map(route => this.processRoute(route));
    } else {
      return [this.processRoute(routeData)];
    }
  }

  // Processa un singolo percorso
  processRoute(route) {
    return {
      name: route.name,
      description: route.description || '',
      status: route.status || 'active',
      stops: route.stops.map((stop, index) => ({
        name: stop.name,
        address: stop.address || '',
        latitude: parseFloat(stop.latitude),
        longitude: parseFloat(stop.longitude),
        status: stop.status || 'pending',
        order_index: index + 1,
        notes: stop.notes || ''
      }))
    };
  }

  // Processa i dati CSV
  processCSVData(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Il file CSV deve contenere almeno un header e una riga di dati');
    }

    // Parse header
    const headers = this.parseCSVLine(lines[0]);
    this.validateCSVHeaders(headers);

    // Parse data rows
    const stops = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const stop = this.createStopFromCSVRow(headers, values, i);
        stops.push(stop);
      }
    }

    if (stops.length === 0) {
      throw new Error('Nessuna fermata valida trovata nel file CSV');
    }

    // Crea un percorso con le fermate
    return [{
      name: 'Percorso Importato',
      description: 'Importato da file CSV',
      status: 'active',
      stops: stops
    }];
  }

  // Parse una riga CSV
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Valida gli header CSV
  validateCSVHeaders(headers) {
    const requiredHeaders = ['name', 'latitude', 'longitude'];
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.toLowerCase() === header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Header CSV mancanti: ${missingHeaders.join(', ')}`);
    }
  }

  // Crea una fermata da una riga CSV
  createStopFromCSVRow(headers, values, rowIndex) {
    const stop = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const lowerHeader = header.toLowerCase();
      
      switch (lowerHeader) {
        case 'name':
          stop.name = value;
          break;
        case 'address':
          stop.address = value;
          break;
        case 'latitude':
          stop.latitude = parseFloat(value);
          break;
        case 'longitude':
          stop.longitude = parseFloat(value);
          break;
        case 'status':
          stop.status = value || 'pending';
          break;
        case 'notes':
          stop.notes = value;
          break;
        default:
          // Ignora header non riconosciuti
          break;
      }
    });

    // Valida la fermata creata
    this.validateStopStructure(stop, 0, rowIndex);

    return {
      name: stop.name,
      address: stop.address || '',
      latitude: stop.latitude,
      longitude: stop.longitude,
      status: stop.status || 'pending',
      order_index: rowIndex,
      notes: stop.notes || ''
    };
  }

  // Salva i percorsi importati nel database
  async saveImportedRoutes(routes, databaseService) {
    try {
      const savedRoutes = [];
      
      for (const route of routes) {
        // Crea il percorso
        const routeId = await databaseService.createRoute({
          name: route.name,
          description: route.description,
          status: route.status
        });

        // Crea le fermate
        for (const stop of route.stops) {
          await databaseService.createStop({
            route_id: routeId,
            ...stop
          });
        }

        savedRoutes.push({
          id: routeId,
          ...route
        });
      }

      return savedRoutes;
    } catch (error) {
      console.error('Error saving imported routes:', error);
      throw new Error(`Errore nel salvataggio: ${error.message}`);
    }
  }

  // Genera un file JSON di esempio
  generateSampleJSON() {
    return {
      route: {
        name: "Percorso Milano Centro",
        description: "Percorso di esempio per il centro di Milano",
        status: "active",
        stops: [
          {
            name: "Via Torino 15",
            address: "Via Torino 15, Milano, MI 20123",
            latitude: 45.4642,
            longitude: 9.1900,
            status: "pending",
            notes: "Fermata principale"
          },
          {
            name: "Piazza Duomo 1",
            address: "Piazza Duomo 1, Milano, MI 20121",
            latitude: 45.4641,
            longitude: 9.1919,
            status: "pending",
            notes: "Duomo di Milano"
          },
          {
            name: "Via Brera 28",
            address: "Via Brera 28, Milano, MI 20121",
            latitude: 45.4719,
            longitude: 9.1881,
            status: "completed",
            notes: "Pinacoteca di Brera"
          }
        ]
      }
    };
  }

  // Genera un file CSV di esempio
  generateSampleCSV() {
    return `name,address,latitude,longitude,status,notes
Via Torino 15,"Via Torino 15, Milano, MI 20123",45.4642,9.1900,pending,Fermata principale
Piazza Duomo 1,"Piazza Duomo 1, Milano, MI 20121",45.4641,9.1919,pending,Duomo di Milano
Via Brera 28,"Via Brera 28, Milano, MI 20121",45.4719,9.1881,completed,Pinacoteca di Brera`;
  }
}

// Singleton instance
const importService = new ImportService();

export default importService;
