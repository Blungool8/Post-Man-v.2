/**
 * SupabaseService - Servizio per database online
 * Gestisce:
 * - Autenticazione utenti
 * - Salvataggio percorsi predefiniti
 * - Gestione fermate/marker
 * - Preferenze utente
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { ParsedKML, Stop, RouteSegment } from '../KMLService/KMLParser';

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface SavedRoute {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_predefined: boolean; // true = percorso predefinito dell'app
  route_data: RouteSegment;
  stops: Stop[];
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  map_style: string;
  marker_size_base: number;
  marker_size_scale: number;
  show_route_labels: boolean;
  updated_at: string;
}

class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser: User | null = null;

  constructor(config: DatabaseConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    console.log('[SupabaseService] Inizializzato');
    
    // Ascolta cambio auth
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      console.log(`[SupabaseService] Auth: ${event}`, this.currentUser?.email);
    });
  }

  // ==================== AUTENTICAZIONE ====================

  /**
   * Registra nuovo utente
   */
  async signUp(email: string, password: string) {
    console.log('[SupabaseService] Registrazione utente:', email);
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('[SupabaseService] Errore registrazione:', error);
      throw error;
    }

    console.log('[SupabaseService] ✅ Utente registrato');
    return data;
  }

  /**
   * Login utente
   */
  async signIn(email: string, password: string) {
    console.log('[SupabaseService] Login utente:', email);
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('[SupabaseService] Errore login:', error);
      throw error;
    }

    this.currentUser = data.user;
    console.log('[SupabaseService] ✅ Login effettuato');
    return data;
  }

  /**
   * Logout utente
   */
  async signOut() {
    console.log('[SupabaseService] Logout...');
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      console.error('[SupabaseService] Errore logout:', error);
      throw error;
    }

    this.currentUser = null;
    console.log('[SupabaseService] ✅ Logout effettuato');
  }

  /**
   * Ottieni utente corrente
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Controlla se utente è loggato
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // ==================== PERCORSI ====================

  /**
   * Salva nuovo percorso
   */
  async saveRoute(
    name: string,
    route: RouteSegment,
    stops: Stop[],
    isPredefined: boolean = false,
    description?: string
  ): Promise<SavedRoute> {
    if (!this.currentUser) {
      throw new Error('Utente non autenticato');
    }

    console.log('[SupabaseService] Salvataggio percorso:', name);

    const routeData = {
      user_id: this.currentUser.id,
      name,
      description,
      is_predefined: isPredefined,
      route_data: route,
      stops: stops,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('routes')
      .insert(routeData)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseService] Errore salvataggio percorso:', error);
      throw error;
    }

    console.log('[SupabaseService] ✅ Percorso salvato:', data.id);
    return data;
  }

  /**
   * Ottieni tutti i percorsi dell'utente + percorsi predefiniti
   */
  async getRoutes(includePublic: boolean = true): Promise<SavedRoute[]> {
    console.log('[SupabaseService] Caricamento percorsi...');

    let query = this.supabase.from('routes').select('*');

    if (this.currentUser) {
      // Percorsi dell'utente + percorsi predefiniti
      if (includePublic) {
        query = query.or(`user_id.eq.${this.currentUser.id},is_predefined.eq.true`);
      } else {
        query = query.eq('user_id', this.currentUser.id);
      }
    } else {
      // Solo percorsi predefiniti se non loggato
      query = query.eq('is_predefined', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseService] Errore caricamento percorsi:', error);
      throw error;
    }

    console.log(`[SupabaseService] ✅ Caricati ${data?.length || 0} percorsi`);
    return data || [];
  }

  /**
   * Ottieni percorso per ID
   */
  async getRoute(routeId: string): Promise<SavedRoute | null> {
    console.log('[SupabaseService] Caricamento percorso:', routeId);

    const { data, error } = await this.supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (error) {
      console.error('[SupabaseService] Errore caricamento percorso:', error);
      return null;
    }

    return data;
  }

  /**
   * Aggiorna percorso esistente
   */
  async updateRoute(
    routeId: string,
    updates: Partial<Pick<SavedRoute, 'name' | 'description' | 'route_data' | 'stops'>>
  ): Promise<SavedRoute> {
    if (!this.currentUser) {
      throw new Error('Utente non autenticato');
    }

    console.log('[SupabaseService] Aggiornamento percorso:', routeId);

    const { data, error } = await this.supabase
      .from('routes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', routeId)
      .eq('user_id', this.currentUser.id) // Solo i propri percorsi
      .select()
      .single();

    if (error) {
      console.error('[SupabaseService] Errore aggiornamento percorso:', error);
      throw error;
    }

    console.log('[SupabaseService] ✅ Percorso aggiornato');
    return data;
  }

  /**
   * Elimina percorso
   */
  async deleteRoute(routeId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Utente non autenticato');
    }

    console.log('[SupabaseService] Eliminazione percorso:', routeId);

    const { error } = await this.supabase
      .from('routes')
      .delete()
      .eq('id', routeId)
      .eq('user_id', this.currentUser.id); // Solo i propri percorsi

    if (error) {
      console.error('[SupabaseService] Errore eliminazione percorso:', error);
      throw error;
    }

    console.log('[SupabaseService] ✅ Percorso eliminato');
  }

  // ==================== FERMATE ====================

  /**
   * Aggiungi fermata a un percorso
   */
  async addStopToRoute(routeId: string, stop: Stop): Promise<SavedRoute> {
    const route = await this.getRoute(routeId);
    if (!route) throw new Error('Percorso non trovato');

    const updatedStops = [...route.stops, stop];
    return this.updateRoute(routeId, { stops: updatedStops });
  }

  /**
   * Rimuovi fermata da un percorso
   */
  async removeStopFromRoute(routeId: string, stopId: string): Promise<SavedRoute> {
    const route = await this.getRoute(routeId);
    if (!route) throw new Error('Percorso non trovato');

    const updatedStops = route.stops.filter(s => s.id !== stopId);
    return this.updateRoute(routeId, { stops: updatedStops });
  }

  // ==================== PREFERENZE UTENTE ====================

  /**
   * Ottieni preferenze utente
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    if (!this.currentUser) return null;

    console.log('[SupabaseService] Caricamento preferenze...');

    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .single();

    if (error) {
      // Se non esistono, crea preferenze default
      if (error.code === 'PGRST116') {
        return this.createDefaultPreferences();
      }
      console.error('[SupabaseService] Errore caricamento preferenze:', error);
      return null;
    }

    return data;
  }

  /**
   * Crea preferenze default
   */
  private async createDefaultPreferences(): Promise<UserPreferences> {
    if (!this.currentUser) throw new Error('Utente non autenticato');

    const defaults: UserPreferences = {
      user_id: this.currentUser.id,
      theme: 'auto',
      map_style: 'default',
      marker_size_base: 30,
      marker_size_scale: 2.0,
      show_route_labels: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('user_preferences')
      .insert(defaults)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseService] Errore creazione preferenze:', error);
      throw error;
    }

    return data;
  }

  /**
   * Aggiorna preferenze utente
   */
  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    if (!this.currentUser) {
      throw new Error('Utente non autenticato');
    }

    console.log('[SupabaseService] Aggiornamento preferenze...');

    const { data, error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: this.currentUser.id,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[SupabaseService] Errore aggiornamento preferenze:', error);
      throw error;
    }

    console.log('[SupabaseService] ✅ Preferenze aggiornate');
    return data;
  }

  // ==================== UTILITÀ ====================

  /**
   * Test connessione database
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('routes').select('count').limit(1);
      if (error) throw error;
      console.log('[SupabaseService] ✅ Connessione OK');
      return true;
    } catch (error) {
      console.error('[SupabaseService] ❌ Errore connessione:', error);
      return false;
    }
  }
}

export default SupabaseService;

