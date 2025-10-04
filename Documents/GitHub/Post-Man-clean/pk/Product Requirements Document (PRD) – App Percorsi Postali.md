# Product Requirements Document (PRD) – App Percorsi Postali
## Versione Beta 1.0 - Rielaborata per Sviluppo Multi-Agente

---

## 1. Introduzione e Obiettivi

Questo documento definisce i requisiti per lo sviluppo di un'applicazione mobile **"App Percorsi Postali"** progettata per ottimizzare il lavoro dei postini. L'approccio di sviluppo è strutturato in **fasi incrementali** con focus iniziale su una **versione beta** utilizzabile da un singolo utente per test e validazione del concept.

### 1.1 Strategia di Sviluppo a Fasi

**Versione Beta (MVP)**: Applicazione funzionante per un singolo postino con funzionalità essenziali di mappatura offline e gestione percorsi basilare.

**Versione 1.0**: Estensione multi-utente con autenticazione completa e sincronizzazione dati.

**Versioni Future**: Funzionalità avanzate di collaborazione, AI per ottimizzazione percorsi, e integrazione enterprise.

### 1.2 Obiettivi Specifici Beta

- **Validazione Concept**: Testare l'usabilità della mappa offline e la gestione percorsi con un utente reale
- **Proof of Concept Tecnico**: Validare l'architettura scelta e le librerie di mappatura offline
- **Feedback Loop Rapido**: Raccogliere feedback per iterazioni successive
- **Base Scalabile**: Struttura architettonica che permetta l'espansione senza refactoring maggiori

---

## 2. Architettura Beta vs Scalabile

### 2.1 Architettura Beta (Semplificata)

**Frontend**: React Native con Expo
- Mappa offline locale (file .osm.pbf ridotto per area di test)
- Storage locale SQLite per dati utente
- Nessuna autenticazione (utente singolo)
- UI essenziale per navigazione e gestione percorsi

**Backend**: Minimale o assente
- Dati persistiti localmente
- Nessuna sincronizzazione cloud iniziale
- API mock per future integrazioni

### 2.2 Architettura Scalabile (Target)

**Frontend**: React Native + Expo (invariato)
**Backend**: Supabase (PostgreSQL + Storage + Realtime)
**Autenticazione**: Clerk
**Sincronizzazione**: Offline-first con sync cloud

---

## 3. Funzionalità Beta (MVP)

### 3.1 Mappatura Offline ⭐ PRIORITÀ MASSIMA - ARCHITETTURA OTTIMIZZATA

**Stack Tecnologico Definitivo:**
- **Mappa**: React Native Maps con provider Google (performance ottimale)
- **Tiles Offline**: TileServer GL + MBTiles format (< 50MB area test)
- **Rendering**: Custom React Native Components per marker
- **Storage**: SQLite + AsyncStorage per dati strutturati
- **GPS**: expo-location con background tracking

**Implementazione Performance:**
- Update posizione: 1000ms interval, 2m distance filter
- Batch marker updates con requestAnimationFrame
- Region-based rendering (solo marker visibili)
- LRU caching per tiles e dati mappa

**Modalità Offline Completa:**
- App funziona completamente senza connessione
- Tiles pre-packaged nell'app bundle
- Dati percorsi persistiti localmente
- GPS indipendente da rete cellulare

### 3.2 Gestione Percorsi Basilare

**Requisiti Beta**:
- Caricamento percorso da file JSON/CSV
- Visualizzazione tappe come marker sulla mappa
- Marcatura tappa come "completata" con tap
- Lista tappe con stato (da fare/completata)

**Implementazione**:
- Struttura dati semplice per percorsi e tappe
- Persistenza locale con AsyncStorage o SQLite
- UI minimale ma funzionale

### 3.3 Navigazione Essenziale

**Requisiti Beta**:
- Calcolo distanza lineare tra posizione attuale e prossima tappa
- Indicazione direzione approssimativa
- Highlight tappa più vicina

**Implementazione**:
- Algoritmi di calcolo distanza geografica
- UI per indicazioni direzionali basilari
- Nessun routing complesso inizialmente

---

## 4. Funzionalità Scalabili (Post-Beta)

### 4.1 Autenticazione e Multi-Utente
- Integrazione Clerk per gestione utenti
- Ruoli (Postino, Amministratore, Supervisore)
- Profili utente personalizzabili

### 4.2 Backend e Sincronizzazione
- Database Supabase con RLS
- Sincronizzazione offline-online
- Storage cloud per allegati

### 4.3 Funzionalità Avanzate
- Routing ottimizzato con OSRM/GraphHopper
- Note collaborative tra postini
- Statistiche e reportistica
- Notifiche push
- Machine learning per ottimizzazione

---

## 5. Requisiti Tecnici Beta

### 5.1 Performance
- Avvio app < 3 secondi
- Caricamento mappa < 5 secondi
- Risposta UI < 100ms per azioni basilari
- Consumo batteria ottimizzato

### 5.2 Compatibilità
- Android 8.0+ (API 26+)
- iOS 12.0+
- Dispositivi con almeno 3GB RAM

### 5.3 Storage
- Spazio richiesto: < 100MB (app + mappa)
- Dati utente: < 10MB

---

## 6. Design e UX Beta

### 6.1 Principi Design
- **Semplicità**: UI minimale ma funzionale
- **Chiarezza**: Informazioni essenziali sempre visibili
- **Efficienza**: Minimo numero di tap per azioni comuni

### 6.2 Palette Colori
- Primario: Giallo Poste (#FFD800)
- Secondario: Grigio scuro (#333333)
- Accento: Verde successo (#4CAF50), Rosso errore (#F44336)
- Sfondo: Bianco (#FFFFFF), Grigio chiaro (#F5F5F5)

### 6.3 Layout Principale
- **Schermata Mappa**: 80% dello schermo
- **Pannello Tappe**: Drawer scorrevole dal basso
- **Controlli**: FAB per azioni principali
- **Status Bar**: Informazioni percorso corrente

---

## 7. Criteri di Successo Beta

### 7.1 Metriche Tecniche
- App stabile (< 1 crash per sessione)
- Mappa fluida (60fps durante navigazione)
- Precisione GPS (< 10m di errore)

### 7.2 Metriche Utente
- Completamento percorso test in < 2 ore
- Feedback utente positivo (> 7/10)
- Identificazione di almeno 3 miglioramenti prioritari

### 7.3 Metriche Sviluppo
- Codebase pulito e documentato
- Architettura estendibile senza refactoring
- Test coverage > 70% per logica core

---

## 8. Roadmap Post-Beta

### 8.1 Versione 1.0 (Entro 3 mesi)
- Autenticazione Clerk
- Backend Supabase
- Multi-utente basilare
- Sincronizzazione cloud

### 8.2 Versione 1.5 (Entro 6 mesi)
- Routing avanzato
- Note collaborative
- Statistiche dettagliate

### 8.3 Versione 2.0 (Entro 12 mesi)
- AI per ottimizzazione
- Integrazione enterprise
- Analytics avanzate

---

## 9. Considerazioni per Sviluppo Multi-Agente

### 9.1 Modularità
- Componenti indipendenti per mappa, percorsi, UI
- API interne ben definite
- Separazione chiara delle responsabilità

### 9.2 Documentazione
- Ogni modulo deve avere README specifico
- API documentation aggiornata automaticamente
- Esempi di utilizzo per ogni componente

### 9.3 Testing
- Unit test per ogni modulo
- Integration test per flussi principali
- E2E test per scenari utente critici

---

**Autore**: Senior Software Developer  
**Data**: 28 Settembre 2025  
**Versione**: Beta 1.0




## 3.4.1 Modalità Navigazione Dinamica ⭐ NUOVA FUNZIONALITÀ

**Requisiti Beta**:
- **Attivazione**: Un tasto dedicato nell'interfaccia utente (es. Floating Action Button) permetterà all'utente di attivare la 


modalità navigazione.
- **Mappa Fullscreen**: All'attivazione, la mappa si espanderà a tutto schermo per massimizzare la visibilità del percorso e delle fermate.
- **Posizione in Tempo Reale**: La posizione GPS dell'utente sarà visualizzata in tempo reale sulla mappa.
- **Evidenziazione Dinamica Fermate**: Le fermate (tappe) in prossimità della posizione attuale dell'utente verranno evidenziate dinamicamente:
    - **Ingrandimento**: Le fermate più vicine all'utente appariranno più grandi sulla mappa.
    - **Ridimensionamento/Scomparsa**: Man mano che l'utente si allontana da una fermata, questa si rimpicciolirà progressivamente fino a scomparire dalla visualizzazione, mantenendo l'interfaccia pulita e focalizzata sulle tappe rilevanti.

**Implementazione**:
- Utilizzo di algoritmi di calcolo della distanza per determinare la prossimità delle fermate.
- Logica di rendering dinamico dei marker sulla mappa basata sulla distanza dall'utente.
- Ottimizzazione delle performance per garantire fluidità anche con numerosi marker.


