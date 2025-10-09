/**
 * Configurazione Expo con supporto variabili d'ambiente
 * Sostituisce app.json per permettere lettura da .env
 */

module.exports = {
  expo: {
    name: 'Post-Man',
    slug: 'post-man-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFD800'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.postman.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Questa app ha bisogno dell'accesso alla posizione per mostrare le fermate postali sulla mappa.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "Questa app ha bisogno dell'accesso alla posizione per il tracking GPS durante la navigazione."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFD800'
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.postman.app',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION'
      ]
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro'
    },
    updates: {
      enabled: false,
      fallbackToCacheTimeout: 0
    },
    runtimeVersion: {
      policy: 'sdkVersion'
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            "Questa app ha bisogno dell'accesso alla posizione per il tracking GPS durante la navigazione."
        }
      ],
      'expo-sqlite'
    ],
    extra: {
      // Variabili d'ambiente da .env
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      orsApiKey: process.env.ORS_API_KEY || '',
      orsProfile: process.env.ORS_PROFILE || 'driving-car',
      markerBaseSize: process.env.MARKER_BASE_SIZE || '30',
      markerMaxScale: process.env.MARKER_MAX_SCALE || '2.5',
      markerMinScale: process.env.MARKER_MIN_SCALE || '0.5',
      markerMaxDistance: process.env.MARKER_MAX_DISTANCE || '500',
      
      // Flag per verificare caricamento
      envConfigured: true
    }
  }
};

