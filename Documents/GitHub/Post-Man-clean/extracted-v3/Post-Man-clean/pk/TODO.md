# ✅ TODO Tracker - Post-Man Project

**Purpose**: Task non ancora iniziati, feature future, miglioramenti identificati
**Format**: Prioritized list
**Update**: Quando si identifica nuovo lavoro

---

## 🔥 Priority 0 - Blockers (Do Now)

Nessuno attualmente - Progetto in fase iniziale setup.

---

## ⚠️ Priority 1 - High (This Milestone)

### M0 - Setup & Scheletro
- [ ] Implementare T00.1: Project Bootstrap (vedi PLANNING_V2)
- [ ] Implementare T00.2: Struttura Cartelle
- [ ] Implementare T00.3: MapView Base
- [ ] Implementare T00.4: Zone Selection UI

---

## 📌 Priority 2 - Medium (Next Milestone)

### M1 - KML Pipeline
- [ ] T10: KML Loader (Assets + Storage)
- [ ] T11: XML Parser → Route/Stops
- [ ] T12: KML Validator
- [ ] T13: Integration Test KML Real
- [ ] T14: Error UX & Guida

### M2 - Rendering
- [ ] T20: Polyline Renderer
- [ ] T21: Stop Markers
- [ ] T22: Camera Fit & Follow Me
- [ ] T23: Performance Tuning
- [ ] T24: UI Polish

---

## 🔵 Priority 3 - Low (Future Milestones)

### M3 - GPS & Next Stop
- [ ] T30: Location Hook & Permissions
- [ ] T31: Next Stop Engine
- [ ] T32: Next Stop Banner UI
- [ ] T33: GPS Error Handling
- [ ] T34: Integration Test Live

### M4 - Persistenza
- [ ] T40: DB Schema & Migrations
- [ ] T41: DAO Implementation
- [ ] T42: Run Manager Service
- [ ] T43: Data Sync & Integrity

### M5 - Riepilogo & Export
- [ ] T50: Summary Screen UI
- [ ] T51: Export CSV Service
- [ ] T52: Export JSON Service
- [ ] T53: Share Integration
- [ ] T54: Integration Test

### M6 - Performance & QA
- [ ] T60: Performance Profiling
- [ ] T61: Battery Optimization
- [ ] T62: Robustness Testing
- [ ] T63: Device Testing Matrix
- [ ] T64: Accessibility & Usability

### M7 - Beta Pilot
- [ ] T70: Build Production
- [ ] T71: Internal Beta
- [ ] T72: Bug Bash & Fix
- [ ] T73: Documentation
- [ ] T74: Release Prep

---

## 💡 Ideas & Future Enhancements (v1.1+)

### Usability Improvements
- [ ] Dark mode support
- [ ] Multi-language (Inglese)
- [ ] Tutorial interattivo first-run
- [ ] Onboarding animation

### Features
- [ ] Import KML da Google Drive
- [ ] Import KML da URL
- [ ] Turn-by-turn navigation voice
- [ ] Ottimizzazione automatica percorso (TSP solver)
- [ ] Offline maps vector tiles

### Technical Debt
- [ ] Migrazione a React Native 0.82+
- [ ] Aggiornamento Expo SDK 55
- [ ] Unit test coverage > 80%
- [ ] E2E tests con Detox

### Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated build + release
- [ ] Crash reporting (Sentry)
- [ ] Analytics (non-invasive)

### Enterprise (v2.0)
- [ ] Multi-tenant account system
- [ ] Cloud sync (Supabase/Firebase)
- [ ] Web dashboard per planner
- [ ] Analytics avanzati
- [ ] API per integrazione ERP

---

## 📝 Notes & Considerations

### Decisioni da Prendere
- [ ] Provider mappa offline (Mapbox vs OpenStreetMap)
- [ ] Strategia caching tiles (pre-download vs on-demand)
- [ ] Formato export avanzato (PDF report?)

### Ricerca Necessaria
- [ ] Best practice GPS background tracking iOS/Android
- [ ] Battery optimization patterns
- [ ] Offline-first sync strategies

### Blockers Potenziali
- Nessuno identificato attualmente

---

## How to Use This File

**Aggiungere TODO**:
```markdown
## [Sezione Appropriata]
- [ ] Descrizione task concisa ma chiara
  - Sub-task se necessario
  - Dipendenze: [Task XYZ]
  - Estimate: [Ore]
```

**Completare TODO**:
1. Marcare con `[x]` quando completato
2. Non cancellare (storico utile)
3. Opzionale: Muovere in sezione "Completed"

**Prioritizzare**:
- P0: Blocker, non si può procedere senza
- P1: Importante per milestone corrente
- P2: Importante ma non urgente
- P3: Nice to have, backlog

**Linkare a Issues**:
Se task diventa issue GitHub:
- [ ] Task XYZ → Issue #123

---

## Completed (Archive)

### Setup & Documentation (2025-10-04)
- [x] Setup workflow testing
- [x] Creare TESTING_WORKFLOW.md
- [x] Creare MANUALE_UTENTE.md
- [x] Creare AGENT_INSTRUCTIONS.md
- [x] Migliorare PRD con dettagli tecnici
- [x] Migliorare PLANNING con milestone dettagliato
- [x] Creare AGENT_WORK_LOG.md
- [x] Creare DECISIONS.md
- [x] Creare BUGS.md
- [x] Creare TODO.md (questo file)

---

**Tracker Iniziato**: 2025-10-04
**Ultimo Aggiornamento**: 2025-10-04
**TODO Attivi**: ~70 (across all milestones)
**TODO Completati**: 10
