# Planning Dettagliato – App Percorsi Postali
## Versione Beta 1.0 - Architettura Multi-Agente

---

## 1. Architettura Generale Rielaborata

### 1.1 Approccio Incrementale

L'architettura è progettata per supportare uno sviluppo incrementale che parte da una versione beta semplificata e scala verso una soluzione enterprise completa. Questo approccio permette di validare rapidamente il concept e raccogliere feedback utente prezioso.

**Fase Beta**: Architettura monolitica semplificata con persistenza locale
**Fase Scalabile**: Architettura distribuita con microservizi e cloud backend

### 1.2 Stack Tecnologico Beta

**Frontend Mobile**
- Framework: React Native 0.72+ con Expo SDK 49+
- Gestione Stato: Zustand (più leggero di Redux per MVP)
- Navigazione: React Navigation 6
- Mappa: react-native-maps con tile offline personalizzati
- Storage Locale: expo-sqlite per dati strutturati, AsyncStorage per preferenze
- GPS: expo-location con background location

**Gestione Mappa Offline**
- Formato Dati: File .osm.pbf ottimizzato (< 50MB per area test)
- Rendering: Mapbox GL JS o Leaflet con plugin offline
- Tile Generation: Utilizzo di TileServer GL per generare tile da .osm.pbf
- Caching: Tile cache locale con gestione LRU

**Persistenza Dati Beta**
- Database Locale: SQLite con schema semplificato
- Backup: Export/Import JSON per trasferimento dati
- Sync Preparazione: Struttura dati compatibile con future API REST

### 1.3 Stack Tecnologico Scalabile

**Backend (Supabase)**
- Database: PostgreSQL 14+ con estensioni PostGIS per dati geografici
- Autenticazione: Supabase Auth + Clerk integration
- Storage: Supabase Storage per allegati e backup mappa
- Realtime: Supabase Realtime per notifiche collaborative
- Edge Functions: Deno runtime per logica business custom

**Autenticazione (Clerk)**
- Provider: Email/password, Google, Apple ID
- Gestione Ruoli: RBAC con ruoli custom (Postino, Admin, Supervisore)
- Sessioni: JWT con refresh token automatico
- Sicurezza: 2FA opzionale, device fingerprinting

---

## 2. Architettura Componenti Frontend

### 2.1 Struttura Modulare

```
src/
├── components/           # Componenti UI riutilizzabili
│   ├── Map/             # Componenti mappa
│   ├── Route/           # Gestione percorsi
│   ├── UI/              # Componenti base (Button, Input, etc.)
│   └── Navigation/      # Componenti navigazione
├── screens/             # Schermate principali
│   ├── MapScreen/       # Schermata mappa principale
│   ├── RouteScreen/     # Gestione percorsi
│   └── SettingsScreen/  # Impostazioni
├── services/            # Logica business e API
│   ├── MapService/      # Gestione mappa e GPS
│   ├── RouteService/    # Logica percorsi
│   ├── StorageService/  # Persistenza dati
│   └── SyncService/     # Sincronizzazione (future)
├── utils/               # Utility e helper
├── hooks/               # Custom React hooks
└── types/               # TypeScript definitions
```

### 2.2 Gestione Stato

**Store Zustand Structure**:
```typescript
interface AppState {
  // Stato mappa
  map: {
    center: [number, number];
    zoom: number;
    userLocation: Location | null;
    isLoading: boolean;
  };
  
  // Stato percorsi
  routes: {
    current: Route | null;
    stops: Stop[];
    completedStops: string[];
  };
  
  // Stato UI
  ui: {
    activeScreen: string;
    bottomSheetOpen: boolean;
    notifications: Notification[];
  };
}
```

---

## 3. Gestione Mappa Offline Dettagliata - ARCHITETTURA OTTIMIZZATA

**Stack Definitivo:**
```typescript
const mapArchitecture = {
  core: "react-native-maps",
  tiles: "TileServer GL + MBTiles", 
  offline: "expo-file-system + SQLite",
  performance: "Custom markers + optimized rendering",
  navigation: "expo-location + background updates"
}
```

**Configurazione Performance Critica:**
```typescript
// React Native Maps performance tuning
<MapView
  provider={PROVIDER_GOOGLE}
  customMapStyle={simplifiedMapStyle} // Style performance-optimized
  showsUserLocation={true}
  followsUserLocation={true}
  rotateEnabled={false} // Migliora performance
  cacheEnabled={true}
  maxZoomLevel={18}
  minZoomLevel={12}
>
  {optimizedMarkers}
</MapView>
```

**Strategia Rendering Dinamico:**
- Memoizzazione componenti marker
- Visibility calculation based on viewport
- Predictive rendering per animazioni fluide
- Memory management con garbage collection

### 3.2 Integrazione Mappa nel Frontend

**Configurazione react-native-maps**:
```typescript
interface MapConfig {
  provider: 'google' | 'apple' | 'osm';
  tileUrlTemplate: string;
  maxZoom: number;
  minZoom: number;
  cacheSize: number;
}

const mapConfig: MapConfig = {
  provider: 'osm',
  tileUrlTemplate: 'file:///android_asset/tiles/{z}/{x}/{y}.png',
  maxZoom: 18,
  minZoom: 10,
  cacheSize: 100 // MB
};
```

### 3.3 Gestione Performance Mappa

**Ottimizzazioni**:
- Lazy loading dei tile non visibili
- Preloading dei tile adiacenti
- Gestione memoria con LRU cache
- Rendering asincrono per UI fluida

---

## 4. Database Schema e Persistenza

### 4.1 Schema SQLite Beta

```sql
-- Tabella percorsi
CREATE TABLE routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella tappe
CREATE TABLE stops (
  id TEXT PRIMARY KEY,
  route_id TEXT REFERENCES routes(id),
  name TEXT NOT NULL,
  address TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  notes TEXT,
  completed_at DATETIME
);

-- Tabella sessioni utente
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  route_id TEXT REFERENCES routes(id),
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  total_distance REAL,
  total_time INTEGER -- secondi
);
```

### 4.2 Schema PostgreSQL Scalabile

```sql
-- Estensione per dati geografici
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabella utenti (sincronizzata con Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'postino',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella percorsi con RLS
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  geometry GEOMETRY(LINESTRING, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own routes" ON routes
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 5. Workflow Multi-Agente

### 5.1 Assegnazione Responsabilità

**Agente Frontend (FrontendDev)**:
- Sviluppo componenti UI React Native
- Integrazione mappa offline
- Gestione stato applicazione
- Implementazione navigazione
- Testing UI/UX

**Agente Backend (BackendOps)**:
- Configurazione Supabase
- Sviluppo Edge Functions
- Gestione database schema
- Implementazione RLS policies
- Setup CI/CD pipeline

**Agente Mappa (MapOps)**:
- Preparazione dati .osm.pbf
- Ottimizzazione tile generation
- Integrazione librerie mappatura
- Performance tuning mappa
- Gestione aggiornamenti cartografici

**Agente Coordinatore (ProjectLead)**:
- Gestione merge e conflitti Git
- Revisione codice cross-team
- Coordinamento rilasci
- Gestione documentazione condivisa
- Quality assurance

### 5.2 Processo di Sviluppo

**Workflow Git**:
```
main (produzione)
├── develop (integrazione)
│   ├── feature/frontend-map-integration
│   ├── feature/backend-auth-setup
│   └── feature/map-offline-optimization
└── hotfix/critical-bug-fix
```

**Processo di Merge**:
1. Feature branch → develop (review automatica + manuale)
2. develop → staging (testing automatico)
3. staging → main (approvazione ProjectLead)

### 5.3 Sincronizzazione Lavoro

**Daily Sync**:
- Aggiornamento stato task in Tasks_dettagliati.md
- Commit con reference a task ID
- Update documentazione tecnica
- Segnalazione blocchi o dipendenze

**Weekly Review**:
- Demo funzionalità completate
- Review architetturale
- Planning sprint successivo
- Aggiornamento roadmap

---

## 6. Testing Strategy

### 6.1 Testing Pyramid

**Unit Tests (70%)**:
- Logica business (services)
- Utility functions
- Custom hooks
- Componenti isolati

**Integration Tests (20%)**:
- Flussi completi (login → mappa → percorso)
- Integrazione database
- API calls e responses

**E2E Tests (10%)**:
- Scenari utente critici
- Performance testing
- Compatibilità dispositivi

### 6.2 Testing Tools

**Frontend**:
- Jest + React Native Testing Library
- Detox per E2E testing
- Flipper per debugging

**Backend**:
- Supabase CLI per testing locale
- Postman/Insomnia per API testing
- pgTAP per database testing

### 6.3 Performance Testing

**Metriche Target**:
- App startup: < 3s
- Map loading: < 5s
- Route calculation: < 2s
- Memory usage: < 200MB
- Battery drain: < 5%/hour

---

## 7. Deployment e CI/CD

### 7.1 Pipeline Beta

```yaml
# .github/workflows/beta-deploy.yml
name: Beta Deployment
on:
  push:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Android APK
        run: expo build:android --type apk
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to TestFlight/Internal Testing
        run: expo upload:android
```

### 7.2 Pipeline Produzione

**Staging Environment**:
- Deploy automatico da develop
- Testing automatico completo
- Review manuale obbligatoria

**Production Environment**:
- Deploy manuale da main
- Rollback automatico in caso di errori
- Monitoring e alerting

---

## 8. Monitoring e Logging

### 8.1 Application Monitoring

**Tools**:
- Sentry per error tracking
- Flipper per development debugging
- Firebase Analytics per usage metrics

**Metriche Chiave**:
- Crash rate (< 0.1%)
- ANR rate (< 0.05%)
- App startup time
- Memory leaks
- Network errors

### 8.2 Business Metrics

**User Engagement**:
- Daily/Monthly active users
- Session duration
- Feature adoption rate
- User retention

**Performance Metrics**:
- Route completion rate
- Average route time
- GPS accuracy
- Offline usage patterns

---

## 9. Sicurezza e Privacy

### 9.1 Data Protection

**Dati Sensibili**:
- Posizione GPS: Crittografia AES-256
- Dati utente: Hashing con salt
- Comunicazioni: TLS 1.3

**Privacy Compliance**:
- GDPR compliance per utenti EU
- Consenso esplicito per location tracking
- Right to be forgotten implementation

### 9.2 Security Measures

**Authentication**:
- JWT con short expiration
- Refresh token rotation
- Device fingerprinting

**API Security**:
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

---

## 10. Roadmap Tecnica

### 10.1 Beta Release (Settimana 1-4)

**Settimana 1-2**:
- Setup progetto e architettura base
- Integrazione mappa offline basilare
- UI/UX essenziale

**Settimana 3-4**:
- Gestione percorsi e tappe
- Testing e bug fixing
- Preparazione release beta

### 10.2 V1.0 Release (Settimana 5-12)

**Settimana 5-8**:
- Integrazione Clerk + Supabase
- Migrazione da storage locale a cloud
- Multi-user support

**Settimana 9-12**:
- Funzionalità collaborative
- Performance optimization
- Production deployment

### 10.3 Future Releases

**V1.5**: AI-powered route optimization
**V2.0**: Enterprise integration
**V2.5**: Advanced analytics e reporting

---

**Autore**: Senior Software Developer  
**Data**: 28 Settembre 2025  
**Versione**: Beta 1.0




## 2.3 Modalità Navigazione Dinamica (Nuova Sezione)

### 2.3.1 Logica di Rendering Dinamico dei Marker

Per implementare l'evidenziazione dinamica delle fermate, sarà necessario sviluppare una logica che calcoli in tempo reale la distanza di ogni fermata dalla posizione attuale dell'utente. Questa distanza verrà utilizzata per determinare la dimensione del marker sulla mappa e la sua visibilità.

- **Calcolo Distanza**: Utilizzo di funzioni geospaziali (es. Haversine formula) per calcolare la distanza tra la posizione GPS dell'utente e le coordinate di ogni fermata.
- **Algoritmo di Scaling**: Definizione di una funzione di scaling che, in base alla distanza, determinerà la dimensione del marker. Le fermate entro un certo raggio (es. 500m) verranno ingrandite progressivamente, mentre quelle oltre un raggio massimo (es. 2km) verranno nascoste.
- **Ottimizzazione Rendering**: Per garantire fluidità, il rendering dei marker dovrà essere ottimizzato. Si valuterà l'uso di tecniche come il clustering dei marker per le aree più dense e il debouncing degli aggiornamenti di posizione per ridurre i ricalcoli eccessivi.

### 2.3.2 Integrazione UI/UX

- **Tasto di Attivazione**: Un Floating Action Button (FAB) sarà implementato per attivare/disattivare la modalità navigazione. Questo FAB cambierà icona e colore per indicare lo stato corrente.
- **Mappa Fullscreen**: All'attivazione, la mappa occuperà l'intera area dello schermo, nascondendo altri elementi UI non essenziali per la navigazione. Questo richiederà la gestione dello stato della UI per nascondere/mostrare dinamicamente i componenti.
- **Feedback Visivo**: Oltre allo scaling dei marker, si potranno implementare animazioni leggere o effetti visivi per rendere più evidente l'ingrandimento/rimpicciolimento delle fermate.


