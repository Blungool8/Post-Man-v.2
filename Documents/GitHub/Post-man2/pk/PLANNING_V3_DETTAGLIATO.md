# Planning Dettagliato — Post-Man v3.0

**Timeline totale**: ~6 settimane  
**Approccio**: iterativo con milestone verificabili

---

## Timeline

| Milestone | Durata | Deliverable | Criteri |
|---|---|---|---|
| M0 | 0.5 sett | Setup & Scheletro | App avvia, MapView base |
| M1 | 1 sett | **Loader & Validator KML (unico)** | Carica `Zona9_SottozonaB.kml` |
| M2 | 1 sett | Rendering & GPS Markers | Polyline + fermate GPS-driven |
| M3 | 1 sett | Lista Fermate & +Fermata | Navigazione manuale + aggiunta |
| M4 | 1 sett | Persistenza & Riepilogo & Export | DB + CSV/JSON |
| M5 | 0.5 sett | QA & Beta | Performance & bugfix |

---

## M0 — Setup & Scheletro
- **T00**: Bootstrap Expo + TS + ESLint/Prettier.  
- **T01**: Struttura cartelle (/features, /data, /ui).  
- **T02**: `MapScreen` con `react-native-maps`; tasto “centra su di me”.  
**DoD**: mappa render, lint/type-check ok.

---

## M1 — Loader & Validator KML (unico)
- **T09 (BLOCCANTE) — Richiesta file a Lorsa**  
  Richiedere il file **ottimizzato**: **`Zona9_SottozonaB.kml`**.  
  **DoD**: file ricevuto; dimensione ≤ 5 MB; XML ben formato.

- **T10 — KML Loader (assets + storage)**  
  Funzione `loadKML('assets/kml/Zona9_SottozonaB.kml')`.  
  Errori: file assente → messaggio chiaro.

- **T11 — Parser KML → modello**  
  Estrai `LineString` (route) + `Placemark Point` (stops).  
  Gestisci whitespace/encoding; salta outlier.

- **T12 — Validator KML**  
  Regole minime: 1 LineString, coordinate valide, stops opzionali.  
  Output: `{ valid, errors[], warnings[] }`.

- **T13 — Guida KML**  
  Mini guida “Come preparare KML unico ottimizzato” (appendice PRD).

**DoD M1**: `Zona9_SottozonaB.kml` caricato e validato; parse ≤ 2s.

---

## M2 — Rendering & Fermate (GPS-driven)
- **T20 — Polyline renderer** con semplificazione DP (>5k punti).  
- **T21 — Marker fermate condizionati**: visibili solo con **GPS ON** e **entro raggio** (200 m default).  
- **T22 — Toggle visibilità**: “Mostra solo la mia posizione”.  
- **T23 — Camera Fit**: fit bounds all’apertura; fallback centro zona.

**DoD M2**: FPS ≥ 30; markers rispettano regola GPS+raggio.

---

## M3 — Lista Fermate & Aggiunta
- **T30 — Schermata “Liste Fermate”**: elenco completo + ricerca.  
- **T31 — Navigazione manuale**: tap su fermata → **Banner Prossima Fermata**.  
- **T32 — “+ Fermata”**: crea fermata da posizione attuale + note (solo DB).  
- **T33 — UX & feedback**: haptics; toast; stati coerenti.

**DoD M3**: banner compare solo dopo selezione manuale; +Fermata funziona.

---

## M4 — Persistenza & Riepilogo & Export
- **T40 — Schema SQLite & DAO**: runs, run_stops, stops, routes (migrazioni).  
- **T41 — Stato fermate**: completed/failed (+reason, note, foto opz.).  
- **T42 — Riepilogo**: KPI e lista; **Export** CSV/JSON; share.

**DoD M4**: dati persistono dopo kill; export apribile in Excel/Sheets.

---

## M5 — QA & Beta
- **T50 — Performance & battery**: profiling; target <12%/h.  
- **T51 — Robustezza**: 0 crash in 100 cicli (load → run → export).  
- **T52 — Beta build**: APK/AAB (Android) + IPA (iOS TestFlight).  
- **T53 — Documentazione**: README, CHANGELOG, MANUALE_UTENTE.

**DoD M5**: metriche raggiunte; bug blocker = 0.

---

## Checkpoint & Metriche
- Startup < 3s; parse KML ≤ 2s; FPS ≥ 30.  
- Crash rate < 0.1%; battery < 12%/h.  
- AC del PRD soddisfatte (KML unico, GPS-driven, lista manuale, +Fermata, export).


- **T24 — Gating & cleanup per zona/sottozona**
  - Carica il KML **solo** dopo selezione della combinazione corretta.
  - Svuota route/stops e dismonta marker quando si cambia zona/sottozona.
  **DoD**: `Zona9_SottozonaB.kml` non compare in altre zone; nessun residuo dopo switch.

