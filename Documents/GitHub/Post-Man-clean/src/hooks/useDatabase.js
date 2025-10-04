import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/DatabaseService/DatabaseService';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inizializza il database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        await databaseService.initialize();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // CRUD Operations per Routes
  const createRoute = useCallback(async (routeData) => {
    try {
      const routeId = await databaseService.createRoute(routeData);
      return routeId;
    } catch (err) {
      console.error('Error creating route:', err);
      throw err;
    }
  }, []);

  const getRoutes = useCallback(async () => {
    try {
      const routes = await databaseService.getRoutes();
      return routes;
    } catch (err) {
      console.error('Error getting routes:', err);
      throw err;
    }
  }, []);

  const getRouteById = useCallback(async (routeId) => {
    try {
      const route = await databaseService.getRouteById(routeId);
      return route;
    } catch (err) {
      console.error('Error getting route by id:', err);
      throw err;
    }
  }, []);

  const updateRoute = useCallback(async (routeId, routeData) => {
    try {
      await databaseService.updateRoute(routeId, routeData);
      return true;
    } catch (err) {
      console.error('Error updating route:', err);
      throw err;
    }
  }, []);

  const deleteRoute = useCallback(async (routeId) => {
    try {
      await databaseService.deleteRoute(routeId);
      return true;
    } catch (err) {
      console.error('Error deleting route:', err);
      throw err;
    }
  }, []);

  // CRUD Operations per Stops
  const createStop = useCallback(async (stopData) => {
    try {
      const stopId = await databaseService.createStop(stopData);
      return stopId;
    } catch (err) {
      console.error('Error creating stop:', err);
      throw err;
    }
  }, []);

  const getStopsByRouteId = useCallback(async (routeId) => {
    try {
      const stops = await databaseService.getStopsByRouteId(routeId);
      return stops;
    } catch (err) {
      console.error('Error getting stops by route id:', err);
      throw err;
    }
  }, []);

  const getStopById = useCallback(async (stopId) => {
    try {
      const stop = await databaseService.getStopById(stopId);
      return stop;
    } catch (err) {
      console.error('Error getting stop by id:', err);
      throw err;
    }
  }, []);

  const updateStop = useCallback(async (stopId, stopData) => {
    try {
      await databaseService.updateStop(stopId, stopData);
      return true;
    } catch (err) {
      console.error('Error updating stop:', err);
      throw err;
    }
  }, []);

  const deleteStop = useCallback(async (stopId) => {
    try {
      await databaseService.deleteStop(stopId);
      return true;
    } catch (err) {
      console.error('Error deleting stop:', err);
      throw err;
    }
  }, []);

  // Operations per User Location
  const saveUserLocation = useCallback(async (locationData) => {
    try {
      await databaseService.saveUserLocation(locationData);
      return true;
    } catch (err) {
      console.error('Error saving user location:', err);
      throw err;
    }
  }, []);

  const getRecentUserLocations = useCallback(async (limit = 10) => {
    try {
      const locations = await databaseService.getRecentUserLocations(limit);
      return locations;
    } catch (err) {
      console.error('Error getting recent user locations:', err);
      throw err;
    }
  }, []);

  // Utility methods
  const clearAllData = useCallback(async () => {
    try {
      await databaseService.clearAllData();
      return true;
    } catch (err) {
      console.error('Error clearing all data:', err);
      throw err;
    }
  }, []);

  const getDatabaseStats = useCallback(async () => {
    try {
      const stats = await databaseService.getDatabaseStats();
      return stats;
    } catch (err) {
      console.error('Error getting database stats:', err);
      throw err;
    }
  }, []);

  return {
    // Stato
    isInitialized,
    loading,
    error,
    
    // Routes
    createRoute,
    getRoutes,
    getRouteById,
    updateRoute,
    deleteRoute,
    
    // Stops
    createStop,
    getStopsByRouteId,
    getStopById,
    updateStop,
    deleteStop,
    
    // User Location
    saveUserLocation,
    getRecentUserLocations,
    
    // Utility
    clearAllData,
    getDatabaseStats
  };
};

// Hook specifico per gestire i percorsi
export const useRoutes = () => {
  const { 
    isInitialized, 
    loading, 
    error,
    createRoute, 
    getRoutes, 
    getRouteById, 
    updateRoute, 
    deleteRoute 
  } = useDatabase();

  const [routes, setRoutes] = useState([]);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Carica tutti i percorsi
  const loadRoutes = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      const routesData = await getRoutes();
      setRoutes(routesData);
    } catch (err) {
      console.error('Error loading routes:', err);
    }
  }, [isInitialized, getRoutes]);

  // Carica un percorso specifico
  const loadRoute = useCallback(async (routeId) => {
    if (!isInitialized) return;
    
    try {
      const routeData = await getRouteById(routeId);
      setCurrentRoute(routeData);
      return routeData;
    } catch (err) {
      console.error('Error loading route:', err);
      throw err;
    }
  }, [isInitialized, getRouteById]);

  // Crea un nuovo percorso
  const addRoute = useCallback(async (routeData) => {
    try {
      const routeId = await createRoute(routeData);
      await loadRoutes(); // Ricarica la lista
      return routeId;
    } catch (err) {
      console.error('Error adding route:', err);
      throw err;
    }
  }, [createRoute, loadRoutes]);

  // Aggiorna un percorso
  const modifyRoute = useCallback(async (routeId, routeData) => {
    try {
      await updateRoute(routeId, routeData);
      await loadRoutes(); // Ricarica la lista
      if (currentRoute && currentRoute.id === routeId) {
        await loadRoute(routeId); // Ricarica il percorso corrente
      }
      return true;
    } catch (err) {
      console.error('Error modifying route:', err);
      throw err;
    }
  }, [updateRoute, loadRoutes, loadRoute, currentRoute]);

  // Elimina un percorso
  const removeRoute = useCallback(async (routeId) => {
    try {
      await deleteRoute(routeId);
      await loadRoutes(); // Ricarica la lista
      if (currentRoute && currentRoute.id === routeId) {
        setCurrentRoute(null); // Pulisci il percorso corrente
      }
      return true;
    } catch (err) {
      console.error('Error removing route:', err);
      throw err;
    }
  }, [deleteRoute, loadRoutes, currentRoute]);

  // Carica automaticamente i percorsi quando il database è inizializzato
  useEffect(() => {
    if (isInitialized) {
      loadRoutes();
    }
  }, [isInitialized, loadRoutes]);

  return {
    // Stato
    routes,
    currentRoute,
    loading,
    error,
    
    // Actions
    loadRoutes,
    loadRoute,
    addRoute,
    modifyRoute,
    removeRoute,
    setCurrentRoute
  };
};

// Hook specifico per gestire le fermate
export const useStops = (routeId) => {
  const { 
    isInitialized, 
    loading, 
    error,
    createStop, 
    getStopsByRouteId, 
    getStopById, 
    updateStop, 
    deleteStop 
  } = useDatabase();

  const [stops, setStops] = useState([]);

  // Carica le fermate per un percorso
  const loadStops = useCallback(async () => {
    if (!isInitialized || !routeId) return;
    
    try {
      const stopsData = await getStopsByRouteId(routeId);
      setStops(stopsData);
    } catch (err) {
      console.error('Error loading stops:', err);
    }
  }, [isInitialized, routeId, getStopsByRouteId]);

  // Aggiunge una fermata
  const addStop = useCallback(async (stopData) => {
    try {
      const stopId = await createStop({ ...stopData, route_id: routeId });
      await loadStops(); // Ricarica la lista
      return stopId;
    } catch (err) {
      console.error('Error adding stop:', err);
      throw err;
    }
  }, [createStop, loadStops, routeId]);

  // Aggiorna una fermata
  const modifyStop = useCallback(async (stopId, stopData) => {
    try {
      await updateStop(stopId, stopData);
      await loadStops(); // Ricarica la lista
      return true;
    } catch (err) {
      console.error('Error modifying stop:', err);
      throw err;
    }
  }, [updateStop, loadStops]);

  // Elimina una fermata
  const removeStop = useCallback(async (stopId) => {
    try {
      await deleteStop(stopId);
      await loadStops(); // Ricarica la lista
      return true;
    } catch (err) {
      console.error('Error removing stop:', err);
      throw err;
    }
  }, [deleteStop, loadStops]);

  // Carica automaticamente le fermate quando il database è inizializzato
  useEffect(() => {
    if (isInitialized && routeId) {
      loadStops();
    }
  }, [isInitialized, routeId, loadStops]);

  return {
    // Stato
    stops,
    loading,
    error,
    
    // Actions
    loadStops,
    addStop,
    modifyStop,
    removeStop
  };
};
