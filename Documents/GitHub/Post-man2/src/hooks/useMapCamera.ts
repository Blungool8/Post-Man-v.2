/**
 * useMapCamera - Hook per gestire camera della mappa
 * Milestone M2 - Task T22/T23
 * 
 * Funzionalità:
 * - Fit bounds automatico all'apertura KML
 * - Fallback a centro zona se bounds non disponibili
 * - Centra su utente quando richiesto
 */

import { useRef, useCallback } from 'react';
import type MapView from 'react-native-maps';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface CenterCoordinates {
  latitude: number;
  longitude: number;
}

export function useMapCamera() {
  const mapRef = useRef<MapView>(null);

  /**
   * Fit mappa ai bounds del KML (T23)
   * Centra e zooma per mostrare tutto il percorso
   */
  const fitToBounds = useCallback((bounds: Bounds, animated: boolean = true) => {
    if (!mapRef.current || !bounds) {
      console.warn('[MapCamera] Cannot fit bounds: mapRef or bounds null');
      return;
    }

    console.log('[MapCamera] Fitting to bounds:', bounds);

    try {
      const padding = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      };

      mapRef.current.fitToCoordinates(
        [
          { latitude: bounds.north, longitude: bounds.west },
          { latitude: bounds.north, longitude: bounds.east },
          { latitude: bounds.south, longitude: bounds.east },
          { latitude: bounds.south, longitude: bounds.west }
        ],
        {
          edgePadding: padding,
          animated
        }
      );

      console.log('[MapCamera] ✅ Fit to bounds completed');
    } catch (error) {
      console.error('[MapCamera] ❌ Error fitting to bounds:', error);
    }
  }, []);

  /**
   * Centra mappa su coordinate specifiche
   */
  const centerOnCoordinates = useCallback(
    (coords: CenterCoordinates, zoom: { latitudeDelta: number; longitudeDelta: number } = { latitudeDelta: 0.01, longitudeDelta: 0.01 }, animated: boolean = true) => {
      if (!mapRef.current || !coords) {
        console.warn('[MapCamera] Cannot center: mapRef or coords null');
        return;
      }

      console.log('[MapCamera] Centering on:', coords);

      try {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            ...zoom
          },
          animated ? 1000 : 0
        );

        console.log('[MapCamera] ✅ Centered on coordinates');
      } catch (error) {
        console.error('[MapCamera] ❌ Error centering:', error);
      }
    },
    []
  );

  /**
   * Centra su posizione utente corrente
   */
  const centerOnUser = useCallback((userLocation: any, animated: boolean = true) => {
    if (!userLocation || !userLocation.coords) {
      console.warn('[MapCamera] Cannot center on user: location null');
      return;
    }

    centerOnCoordinates(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      },
      { latitudeDelta: 0.005, longitudeDelta: 0.005 },
      animated
    );
  }, [centerOnCoordinates]);

  /**
   * Fit automatico con fallback a centro zona (T23)
   */
  const fitToZone = useCallback(
    (bounds: Bounds | null, centerCoords: CenterCoordinates | null, animated: boolean = true) => {
      if (bounds) {
        // Preferisci bounds se disponibili
        fitToBounds(bounds, animated);
      } else if (centerCoords) {
        // Fallback a centro zona
        console.log('[MapCamera] Bounds non disponibili, uso centro zona');
        centerOnCoordinates(centerCoords, { latitudeDelta: 0.05, longitudeDelta: 0.05 }, animated);
      } else {
        console.warn('[MapCamera] Né bounds né centerCoords disponibili');
      }
    },
    [fitToBounds, centerOnCoordinates]
  );

  return {
    mapRef,
    fitToBounds,
    centerOnCoordinates,
    centerOnUser,
    fitToZone
  };
}

export default useMapCamera;

