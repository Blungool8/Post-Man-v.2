/**
 * useGPSDrivenMarkers - Hook per marker visibili solo con GPS ON e entro raggio
 * Milestone M2 - Task T21
 * 
 * Regole PRD v3 (CRITICHE):
 * - Marker fermate visibili SOLO se GPS ON e entro raggio (default 200m)
 * - Toggle "Mostra solo la mia posizione" per disabilitare marker
 * - Se GPS OFF o utente fuori raggio → marker nascosti
 */

import { useState, useEffect, useMemo } from 'react';

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

interface UserLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

interface UseGPSDrivenMarkersOptions {
  nearbyRadius?: number; // metri, default 200
  showOnlyMyPosition?: boolean; // toggle "mostra solo posizione"
}

/**
 * Calcola distanza tra due punti usando formula Haversine
 * @returns distanza in metri
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raggio Terra in metri
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Hook per gestire visibilità marker basata su GPS e raggio
 */
export function useGPSDrivenMarkers(
  stops: Stop[],
  userLocation: UserLocation | null,
  options: UseGPSDrivenMarkersOptions = {}
) {
  const {
    nearbyRadius = 200, // 200m default (da PRD)
    showOnlyMyPosition = false
  } = options;

  const [isGPSEnabled, setIsGPSEnabled] = useState(false);

  // Monitora stato GPS
  useEffect(() => {
    setIsGPSEnabled(userLocation !== null);
  }, [userLocation]);

  // Calcola marker visibili secondo regole PRD v3
  const visibleMarkers = useMemo(() => {
    // Regola 1: Se toggle "mostra solo posizione" attivo → nessun marker
    if (showOnlyMyPosition) {
      console.log('[GPS-Driven] Toggle attivo: nascondo tutti i marker');
      return [];
    }

    // Regola 2: Se GPS OFF → nessun marker
    if (!isGPSEnabled || !userLocation) {
      console.log('[GPS-Driven] GPS OFF: nascondo tutti i marker');
      return [];
    }

    // Regola 3: GPS ON → mostra solo marker entro raggio
    const nearby = stops.filter(stop => {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        stop.latitude,
        stop.longitude
      );

      const isNearby = distance <= nearbyRadius;
      
      if (isNearby) {
        console.log(
          `[GPS-Driven] Marker "${stop.name}": ${Math.round(distance)}m - VISIBILE`
        );
      }

      return isNearby;
    });

    console.log(
      `[GPS-Driven] ${nearby.length}/${stops.length} marker visibili (raggio: ${nearbyRadius}m)`
    );

    return nearby;
  }, [stops, userLocation, isGPSEnabled, nearbyRadius, showOnlyMyPosition]);

  // Trova marker più vicino
  const nearestMarker = useMemo(() => {
    if (visibleMarkers.length === 0 || !userLocation) {
      return null;
    }

    let nearest = visibleMarkers[0];
    let minDistance = calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      nearest.latitude,
      nearest.longitude
    );

    for (let i = 1; i < visibleMarkers.length; i++) {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        visibleMarkers[i].latitude,
        visibleMarkers[i].longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = visibleMarkers[i];
      }
    }

    return { ...nearest, distance: minDistance };
  }, [visibleMarkers, userLocation]);

  return {
    visibleMarkers,
    nearestMarker,
    isGPSEnabled,
    totalMarkers: stops.length,
    nearbyRadius
  };
}

export default useGPSDrivenMarkers;

