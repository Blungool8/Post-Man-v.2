/**
 * Type definitions per variabili d'ambiente
 * Supporta import da @env (react-native-dotenv)
 */

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const ORS_API_KEY: string;
  export const ORS_PROFILE: string;
  export const MARKER_BASE_SIZE: string;
  export const MARKER_MAX_SCALE: string;
  export const MARKER_MIN_SCALE: string;
  export const MARKER_MAX_DISTANCE: string;
}

// Estendi NodeJS.ProcessEnv per supportare process.env
declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    ORS_API_KEY?: string;
    ORS_PROFILE?: string;
    MARKER_BASE_SIZE?: string;
    MARKER_MAX_SCALE?: string;
    MARKER_MIN_SCALE?: string;
    MARKER_MAX_DISTANCE?: string;
  }
}

