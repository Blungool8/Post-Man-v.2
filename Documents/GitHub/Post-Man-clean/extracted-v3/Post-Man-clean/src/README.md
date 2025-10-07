# App Percorsi Postali - Frontend Components

## 📱 Panoramica

Questo modulo contiene tutti i componenti frontend per l'applicazione Post-Man, sviluppata con React Native ed Expo per ottimizzare il lavoro dei postini.

## 🏗️ Architettura Frontend

### Componenti Principali

#### 1. **MapScreen** (`src/screens/MapScreen/MapScreen.js`)
- Schermata principale con mappa offline
- Integrazione completa con GPS tracking
- Modalità navigazione fullscreen
- Gestione marker dinamici per fermate

#### 2. **CustomStopMarker** (`src/components/Map/CustomStopMarker.js`)
- Marker personalizzati per fermate postali
- Animazioni dinamiche basate sulla distanza
- Stati visivi per fermate (pending, completed, failed, current)
- Indicatori di distanza per fermata più vicina

#### 3. **LocationPermissionHandler** (`src/components/LocationPermissionHandler.js`)
- Gestione completa permessi GPS
- UI per richiesta permessi e gestione errori
- Verifica stato GPS del dispositivo
- Overlay informativi per stati di errore

#### 4. **GPSStatusIndicator** (`src/components/GPSStatusIndicator.js`)
- Indicatore qualità segnale GPS in tempo reale
- Visualizzazione accuracy e stato connessione
- Colori dinamici basati sulla qualità del segnale

### Hooks Personalizzati

#### 1. **useDynamicNavigation** (`src/hooks/useDynamicNavigation.js`)
- Tracking GPS in tempo reale con ottimizzazioni performance
- Calcolo distanze e direzioni con formula Haversine
- Rendering dinamico marker basato su distanza utente
- Gestione stati GPS e errori

#### 2. **useNavigationMode** (`src/hooks/useDynamicNavigation.js`)
- Gestione modalità navigazione fullscreen
- Toggle tra modalità normale e navigazione
- Coordinamento con UI components

### Servizi

#### 1. **MapConfig** (`src/services/MapService/MapConfig.js`)
- Configurazione performance per React Native Maps
- Stili mappa semplificati per ottimizzazione
- Configurazione marker e regioni
- Parametri per rendering ottimizzato

## 🎨 Design System

### Palette Colori
- **Primario**: Giallo Poste (#FFD800)
- **Secondario**: Grigio scuro (#333333)
- **Successo**: Verde (#4CAF50)
- **Errore**: Rosso (#F44336)
- **Info**: Blu (#2196F3)

### Componenti UI
- **FAB**: Floating Action Button per azioni principali
- **Status Bar**: Informazioni navigazione in tempo reale
- **Permission Overlay**: Gestione permessi con design coerente
- **GPS Indicator**: Indicatore stato GPS con colori dinamici

## 🚀 Funzionalità Implementate

### ✅ Mappa Offline
- React Native Maps con provider Google
- Stili semplificati per performance massima
- Configurazione zoom e cache ottimizzata
- Supporto tiles offline (preparato per integrazione)

### ✅ GPS Tracking
- Tracking in tempo reale con accuracy configurabile
- Gestione permessi completa con UI dedicata
- Verifica stato GPS del dispositivo
- Gestione errori e stati di connessione

### ✅ Marker Dinamici
- Rendering dinamico basato su distanza utente
- Animazioni fluide per transizioni dimensioni
- Stati visivi per diversi tipi di fermata
- Indicatori distanza per fermata più vicina

### ✅ Modalità Navigazione
- Toggle fullscreen per navigazione
- Status bar con informazioni prossima fermata
- Indicatore direzione e distanza
- FAB per attivazione/disattivazione modalità

### ✅ Gestione Errori
- UI dedicata per permessi GPS
- Gestione stati di errore GPS
- Indicatori qualità segnale in tempo reale
- Fallback per stati di connessione

## 📱 Esperienza Utente

### Flusso Principale
1. **Avvio App**: Schermata home con overview funzionalità
2. **Apertura Mappa**: Transizione fluida alla mappa principale
3. **Richiesta Permessi**: Gestione automatica permessi GPS
4. **Tracking**: Visualizzazione posizione e fermate dinamiche
5. **Navigazione**: Modalità fullscreen per lavoro sul campo

### Ottimizzazioni Performance
- **Batch Updates**: Aggiornamenti posizione in animation frame
- **Memoization**: Componenti ottimizzati con React.memo
- **Region-based Rendering**: Solo marker visibili nel viewport
- **LRU Caching**: Cache intelligente per tiles e dati

## 🔧 Configurazione Tecnica

### Dipendenze Principali
```json
{
  "react-native-maps": "^1.7.1",
  "expo-location": "~16.1.0",
  "expo-sqlite": "~11.1.1"
}
```

### Configurazione Performance
- **Update Interval**: 1000ms per posizione GPS
- **Distance Filter**: 2m per aggiornamenti
- **Zoom Levels**: 12-18 per ottimizzazione rendering
- **Max Visible Radius**: 2000m per marker

## 📋 Task Completati (FrontendDev)

### ✅ FASE 2: Implementazione Mappa Offline
- [x] **Task 2.1.1**: Setup React Native Maps con configurazione performance
- [x] **Task 2.2.1**: Implementazione tracking GPS in tempo reale
- [x] **Task 2.2.2**: Gestione permessi location e stati GPS

### ✅ FASE 3.4: Modalità Navigazione Dinamica
- [x] **Task 3.4.1.1**: Implementazione FAB per modalità navigazione
- [x] **Task 3.4.1.2**: Gestione visualizzazione fullscreen mappa

## 🎯 Prossimi Passi

### Per BackendOps
- Setup SQLite con schema percorsi e tappe
- Implementazione servizio persistenza dati
- Preparazione per sincronizzazione cloud

### Per MapOps
- Integrazione TileServer GL per tiles offline
- Ottimizzazione rendering con clustering
- Preparazione dati mappa per area di test

### Per ProjectLead
- Testing integrazione su dispositivi reali
- Performance testing e ottimizzazione
- Preparazione release beta

## 📞 Supporto

Per domande o problemi relativi ai componenti frontend, contattare l'agente **FrontendDev**.

---

**Autore**: FrontendDev Agent  
**Data**: 28 Settembre 2025  
**Versione**: Beta 1.0 Frontend