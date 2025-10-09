/**
 * useSupabaseRoutes - Hook per gestire percorsi salvati nel database
 */

import { useState, useEffect, useCallback } from 'react';
import SupabaseService, { SavedRoute } from '../services/DatabaseService/SupabaseService';
import { RouteSegment, Stop } from '../services/KMLService/KMLParser';
import config from '../config/env';

interface UseSupabaseRoutesResult {
  routes: SavedRoute[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshRoutes: () => Promise<void>;
  saveRoute: (name: string, route: RouteSegment, stops: Stop[], description?: string) => Promise<void>;
  deleteRoute: (routeId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

let supabaseInstance: SupabaseService | null = null;

function getSupabaseService(): SupabaseService {
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseService({
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey
    });
  }
  return supabaseInstance;
}

/**
 * Hook per gestire percorsi salvati in Supabase
 */
export function useSupabaseRoutes(): UseSupabaseRoutesResult {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [supabase] = useState(() => getSupabaseService());

  // Controlla autenticazione all'inizio
  useEffect(() => {
    setIsAuthenticated(supabase.isAuthenticated());
  }, [supabase]);

  const refreshRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSupabaseRoutes] Caricamento percorsi...');
      const data = await supabase.getRoutes(true);
      setRoutes(data);
      console.log(`[useSupabaseRoutes] ✅ Caricati ${data.length} percorsi`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore caricamento percorsi';
      console.error('[useSupabaseRoutes] Errore:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const saveRoute = useCallback(async (
    name: string,
    route: RouteSegment,
    stops: Stop[],
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSupabaseRoutes] Salvataggio percorso:', name);
      await supabase.saveRoute(name, route, stops, false, description);
      console.log('[useSupabaseRoutes] ✅ Percorso salvato');
      await refreshRoutes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore salvataggio percorso';
      console.error('[useSupabaseRoutes] Errore:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, refreshRoutes]);

  const deleteRoute = useCallback(async (routeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useSupabaseRoutes] Eliminazione percorso:', routeId);
      await supabase.deleteRoute(routeId);
      console.log('[useSupabaseRoutes] ✅ Percorso eliminato');
      await refreshRoutes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore eliminazione percorso';
      console.error('[useSupabaseRoutes] Errore:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, refreshRoutes]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await supabase.signIn(email, password);
      setIsAuthenticated(true);
      await refreshRoutes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore login';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, refreshRoutes]);

  const signUp = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await supabase.signUp(email, password);
      console.log('[useSupabaseRoutes] ✅ Registrazione completata');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore registrazione';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await supabase.signOut();
      setIsAuthenticated(false);
      setRoutes([]);
      await refreshRoutes(); // Carica solo percorsi pubblici
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore logout';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, refreshRoutes]);

  // Carica percorsi all'inizio
  useEffect(() => {
    refreshRoutes();
  }, [refreshRoutes]);

  return {
    routes,
    isLoading,
    error,
    isAuthenticated,
    refreshRoutes,
    saveRoute,
    deleteRoute,
    signIn,
    signUp,
    signOut
  };
}

