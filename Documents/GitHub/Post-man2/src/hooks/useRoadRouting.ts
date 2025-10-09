/**
 * useRoadRouting - Hook per calcolare percorsi su strada
 * Utilizza RoutingService per convertire waypoints in percorsi reali
 */

import { useState, useCallback, useEffect } from 'react';
import { RouteSegment, LatLng } from '../services/KMLService/KMLParser';
import RoutingService, { RouteResponse } from '../services/RoutingService/RoutingService';
import config from '../config/env';

interface UseRoadRoutingResult {
  routedCoordinates: LatLng[] | null;
  isLoading: boolean;
  error: string | null;
  calculateRoadRoute: (waypoints: LatLng[]) => Promise<void>;
  clearRoute: () => void;
}

/**
 * Hook per calcolare percorsi seguendo le strade
 */
export function useRoadRouting(): UseRoadRoutingResult {
  const [routedCoordinates, setRoutedCoordinates] = useState<LatLng[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routingService] = useState(() => new RoutingService({
    apiKey: config.orsApiKey,
    provider: 'openrouteservice',
    profile: config.orsProfile
  }));

  const calculateRoadRoute = useCallback(async (waypoints: LatLng[]) => {
    if (waypoints.length < 2) {
      setError('Servono almeno 2 punti per calcolare un percorso');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useRoadRouting] Calcolo percorso con ${waypoints.length} waypoints...`);
      
      const result = await routingService.calculateRouteFromLatLng(waypoints);
      
      setRoutedCoordinates(result.coordinates);
      console.log(`[useRoadRouting] ✅ Percorso calcolato: ${result.coordinates.length} punti`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('[useRoadRouting] Errore:', errorMessage);
      setError(errorMessage);
      
      // Fallback: usa waypoints originali
      setRoutedCoordinates(waypoints);
      
    } finally {
      setIsLoading(false);
    }
  }, [routingService]);

  const clearRoute = useCallback(() => {
    setRoutedCoordinates(null);
    setError(null);
  }, []);

  return {
    routedCoordinates,
    isLoading,
    error,
    calculateRoadRoute,
    clearRoute
  };
}

