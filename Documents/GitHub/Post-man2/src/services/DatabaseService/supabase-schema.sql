-- Schema Database Supabase per Post-man2
-- Esegui questo script nel SQL Editor di Supabase

-- ==================== TABELLA ROUTES ====================
-- Memorizza percorsi (predefiniti e personalizzati)
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_predefined BOOLEAN DEFAULT FALSE,
  route_data JSONB NOT NULL, -- RouteSegment serializzato
  stops JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array di Stop serializzati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_is_predefined ON routes(is_predefined);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere percorsi predefiniti
CREATE POLICY "Percorsi predefiniti visibili a tutti"
  ON routes FOR SELECT
  USING (is_predefined = TRUE);

-- Policy: Utenti autenticati possono leggere i propri percorsi
CREATE POLICY "Utenti possono leggere i propri percorsi"
  ON routes FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Utenti autenticati possono creare percorsi
CREATE POLICY "Utenti possono creare percorsi"
  ON routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Utenti possono aggiornare solo i propri percorsi
CREATE POLICY "Utenti possono aggiornare i propri percorsi"
  ON routes FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Utenti possono eliminare solo i propri percorsi
CREATE POLICY "Utenti possono eliminare i propri percorsi"
  ON routes FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== TABELLA USER_PREFERENCES ====================
-- Memorizza preferenze utente
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  map_style TEXT DEFAULT 'default',
  marker_size_base INTEGER DEFAULT 30,
  marker_size_scale NUMERIC DEFAULT 2.0,
  show_route_labels BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti possono leggere solo le proprie preferenze
CREATE POLICY "Utenti possono leggere le proprie preferenze"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Utenti possono inserire le proprie preferenze
CREATE POLICY "Utenti possono inserire le proprie preferenze"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Utenti possono aggiornare le proprie preferenze
CREATE POLICY "Utenti possono aggiornare le proprie preferenze"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ==================== FUNZIONI HELPER ====================

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per routes
DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== DATI INIZIALI (OPZIONALE) ====================
-- Inserisci percorsi predefiniti di esempio
-- NOTA: Modifica user_id con un UUID valido del sistema o NULL

-- Esempio: Percorso predefinito
-- INSERT INTO routes (user_id, name, description, is_predefined, route_data, stops)
-- VALUES (
--   NULL, -- o un user_id di sistema
--   'Percorso Centro Storico',
--   'Percorso turistico nel centro storico della città',
--   TRUE,
--   '{"name": "Centro Storico", "coordinates": [{"latitude": 45.0, "longitude": 9.0}]}'::jsonb,
--   '[{"id": "stop_1", "name": "Piazza Principale", "latitude": 45.0, "longitude": 9.0}]'::jsonb
-- );

-- ==================== VERIFICHE ====================
-- Verifica tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('routes', 'user_preferences');

-- Verifica RLS abilitato
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('routes', 'user_preferences');

