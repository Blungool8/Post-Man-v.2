import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { MapConfig } from '../services/MapService/MapConfig';

export const useDynamicNavigation = (stops) => {
  const [userLocation, setUserLocation] = useState(null);
  const [visibleStops, setVisibleStops] = useState([]);
  const [stopSizes, setStopSizes] = useState({});
  const [locationError, setLocationError] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // Calcolo dimensioni marker based on distance
  const calculateStopSizes = useCallback((location) => {
    if (!location) return {};
    
    const sizes = {};
    stops.forEach(stop => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        stop.latitude,
        stop.longitude
      );
      
      // Dynamic sizing: closer = bigger, far = smaller/hidden
      if (distance < 500) {
        sizes[stop.id] = Math.max(0.5, 1 - (distance / 500)); // 0.5 to 1.0 scale
      } else {
        sizes[stop.id] = 0; // Hidden
      }
    });
    
    return sizes;
  }, [stops]);

  // Funzione per gestire aggiornamenti posizione
  const handleLocationUpdate = useCallback((location) => {
    if (!location) return;
    
    setLocationError(null);
    setUserLocation(location);
    
    // Batch updates in animation frame for performance
    requestAnimationFrame(() => {
      const newSizes = calculateStopSizes(location);
      setStopSizes(newSizes);
      
      // Update visible stops based on viewport
      const visible = calculateVisibleStops(location, stops);
      setVisibleStops(visible);
    });
  }, [stops, calculateStopSizes]);

  // Funzione per gestire errori GPS
  const handleLocationError = useCallback((error) => {
    console.error('Location error:', error);
    setLocationError('Errore nel tracking GPS');
    setIsLocationEnabled(false);
  }, []);

  // Verifica stato GPS all'avvio
  useEffect(() => {
    const checkLocationStatus = async () => {
      try {
        const isEnabled = await Location.hasServicesEnabledAsync();
        setIsLocationEnabled(isEnabled);
        
        if (!isEnabled) {
          setLocationError('GPS disabilitato');
        }
      } catch (error) {
        console.error('Error checking location status:', error);
        setLocationError('Errore nel controllo GPS');
      }
    };

    checkLocationStatus();
  }, []);

  // Memoized markers per performance
  const optimizedMarkers = useMemo(() => 
    visibleStops.map(stop => ({
      ...stop,
      size: stopSizes[stop.id] || 0,
      isVisible: stopSizes[stop.id] > 0
    })), [visibleStops, stopSizes]
  );

  // Calcolo prossima fermata
  const nearestStop = useMemo(() => {
    if (!userLocation || stops.length === 0) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    stops.forEach(stop => {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        stop.latitude,
        stop.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...stop, distance };
      }
    });
    
    return nearest;
  }, [userLocation, stops]);

  // Calcolo direzione verso prossima fermata
  const directionToNearest = useMemo(() => {
    if (!userLocation || !nearestStop) return null;
    
    return calculateBearing(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      nearestStop.latitude,
      nearestStop.longitude
    );
  }, [userLocation, nearestStop]);

  return {
    userLocation,
    optimizedMarkers,
    stopSizes,
    nearestStop,
    directionToNearest,
    locationError,
    isLocationEnabled,
    handleLocationUpdate,
    handleLocationError
  };
};

// Helper functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula implementation
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
};

const calculateVisibleStops = (location, allStops, radius = 2000) => {
  if (!location) return allStops;
  
  return allStops.filter(stop => {
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      stop.latitude,
      stop.longitude
    );
    return distance <= radius;
  });
};

const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

// Hook per gestione modalità navigazione
export const useNavigationMode = () => {
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleNavigationMode = useCallback(() => {
    setIsNavigationMode(prev => {
      const newMode = !prev;
      setIsFullscreen(newMode);
      return newMode;
    });
  }, []);

  return {
    isNavigationMode,
    isFullscreen,
    toggleNavigationMode
  };
};
