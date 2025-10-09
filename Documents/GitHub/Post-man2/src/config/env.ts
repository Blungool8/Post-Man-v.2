/**
 * Configurazione Environment Variables
 * Gestisce variabili d'ambiente in modo sicuro per Expo
 */

import Constants from 'expo-constants';

interface EnvConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // OpenRouteService
  orsApiKey: string;
  orsProfile: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';
  
  // Marker Config
  markerBaseSize: number;
  markerMaxScale: number;
  markerMinScale: number;
  markerMaxDistance: number;
  
  // App Info
  isDevelopment: boolean;
}

/**
 * Carica configurazione da environment variables
 * Supporta:
 * - .env file (Expo)
 * - process.env (Node.js)
 * - expo-constants
 */
function loadConfig(): EnvConfig {
  // Prova a caricare da expo-constants (preferito per Expo)
  const expoConfig = Constants.expoConfig?.extra || {};
  
  // Fallback a process.env (per web e testing)
  const env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env as any : {};

  return {
    // Supabase
    supabaseUrl: expoConfig.supabaseUrl || env['SUPABASE_URL'] || '',
    supabaseAnonKey: expoConfig.supabaseAnonKey || env['SUPABASE_ANON_KEY'] || '',
    
    // OpenRouteService
    orsApiKey: expoConfig.orsApiKey || env['ORS_API_KEY'] || '',
    orsProfile: (expoConfig.orsProfile || env['ORS_PROFILE'] || 'driving-car') as any,
    
    // Marker Config
    markerBaseSize: parseInt(expoConfig.markerBaseSize || env['MARKER_BASE_SIZE'] || '30'),
    markerMaxScale: parseFloat(expoConfig.markerMaxScale || env['MARKER_MAX_SCALE'] || '2.5'),
    markerMinScale: parseFloat(expoConfig.markerMinScale || env['MARKER_MIN_SCALE'] || '0.5'),
    markerMaxDistance: parseInt(expoConfig.markerMaxDistance || env['MARKER_MAX_DISTANCE'] || '500'),
    
    // App Info
    isDevelopment: __DEV__
  };
}

const config = loadConfig();

// Validazione configurazione critica
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('⚠️ [ENV] Credenziali Supabase mancanti! Database non funzionerà.');
}

if (!config.orsApiKey) {
  console.warn('⚠️ [ENV] API Key OpenRouteService mancante! Routing userà fallback (linee rette).');
}

// Log configurazione (solo in development)
if (config.isDevelopment) {
  console.log('[ENV] Configurazione caricata:', {
    supabaseConfigured: !!config.supabaseUrl,
    orsConfigured: !!config.orsApiKey,
    orsProfile: config.orsProfile,
    markerConfig: {
      baseSize: config.markerBaseSize,
      maxScale: config.markerMaxScale,
      minScale: config.markerMinScale,
      maxDistance: config.markerMaxDistance
    }
  });
}

export default config;

