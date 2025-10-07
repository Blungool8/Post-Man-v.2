/**
 * KML Validator Service - Post-Man v3
 * Validazione dei file KML e dei dati parsati
 * 
 * @fileoverview Servizio per validare KML e garantire qualità dei dati
 */

/**
 * Valida un file KML parsato
 * @param {ParsedKML} parsedKML - KML parsato
 * @returns {ValidationResult} Risultato della validazione
 */
export function validateKML(parsedKML) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      routeCount: 0,
      totalPoints: 0,
      validRoutes: 0
    }
  };

  try {
    // Validazione struttura base
    validateBasicStructure(parsedKML, result);
    
    // Validazione percorsi
    validateRoutes(parsedKML, result);
    
    // Validazione fermate (per future estensioni)
    validateStops(parsedKML, result);
    
    // Calcolo statistiche
    calculateValidationStats(parsedKML, result);
    
    // Validazione performance
    validatePerformance(parsedKML, result);
    
    // Risultato finale
    result.isValid = result.errors.length === 0;
    
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Errore validazione: ${error.message}`);
  }

  return result;
}

/**
 * Valida la struttura base del KML
 * @param {ParsedKML} parsedKML - KML parsato
 * @param {ValidationResult} result - Risultato validazione
 */
function validateBasicStructure(parsedKML, result) {
  if (!parsedKML) {
    result.errors.push('KML parsato è null o undefined');
    return;
  }

  if (!parsedKML.metadata) {
    result.errors.push('Mancano metadati nel KML');
    return;
  }

  if (!parsedKML.metadata.name || parsedKML.metadata.name.trim().length === 0) {
    result.warnings.push('Nome del percorso non specificato');
  }

  if (!parsedKML.routes || !Array.isArray(parsedKML.routes)) {
    result.errors.push('Array percorsi non valido o mancante');
    return;
  }

  if (parsedKML.routes.length === 0) {
    result.errors.push('Nessun percorso trovato nel KML');
    return;
  }
}

/**
 * Valida tutti i percorsi
 * @param {ParsedKML} parsedKML - KML parsato
 * @param {ValidationResult} result - Risultato validazione
 */
function validateRoutes(parsedKML, result) {
  const routes = parsedKML.routes;
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const routePrefix = `Percorso ${i + 1}`;
    
    // Validazione struttura percorso
    if (!route) {
      result.errors.push(`${routePrefix}: percorso nullo`);
      continue;
    }
    
    if (!route.name || route.name.trim().length === 0) {
      result.warnings.push(`${routePrefix}: nome mancante`);
    }
    
    if (!route.path || !Array.isArray(route.path)) {
      result.errors.push(`${routePrefix}: path non valido`);
      continue;
    }
    
    if (route.path.length < 2) {
      result.errors.push(`${routePrefix}: meno di 2 punti nel percorso`);
      continue;
    }
    
    // Validazione coordinate
    validateRouteCoordinates(route, routePrefix, result);
    
    // Validazione performance
    if (route.path.length > 10000) {
      result.warnings.push(`${routePrefix}: percorso molto lungo (${route.path.length} punti) - potrebbe causare problemi di performance`);
    }
  }
}

/**
 * Valida le coordinate di un percorso
 * @param {Route} route - Percorso da validare
 * @param {string} routePrefix - Prefisso per messaggi di errore
 * @param {ValidationResult} result - Risultato validazione
 */
function validateRouteCoordinates(route, routePrefix, result) {
  const path = route.path;
  let validPoints = 0;
  let invalidPoints = [];
  
  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    
    if (!point) {
      invalidPoints.push(i);
      continue;
    }
    
    if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
      invalidPoints.push(i);
      continue;
    }
    
    if (!isValidCoordinate(point.latitude, point.longitude)) {
      invalidPoints.push(i);
      continue;
    }
    
    validPoints++;
  }
  
  if (validPoints === 0) {
    result.errors.push(`${routePrefix}: nessun punto valido trovato`);
  } else if (invalidPoints.length > 0) {
    result.warnings.push(`${routePrefix}: ${invalidPoints.length} punti non validi (indici: ${invalidPoints.slice(0, 5).join(', ')}${invalidPoints.length > 5 ? '...' : ''})`);
  }
  
  if (validPoints < 2) {
    result.errors.push(`${routePrefix}: meno di 2 punti validi`);
  }
}

/**
 * Valida le fermate (per future estensioni)
 * @param {ParsedKML} parsedKML - KML parsato
 * @param {ValidationResult} result - Risultato validazione
 */
function validateStops(parsedKML, result) {
  if (!parsedKML.stops || !Array.isArray(parsedKML.stops)) {
    // Fermate non sono ancora implementate in v3, è normale
    return;
  }
  
  const stops = parsedKML.stops;
  
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const stopPrefix = `Fermata ${i + 1}`;
    
    if (!stop) {
      result.errors.push(`${stopPrefix}: fermata null`);
      continue;
    }
    
    if (!stop.name || stop.name.trim().length === 0) {
      result.warnings.push(`${stopPrefix}: nome mancante`);
    }
    
    if (!isValidCoordinate(stop.latitude, stop.longitude)) {
      result.errors.push(`${stopPrefix}: coordinate non valide`);
    }
  }
}

/**
 * Calcola statistiche di validazione
 * @param {ParsedKML} parsedKML - KML parsato
 * @param {ValidationResult} result - Risultato validazione
 */
function calculateValidationStats(parsedKML, result) {
  const routes = parsedKML.routes || [];
  
  result.stats.routeCount = routes.length;
  result.stats.validRoutes = 0;
  result.stats.totalPoints = 0;
  
  for (const route of routes) {
    if (route && route.path && Array.isArray(route.path) && route.path.length >= 2) {
      result.stats.validRoutes++;
      result.stats.totalPoints += route.path.length;
    }
  }
  
  // Statistiche aggiuntive
  result.stats.averagePointsPerRoute = routes.length > 0 ? Math.round(result.stats.totalPoints / routes.length) : 0;
  result.stats.stopCount = parsedKML.stops ? parsedKML.stops.length : 0;
}

/**
 * Valida performance e dimensioni
 * @param {ParsedKML} parsedKML - KML parsato
 * @param {ValidationResult} result - Risultato validazione
 */
function validatePerformance(parsedKML, result) {
  const totalPoints = result.stats.totalPoints;
  
  if (totalPoints > 50000) {
    result.warnings.push(`File molto grande (${totalPoints} punti) - potrebbe causare problemi di performance`);
  }
  
  if (totalPoints > 100000) {
    result.errors.push(`File troppo grande (${totalPoints} punti) - supera il limite di performance`);
  }
  
  // Controlla percorsi troppo densi
  const routes = parsedKML.routes || [];
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (route && route.path && route.path.length > 20000) {
      result.warnings.push(`Percorso ${i + 1} molto denso (${route.path.length} punti) - considerare semplificazione`);
    }
  }
}

/**
 * Valida se le coordinate sono valide
 * @param {number} latitude - Latitudine
 * @param {number} longitude - Longitudine
 * @returns {boolean} True se valide
 */
function isValidCoordinate(latitude, longitude) {
  return (
    !isNaN(latitude) && !isNaN(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    isFinite(latitude) && isFinite(longitude)
  );
}

/**
 * Valida un singolo percorso
 * @param {Route} route - Percorso da validare
 * @returns {ValidationResult} Risultato validazione
 */
export function validateSingleRoute(route) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      pointCount: 0,
      validPoints: 0
    }
  };

  try {
    if (!route) {
      result.errors.push('Percorso nullo');
      result.isValid = false;
      return result;
    }

    if (!route.path || !Array.isArray(route.path)) {
      result.errors.push('Path non valido');
      result.isValid = false;
      return result;
    }

    result.stats.pointCount = route.path.length;

    if (route.path.length < 2) {
      result.errors.push('Percorso con meno di 2 punti');
      result.isValid = false;
      return result;
    }

    // Valida ogni punto
    let validPoints = 0;
    for (let i = 0; i < route.path.length; i++) {
      const point = route.path[i];
      
      if (point && 
          typeof point.latitude === 'number' && 
          typeof point.longitude === 'number' &&
          isValidCoordinate(point.latitude, point.longitude)) {
        validPoints++;
      }
    }

    result.stats.validPoints = validPoints;

    if (validPoints < route.path.length) {
      result.warnings.push(`${route.path.length - validPoints} punti non validi`);
    }

    if (validPoints < 2) {
      result.errors.push('Meno di 2 punti validi');
      result.isValid = false;
    }

  } catch (error) {
    result.errors.push(`Errore validazione percorso: ${error.message}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Genera un report di validazione leggibile
 * @param {ValidationResult} validationResult - Risultato validazione
 * @returns {string} Report testuale
 */
export function generateValidationReport(validationResult) {
  const { isValid, errors, warnings, stats } = validationResult;
  
  let report = `=== REPORT VALIDAZIONE KML ===\n`;
  report += `Stato: ${isValid ? '✅ VALIDO' : '❌ NON VALIDO'}\n\n`;
  
  report += `📊 STATISTICHE:\n`;
  report += `- Percorsi: ${stats.routeCount}\n`;
  report += `- Percorsi validi: ${stats.validRoutes}\n`;
  report += `- Punti totali: ${stats.totalPoints}\n`;
  report += `- Punti per percorso: ${stats.averagePointsPerRoute}\n`;
  report += `- Fermate: ${stats.stopCount}\n\n`;
  
  if (errors.length > 0) {
    report += `❌ ERRORI (${errors.length}):\n`;
    errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += '\n';
  }
  
  if (warnings.length > 0) {
    report += `⚠️ AVVISI (${warnings.length}):\n`;
    warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }
  
  report += `=== FINE REPORT ===\n`;
  
  return report;
}
