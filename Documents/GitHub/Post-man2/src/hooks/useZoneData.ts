/**
 * useZoneData - Hook per gestire dati zona con cleanup automatico
 * Milestone M2 - Task T24
 * 
 * Regole PRD v3 (CRITICHE):
 * - Carica KML SOLO quando zona/sottozona selezionate
 * - CLEANUP completo quando si cambia zona (svuota routes, stops, dismonta marker)
 * - Nessun residuo/bleed-over tra zone diverse
 */

import { useState, useEffect, useCallback } from 'react';
import ZoneService from '../services/ZoneService';
import type { RouteSegment, Stop } from '../services/KMLService';

interface ZoneDataState {
  zoneId: number | null;
  zonePart: 'A' | 'B' | null;
  routes: RouteSegment[];
  stops: Stop[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
  centerCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
  metadata: any | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: ZoneDataState = {
  zoneId: null,
  zonePart: null,
  routes: [],
  stops: [],
  bounds: null,
  centerCoordinates: null,
  metadata: null,
  isLoading: false,
  error: null
};

/**
 * Hook per gestire dati zona con gating e cleanup automatico
 */
export function useZoneData() {
  const [state, setState] = useState<ZoneDataState>(INITIAL_STATE);

  /**
   * Carica dati per zona/sottozona (KML + metadata)
   */
  const loadZone = useCallback(async (zoneId: number, zonePart: 'A' | 'B') => {
    console.log(`[useZoneData] Loading Zona ${zoneId} - Sottozona ${zonePart}...`);
    
    // Cleanup preventivo se c'era una zona precedente
    if (state.zoneId !== null && (state.zoneId !== zoneId || state.zonePart !== zonePart)) {
      console.log(`[useZoneData] CLEANUP: Cambio da Zona ${state.zoneId}-${state.zonePart} a Zona ${zoneId}-${zonePart}`);
      cleanupZone();
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Carica mappa (include KML parsing)
      const mapData: any = await ZoneService.loadZoneMap(zoneId, zonePart);
      
      // Carica fermate
      const stops: any = await ZoneService.getStopsForZone(zoneId, zonePart);

      console.log(`[useZoneData] ✅ Zona ${zoneId}-${zonePart} caricata:`);
      console.log(`  - Routes: ${mapData.routes?.length || 0}`);
      console.log(`  - Stops: ${stops.length}`);
      console.log(`  - Bounds:`, mapData.bounds);

      setState({
        zoneId,
        zonePart,
        routes: mapData.routes || [],
        stops: stops || [],
        bounds: mapData.bounds || null,
        centerCoordinates: mapData.centerCoordinates || null,
        metadata: mapData.metadata || null,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error(`[useZoneData] ❌ Errore caricamento zona ${zoneId}-${zonePart}:`, error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }));
    }
  }, [state.zoneId, state.zonePart]);

  /**
   * Cleanup completo: svuota routes, stops, dismonta tutto
   * OBBLIGATORIO quando si cambia zona (regola pk T24)
   */
  const cleanupZone = useCallback(() => {
    console.log('[useZoneData] 🧹 CLEANUP: Svuotamento dati zona precedente...');
    
    setState(INITIAL_STATE);
    
    console.log('[useZoneData] ✅ Cleanup completato');
  }, []);

  /**
   * Verifica se una zona è attualmente caricata
   */
  const hasZoneLoaded = state.zoneId !== null && state.zonePart !== null;

  /**
   * Verifica se la zona specificata è quella corrente
   */
  const isZoneActive = useCallback((zoneId: number, zonePart: 'A' | 'B') => {
    return state.zoneId === zoneId && state.zonePart === zonePart;
  }, [state.zoneId, state.zonePart]);

  return {
    // State
    zoneId: state.zoneId,
    zonePart: state.zonePart,
    routes: state.routes,
    stops: state.stops,
    bounds: state.bounds,
    centerCoordinates: state.centerCoordinates,
    metadata: state.metadata,
    isLoading: state.isLoading,
    error: state.error,
    hasZoneLoaded,
    
    // Actions
    loadZone,
    cleanupZone,
    isZoneActive
  };
}

export default useZoneData;

