# 🎯 Decisioni Tecniche - Post-Man Project

**Purpose**: Documentare TUTTE le decisioni tecniche importanti
**Format**: Reverse chronological
**Update**: Quando si prende una decisione che impatta architettura/implementation

---

## Template Decision

```markdown
## YYYY-MM-DD - [Titolo Decisione]

**Context**: [Qual era il problema o la domanda?]

**Decision**: [Cosa abbiamo deciso di fare?]

**Alternatives Considered**:
1. **Opzione A**: [Descrizione] - [Pro/Contro]
2. **Opzione B**: [Descrizione] - [Pro/Contro]

**Rationale**: [Perché abbiamo scelto questa soluzione?]

**Consequences**:
- **Positive**: [Benefici]
- **Negative**: [Trade-offs]
- **Risks**: [Potenziali problemi futuri]

**Status**: ✅ Implemented / 🚧 In Progress / 📋 Planned

**References**:
- [Link a PR, issue, docs]
- [Link a benchmark, test]
```

---

## 2025-10-04 - Workflow Testing Desktop-First

**Context**:
Testing su mobile è scomodo per iterazioni rapide durante sviluppo. Serviva una strategia che permetta sviluppo veloce ma testing completo di funzionalità native (GPS, mappe).

**Decision**:
Implementare workflow **ibrido desktop-first**:
1. Sviluppo UI/UX su Web (hot-reload istantaneo)
2. Testing funzionalità native su Emulatore Android/iOS
3. Validazione finale su Device reale (solo test finali)

**Alternatives Considered**:
1. **Solo Mobile**:
   - ✅ Pro: Ambiente reale da subito
   - ❌ Contro: Hot-reload lento, scomodo per UI iteration
2. **Solo Web**:
   - ✅ Pro: Velocissimo per UI
   - ❌ Contro: GPS/mappe non funzionano, testing incompleto
3. **Emulatore sempre**:
   - ✅ Pro: GPS simulato, mappe native
   - ❌ Contro: Setup complesso, più lento di web

**Rationale**:
- 80% del lavoro è UI/UX/logica → web è 10x più veloce
- 20% è GPS/mappe → emulatore sufficiente per la maggior parte dei test
- Device reale solo per validation finale (GPS outdoor, performance)

**Consequences**:
- **Positive**:
  - Iterazioni UI rapidissime (< 1s hot-reload)
  - DevTools browser per debug
  - Minor setup friction per developer
- **Negative**:
  - Doppio testing necessario (web + emulatore)
  - Alcune feature non testabili su web (mock GPS)
- **Risks**:
  - Differenze web vs native possono sfuggire → Mitigato con testing emulatore frequente

**Status**: ✅ Implemented

**References**:
- `TESTING_WORKFLOW.md` - Guida completa
- Scripts: `dev-web.ps1|sh`, `dev-android.ps1|sh`

---

## 2025-10-04 - Stack Tecnologico React Native + Expo

**Context**:
Dovevamo scegliere framework per app mobile cross-platform (Android + iOS).

**Decision**:
- **Framework**: React Native 0.81.4 + Expo SDK 54
- **Maps**: `react-native-maps` (Google Maps Android, Apple Maps iOS)
- **Location**: `expo-location`
- **Database**: `expo-sqlite`
- **Language**: TypeScript strict mode

**Alternatives Considered**:
1. **Flutter**:
   - ✅ Pro: Performance superiore, single codebase
   - ❌ Contro: Team non conosce Dart, ecosystem meno maturo per maps offline
2. **Native (Swift + Kotlin)**:
   - ✅ Pro: Performance massima, pieno controllo
   - ❌ Contro: Double development effort, maintenance cost
3. **React Native senza Expo**:
   - ✅ Pro: Più controllo, meno limitazioni
   - ❌ Contro: Setup più complesso, no Expo Go per testing rapido

**Rationale**:
- Team conosce React/TypeScript
- Expo semplifica enormemente setup (GPS, SQLite, File System)
- `react-native-maps` maturo e ben supportato
- Expo Go permette testing rapido su device senza build
- TypeScript previene bug e migliora maintainability

**Consequences**:
- **Positive**:
  - Fast development
  - Type safety
  - Ecosystem ricco
  - Easy testing (Expo Go)
- **Negative**:
  - Bundle size più grande di native
  - Alcune limitazioni Expo (mitigabili con eject)
- **Risks**:
  - Performance critical path (GPS + rendering) → Mitigato con profiling continuo

**Status**: ✅ Implemented

**References**:
- `package.json` - Dependencies
- `PRD_V3_COMPLETO.md` - Stack details
- Expo Docs: https://docs.expo.dev/

---

## 2025-10-04 - Database Locale SQLite (No Cloud Sync v1.0)

**Context**:
App deve funzionare offline. Dovevamo decidere storage strategy per dati (zone, percorsi, run, fermate).

**Decision**:
- SQLite locale con `expo-sqlite`
- NO sync cloud in v1.0
- Schema normalizzato con foreign keys
- Migrations versionate

**Alternatives Considered**:
1. **AsyncStorage**:
   - ✅ Pro: Semplice, built-in
   - ❌ Contro: No relazioni, no query complesse, performance limitate
2. **Realm**:
   - ✅ Pro: Sync built-in, performance
   - ❌ Contro: Learning curve, overhead per v1.0 semplice
3. **Firebase Firestore**:
   - ✅ Pro: Sync automatico, scalabile
   - ❌ Contro: Richiede connessione, privacy concern (no offline-first)

**Rationale**:
- SQLite è standard, robusto, performante
- Offline-first requirement → cloud sync è nice-to-have, non blocker
- Relazioni (zone → stops, runs → run_stops) più facili in SQL
- Schema migrations permettono evoluzione controllata

**Consequences**:
- **Positive**:
  - 100% offline dopo primo setup
  - Privacy: dati solo locale
  - Performance: query veloci su device
  - Standard SQL familiar a tutti
- **Negative**:
  - No multi-device sync (v1.0)
  - Backup manuale (export CSV/JSON)
- **Risks**:
  - Data loss se device rotto → Mitigato con export frequenti

**Status**: ✅ Implemented

**References**:
- `PRD_V3_COMPLETO.md` - DB Schema completo
- `src/data/db.ts` - SQLite setup
- `src/data/migrations/001_initial.ts` - Initial schema

---

## 2025-10-04 - Polyline Simplification con Douglas-Peucker

**Context**:
KML percorsi possono contenere 10k+ punti. Rendering tutti i punti causa lag e memory issues.

**Decision**:
- Semplificazione automatica se polyline > 5000 punti
- Algoritmo: Douglas-Peucker
- Libreria: `@turf/simplify`
- Tolleranza: 0.00005 (≈5 metri)

**Alternatives Considered**:
1. **No semplificazione**:
   - ✅ Pro: Massima fedeltà geometrica
   - ❌ Contro: Performance inaccettabili con 10k punti
2. **Semplificazione lato server**:
   - ✅ Pro: Client leggero
   - ❌ Contro: No server in v1.0, dipendenza esterna
3. **Decimation (ogni N punti)**:
   - ✅ Pro: Veloce, semplice
   - ❌ Contro: Perde dettagli importanti (curve)

**Rationale**:
- Douglas-Peucker preserva forma meglio di decimation
- 5000 punti threshold basato su profiling: 30 FPS garantiti
- Turf.js è libreria standard geo, ben testata
- Semplificazione client-side: nessuna dipendenza server

**Consequences**:
- **Positive**:
  - FPS stabili > 30 anche con 10k punti originali
  - Memory footprint ridotto
  - Visivamente identico a originale (5m tolerance trascurabile)
- **Negative**:
  - Calcolo semplificazione richiede ~100ms per 10k punti
  - Leggera perdita fedeltà (accettabile)
- **Risks**:
  - Tolerance troppo alta perde dettagli → Test con KML reali per validare

**Status**: ✅ Implemented

**References**:
- `src/features/map/components/RouteRenderer.tsx`
- `src/utils/simplify.ts`
- Turf Simplify: https://turfjs.org/docs/#simplify

---

## Template per Nuove Decisioni

Quando un agente deve prendere una decisione tecnica importante:

1. **Copia il template** in cima a questo file
2. **Compila tutte le sezioni** onestamente
3. **Considera almeno 2-3 alternative** (anche se ovvie)
4. **Documenta i trade-off** (nessuna decisione è perfetta)
5. **Commit** questo file insieme al codice

**Decisioni che DEVONO essere documentate**:
- Scelta libreria/framework
- Cambio architettura
- Algoritmo non-ovvio
- Performance trade-off
- Security decision
- Breaking change

**Decisioni che NON serve documentare**:
- Naming convention standard
- Refactoring minore
- Bug fix semplice
- Implementazione ovvia da spec

---

**Log Iniziato**: 2025-10-04
**Ultimo Aggiornamento**: 2025-10-04
**Decisioni Totali**: 4
