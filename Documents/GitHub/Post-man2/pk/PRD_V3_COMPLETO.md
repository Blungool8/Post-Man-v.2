# PRD — "Post-Man" (Percorsi Postali) — Versione 3.0

**Versione**: 3.0  
**Data**: Ottobre 2025  
**Status**: Living Document (aggiornare ad ogni decisione tecnica)

---

## 1) Visione & Obiettivi

### Visione
App mobile **offline-first**, **leggera** e **affidabile** per postini che mostra **esattamente** il percorso salvato su Google Maps e consegnato come **KML unico ottimizzato**. L’app **non** unisce né convertisce KML in runtime: carica un solo file **`Zona9_SottozonaB.kml`** (o equivalente per altre zone) e rende fluido il lavoro sul campo.

### Obiettivi v3 (MVP)
1. **Rendering stabile** di mappa + percorso da **KML unico ottimizzato**; fermate (placemark) coerenti.  
2. **Navigazione operativa controllata dall’utente**: il banner “Prossima Fermata” compare **solo dopo** che il postino seleziona una fermata dalla **Lista Fermate**.  
3. **Fermate dinamiche condizionate dal GPS**: visibili **solo con GPS attivo** e **entro raggio** (default 200 m); toggle “Mostra solo la mia posizione”.  
4. **Aggiunta fermata manuale** (da posizione attuale) con **note**.  
5. **Persistenza locale** (SQLite) di run e stati fermate; **Riepilogo** a fine giro; **Export** CSV/JSON.  

**Non obiettivi v3**: account multi-tenant, sync cloud, turn-by-turn vocale, ottimizzazione automatica itinerari (TSP).

---

## 2) Utenti & Storie Chiave

### Postino
- **Mappa e posizione offline**  
  Voglio vedere mappa e la mia posizione anche senza rete, per orientarmi nel giro.  
  **AC**: mappa visibile, GPS lock, accuracy & status indicator.

- **Fermate vicine in modalità GPS**  
  Voglio che le fermate compaiano solo se **GPS ON** e **vicine** (≤ raggio configurabile), e che **scompaiano** se mi allontano; posso disattivare questa logica e vedere solo la mia posizione.

- **Lista fermate manuale (“Liste Fermate”)**  
  Voglio aprire l’elenco completo delle fermate precaricate (dal KML), selezionarne una e **attivare la navigazione** verso quella fermata.

- **Aggiunta fermata**  
  Voglio aggiungere una nuova fermata con un tasto, usando le mie coordinate correnti e inserendo **note**.

- **Conferma consegna**  
  Dopo che **seleziono manualmente** una fermata, compare il **banner “Prossima Fermata”**; posso marcarla **Completata** o **Non reperito** (persistito localmente).

- **Riepilogo**  
  A fine giro vedo completate/mancate ed esporto **CSV/JSON**.

### Capo Team / Planner
- Voglio precaricare zone/fermate nel **KML unico ottimizzato** e distribuirlo.  
  **AC**: validazione KML; caricamento senza crash; naming coerente.

---

## 3) Assunzioni & Vincoli

- **Fonte dati**: 1 (uno) file **KML ottimizzato** per combinazione zona/sottozona (esempio: **`Zona9_SottozonaB.kml`**).  
- **Struttura KML** minima:  
  - `<LineString><coordinates>` per il percorso  
  - `Placemark` con `Point` per fermate (facoltative, consigliate)  
- **Stack**: React Native + Expo; `react-native-maps`; `expo-location`; `expo-sqlite`.  
- **Target device**: Android primario (API 29+), iOS secondario (iOS 15+).  
- **Prestazioni**: parsing KML ≤ 2s; pan/zoom ≥ 30 FPS; consumo batteria < 10–12%/h.

---

## 4) Requisiti Funzionali

### 4.1 Gestione zone & piani (A/B)
- Selezione CTD → **Zona** (1–25) → **Sottozona** (A/B).  
- Alla selezione di **Zona 9 – Sottozona B** l’app carica **`Zona9_SottozonaB.kml`**.

### 4.2 Caricamento KML (unico)
- **Sorgenti**: `assets/kml/` (bundled) e, in futuro, storage locale.  
- **Validazione**: almeno 1 LineString; coordinate valide; fermate opzionali.  
- **Errori**: messaggio chiaro e guida “Come preparare il KML”.

### 4.3 Mappa & fermate (GPS-driven)
- Disegno **Polyline** dal `<LineString>` con **semplificazione** (Douglas–Peucker) se >5k punti.  
- **Marker fermate** appaiono **solo** quando:  
  - GPS **attivo** **e** distanza utente ≤ `NEARBY_RADIUS` (default 200 m).  
- **Toggle** “Mostra solo la mia posizione” per nascondere i marker a prescindere.

### 4.4 Lista fermate & navigazione manuale
- Schermata **“Liste Fermate”** con tutte le fermate del KML.  
- **Tap** su fermata → **attiva** il **Banner Prossima Fermata** (distanza/bearing live).  
- **CTA**: **Completa** / **Non reperito** → persistito in SQLite.

### 4.5 Aggiunta fermata (manuale)
- **+ Fermata**: salva corrente `{lat,lng}`, `name`, `note`; non modifica il KML sorgente; persiste in DB.

### 4.6 Persistenza & Riepilogo
- **SQLite** (runs, run_stops, stops, routes).  
- **Riepilogo**: KPI + lista stati; **Export** CSV/JSON.

---

## 5) Requisiti Non Funzionali
- **Offline-ready**, crash-safe.  
- **Performance**: FPS ≥ 30; parsing KML ≤ 2s; KML ≤ 5 MB.  
- **Batteria**: consumo < 12%/h con GPS.  
- **Privacy**: dati solo locali; foto/Note opzionali.

---

## 6) Modelli Dati

### 6.1 Output parser KML → modello interno
```ts
type LatLng = { latitude: number; longitude: number };

interface ParsedKML {
  route: { segments: LatLng[][]; totalPoints: number };
  stops: { id: string; name: string; lat: number; lng: number; description?: string }[];
  metadata?: { source: string; parsedAt: string };
}
```

### 6.2 Schema SQLite (estratto)
- `routes(id, zone_id, plan, segments_json, total_points, simplified)`  
- `stops(id, zone_id, plan, name, lat, lng, meta_json)`  
- `runs(id, date, zone_id, plan, started_at, finished_at, completed_stops, ...)`  
- `run_stops(id, run_id, stop_id, status, completed_at, reason, note, photo_uri)`

---

## 7) Naming KML & Storage
- **Nome file**: `Zona<NUM>_Sottozona<A|B>.kml` → es. **`Zona9_SottozonaB.kml`**.  
- **Percorso**: `assets/kml/Zona9_SottozonaB.kml` (consigliato).  
- In futuro: cartelle per altre zone, stessa convenzione.

---

## 8) Flussi Utente (aggiornati)

1) **Seleziona CTD & Zona** (badge **A/B**)  
2) **Carica KML unico** `Zona9_SottozonaB.kml`  
   - Disegna polyline; marker fermate soggetti a regola GPS  
3) **Liste Fermate** → selezione manuale → **Banner Prossima Fermata**  
   - GPS ON → distanza/direzione aggiornate  
   - **Completa / Non reperito** → persistito localmente  
4) **+ Fermata** (opzionale) con note  
5) **Riepilogo** + **Export** CSV/JSON

---

## 9) Acceptance Criteria (estratto)

- **KML-01**: Carico `Zona9_SottozonaB.kml` → polyline corretta, parsing ≤ 2s.  
- **KML-02**: Marker fermate **solo** con GPS ON e **entro raggio**; toggle “solo me” funziona.  
- **NAV-01**: Banner “Prossima Fermata” compare **solo** dopo selezione manuale.  
- **STOP-01**: “+ Fermata” salva nuova fermata (con note) nel DB.  
- **RUN-01**: Stati/Run persistono dopo kill/relaunch.  
- **EXP-01**: Export CSV/JSON coerente e apribile.

---

## 10) Rischi & Mitigazioni
- **KML pesante** → semplificazione polyline; KML ottimizzato a monte.  
- **GPS instabile** → accuracy indicator; override manuale; lista fermate disponibile.  
- **Batteria** → throttling (interval/distance); sospensione in idle/schermo off.

---

## 11) Roadmap (vedi Planning v3)

- M0 Setup; M1 Loader & Validator KML (unico); M2 Rendering & GPS markers;  
  M3 Lista fermate & +Fermata; M4 Persistenza & Riepilogo; M5 QA & Beta.

---

**Change log**  
- **3.0 (2025-10-05)**: Passaggio a **KML unico ottimizzato** per zona/sottozona; fermate GPS-driven; Lista Fermate; +Fermata; banner solo dopo selezione manuale.  
- 2.0 (2025-10-04): PRD dettagliato GPS/Mappa/DB. (storico)  


### 4.7 Regola di visibilità/selezione mappa (OBBLIGATORIA)
- Il file KML viene **caricato e reso visibile SOLO** quando l'utente seleziona **esattamente** la combinazione **Zona**/**Sottozona** a cui il file appartiene.
- Esempio: `Zona9_SottozonaB.kml` è caricato **solo** se l'utente sceglie *Zona 9 – Sottozona B*; **non** compare né viene montato nelle altre zone/sottozone.
- Implementazione: **lazy load** dopo la selezione + **scoped state** per evitare residui/bleed-over quando si cambia zona.


- **KML-03**: Navigando in altre Zone/Sottozone il file `Zona9_SottozonaB.kml` **non** viene caricato né mostrato (scoping e cleanup ok).
