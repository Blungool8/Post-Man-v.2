# 🚀 Guida Setup Post-man2

Questa guida ti aiuterà a configurare l'applicazione Post-man2 con tutte le funzionalità avanzate implementate.

## 📋 Prerequisiti

- Node.js 16+ installato
- Expo CLI (`npm install -g expo-cli`)
- Account Supabase (gratuito)
- API Key OpenRouteService (gratuita)

## 🔧 Setup Passo-Passo

### 1. Installa Dipendenze

```bash
npm install
```

Questo installerà tutte le dipendenze necessarie, incluse:
- `@supabase/supabase-js` - Client database
- `expo-constants` - Gestione environment variables
- `react-native-dotenv` - Supporto .env file

### 2. Configura Supabase

#### a) Crea Progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea un account gratuito
3. Crea un nuovo progetto
4. Annota:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: trovalo in Settings → API

#### b) Crea Schema Database

1. In Supabase Dashboard, vai su **SQL Editor**
2. Copia e incolla il contenuto del file `src/services/DatabaseService/supabase-schema.sql`
3. Clicca **Run** per eseguire lo script
4. Verifica che le tabelle siano state create:
   - `routes` - Percorsi salvati
   - `user_preferences` - Preferenze utente

### 3. Ottieni API Key OpenRouteService

1. Vai su [openrouteservice.org/dev/#/signup](https://openrouteservice.org/dev/#/signup)
2. Crea un account gratuito
3. Richiedi una **Free API Key**
4. Limiti gratuiti:
   - 2000 richieste/giorno
   - 40 richieste/minuto

### 4. Configura Environment Variables

#### a) Crea file .env

Copia il file di esempio e rinominalo:

```bash
cp env.example .env
```

#### b) Compila il file .env

Apri `.env` e inserisci le tue credenziali:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...your-anon-key-here

# OpenRouteService
ORS_API_KEY=5b3ce3597851110001cf6248your-key-here

# Configurazione Opzionale (puoi lasciare i valori di default)
ORS_PROFILE=driving-car
MARKER_BASE_SIZE=30
MARKER_MAX_SCALE=2.5
MARKER_MIN_SCALE=0.5
MARKER_MAX_DISTANCE=500
```

### 5. Avvia l'Applicazione

#### Web

```bash
npm run web
```

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

## 🎯 Funzionalità Implementate

### ✅ 1. Conversione KML → GeoJSON
- File: `src/services/KMLService/KMLToGeoJSON.ts`
- Converte automaticamente file KML in formato GeoJSON
- Supporta LineString (percorsi) e Point (fermate)

### ✅ 2. Routing su Strada (OpenRouteService)
- File: `src/services/RoutingService/RoutingService.ts`
- Calcola percorsi seguendo strade reali
- Fallback automatico a linee rette se API non disponibile
- Cache interno per ridurre chiamate API

### ✅ 3. Database Online (Supabase)
- File: `src/services/DatabaseService/SupabaseService.ts`
- Autenticazione utenti
- Salvataggio/caricamento percorsi
- Percorsi predefiniti condivisi
- Preferenze utente personalizzate

### ✅ 4. Marker Dinamici GPS-driven
- File: `src/components/Map/DynamicStopMarker.tsx`
- Marker si ingrandiscono quando ti avvicini
- Animazioni smooth
- Label visibili solo quando vicini
- Basati su posizione GPS in tempo reale

### ✅ 5. MapScreen Migliorata
- File: `src/screens/MapScreen/MapScreenV3Enhanced.tsx`
- Toggle percorsi su strada vs linee rette
- Visualizzazione marker GPS-driven
- Integrazione database
- UI minimal e pulita

## 🧪 Test Funzionalità

### Test 1: Caricamento KML
1. Avvia l'app
2. Seleziona una zona
3. Verifica che il percorso venga visualizzato

### Test 2: Routing su Strada
1. Nel MapScreen, attiva "Percorsi su strada"
2. Verifica che il percorso segua le strade (blu)
3. Disattiva per vedere linee rette (arancione)

### Test 3: Marker Dinamici
1. Attiva GPS sul dispositivo
2. Avvicinati a una fermata
3. Osserva il marker ingrandirsi
4. Allontanati e osservalo rimpicciolirsi

### Test 4: Database
1. Registrati con email/password
2. Salva un percorso
3. Riavvia l'app
4. Verifica che il percorso sia ancora presente

## 🐛 Troubleshooting

### Errore: "Supabase credentials mancanti"
- Verifica di aver creato il file `.env`
- Controlla che le credenziali siano corrette
- Riavvia il server Expo (`npm run web`)

### Errore: "OpenRouteService API error"
- Verifica la API Key in `.env`
- Controlla di non aver superato il limite giornaliero
- L'app userà automaticamente il fallback (linee rette)

### Marker non si ingrandiscono
- Verifica permessi GPS
- Controlla che la posizione GPS sia attiva
- Avvicinati di più (raggio default: 500m)

### Percorsi non vengono salvati
- Verifica di essere loggato
- Controlla connessione internet
- Verifica che lo schema database sia stato creato correttamente

## 📚 Documentazione File Chiave

### Configurazione
- `src/config/env.ts` - Gestione environment variables
- `app.json` - Configurazione Expo
- `package.json` - Dipendenze

### Servizi
- `src/services/KMLService/` - Parsing e conversione KML
- `src/services/RoutingService/` - Calcolo percorsi su strada
- `src/services/DatabaseService/` - Database Supabase

### Componenti
- `src/components/Map/DynamicStopMarker.tsx` - Marker GPS-driven
- `src/components/Map/RouteRenderer.tsx` - Rendering percorsi

### Hook
- `src/hooks/useRoadRouting.ts` - Hook routing su strada
- `src/hooks/useSupabaseRoutes.ts` - Hook database
- `src/hooks/useZoneData.ts` - Hook caricamento zone

### Screens
- `src/screens/MapScreen/MapScreenV3Enhanced.tsx` - MapScreen migliorata
- `src/screens/MapScreen/MapScreenV3.tsx` - MapScreen originale

## 🎨 Personalizzazione

### Cambia colore percorsi
File: `src/screens/MapScreen/MapScreenV3Enhanced.tsx`
```tsx
<Polyline
  strokeColor="#YOUR_COLOR_HERE"
  strokeWidth={4}
/>
```

### Cambia dimensione marker
File: `.env`
```env
MARKER_BASE_SIZE=40  # Aumenta dimensione base
MARKER_MAX_SCALE=3.0  # Ingrandimento massimo
```

### Cambia raggio marker visibili
File: `.env`
```env
MARKER_MAX_DISTANCE=1000  # 1km invece di 500m
```

## 📞 Supporto

Per problemi o domande:
1. Controlla questa guida
2. Verifica i log in console
3. Controlla la documentazione Supabase/OpenRouteService

## 🚀 Prossimi Passi

1. ✅ Setup base completato
2. ⏳ Crea account utente
3. ⏳ Importa primi percorsi
4. ⏳ Testa su dispositivo reale
5. ⏳ Personalizza stile e colori

Buon lavoro! 🎉

