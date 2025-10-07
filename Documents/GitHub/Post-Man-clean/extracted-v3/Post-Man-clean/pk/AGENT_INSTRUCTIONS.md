# 🤖 Istruzioni per Agenti AI — Post-Man (v3)

**Importante**: L’app **carica SOLO un file KML unico ottimizzato per zona/sottozona** — es.: **`Zona9_SottozonaB.kml`**.  
Nessun merge o conversione JSON in-app. (Il file viene fornito dal planner.)

---

## Documenti da leggere PRIMA di iniziare
1) `PRD_V3_COMPLETO.md` — Cosa costruire  
2) `PLANNING_V3_DETTAGLIATO.md` — Quando costruirlo  
3) `AGENT_WORK_LOG.md` — Log lavoro degli agenti (appendi in cima)

---

## Regole chiave v3
- **Gating per Zona/Sottozona**: montare/caricare il KML **solo** quando la selezione utente coincide con la coppia a cui il file appartiene; su cambio selezione, **smontare** route/marker e pulire lo stato.

- **No JSON / No merge runtime**: usa **solo** il KML unico fornito.  
- **Marker fermate**: visibili **solo** se **GPS ON** e **entro raggio** (200 m default); toggle “Mostra solo la mia posizione”.  
- **Banner “Prossima Fermata”**: compare **solo** dopo che l’utente seleziona una fermata da **Lista Fermate**.  
- **+ Fermata**: crea fermata locale con note (non modifica il KML originale).  

---

## Stack & struttura
- RN + Expo, `react-native-maps`, `expo-location`, `expo-sqlite`.  
- `/src/features/kml/` → `KMLLoader.ts`, `KMLParser.ts`, `KMLValidator.ts`.  
- `/src/features/map/` → `RouteRenderer.tsx`, `StopMarkers.tsx`.  
- `/src/features/stops/` → lista, aggiunta, stato.  
- `/src/features/runs/` → run manager, riepilogo, export.  
- `/assets/kml/` → **`Zona9_SottozonaB.kml`** (o analoghi).

---

## Task iniziali obbligatori
- **T09**: richiedi a Lorsa **`Zona9_SottozonaB.kml`** (≤ 5 MB).  
- **T10–T12**: Loader/Parser/Validator KML.  
- **T20–T23**: Rendering + markers GPS-driven + toggle.  
- **T30–T33**: Lista Fermate; banner solo dopo selezione; +Fermata.  
- **T40–T42**: Persistenza SQLite; riepilogo; export.  

---

## Definition of Done (DoD) globale
- `Zona9_SottozonaB.kml` si carica e valida; polyline fedele.  
- Marker obbediscono a GPS+raggio; toggle ok.  
- Banner mostra info **solo** dopo selezione manuale.  
- +Fermata salva nel DB; stati persistono a riavvio.  
- Export CSV/JSON ok; 0 crash in 100 cicli.

---

## Commit & log
- Commit convention: `feat(map): …`, `fix(kml): …`  
- Aggiorna **`AGENT_WORK_LOG.md`** a ogni task (entry in cima).
