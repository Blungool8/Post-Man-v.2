# Tasks Dettagliati – App Percorsi Postali
## Versione Beta 1.0 - Workflow Multi-Agente Coordinato

---

## Legenda Priorità e Fasi

**🔴 MVP-BETA**: Funzionalità critiche per versione beta (1 utente, test concept)
**🟡 V1.0**: Funzionalità per versione multi-utente scalabile  
**🟢 V1.5+**: Funzionalità avanzate future

**Agenti**:
- **FrontendDev**: Sviluppo UI/UX e logica frontend
- **BackendOps**: Configurazione backend e database
- **MapOps**: Gestione mappe offline e ottimizzazione
- **ProjectLead**: Coordinamento, merge, quality assurance

---

## FASE 1: Setup Progetto Beta (Settimana 1)

### 1.1 Inizializzazione Progetto Base
**Responsabile**: ProjectLead

- **Task 1.1.1** 🔴 **MVP-BETA**
  - **Descrizione**: Creare repository Git con struttura multi-agente
  - **Deliverable**: Repository con branch strategy e folder structure
  - **Accettazione**: Repository accessibile a tutti gli agenti con README iniziale
  - **Stima**: 0.5 giorni

- **Task 1.1.2** 🔴 **MVP-BETA**  
  - **Descrizione**: Setup React Native + Expo con architettura modulare
  - **Deliverable**: Progetto RN funzionante con navigazione base
  - **Accettazione**: App avviabile su simulatore con schermata placeholder
  - **Stima**: 1 giorno

- **Task 1.1.3** 🔴 **MVP-BETA**
  - **Descrizione**: Configurazione tools sviluppo (ESLint, Prettier, TypeScript)
  - **Deliverable**: Configurazione completa con pre-commit hooks
  - **Accettazione**: Code formatting automatico e linting funzionante
  - **Stima**: 0.5 giorni

### 1.2 Setup Documentazione e Workflow
**Responsabile**: ProjectLead

- **Task 1.2.1** 🔴 **MVP-BETA**
  - **Descrizione**: Implementare sistema di tracking agenti con template
  - **Deliverable**: Template commit message, agent_notes.md, workflow docs
  - **Accettazione**: Ogni agente può tracciare lavoro secondo standard definiti
  - **Stima**: 1 giorno

- **Task 1.2.2** 🔴 **MVP-BETA**
  - **Descrizione**: Setup CI/CD pipeline base per testing automatico
  - **Deliverable**: GitHub Actions per test e build automatici
  - **Accettazione**: Pipeline funzionante con test automatici su PR
  - **Stima**: 1 giorno

---

## FASE 2: Implementazione Mappa Offline (Settimana 2)

### 2.1 Implementazione Architettura Mappa Ottimizzata
**Responsabile**: MapOps + FrontendDev

- **Task 2.1.1** 🔴 **MVP-BETA**
  - **Descrizione**: Setup React Native Maps con configurazione performance
  - **Deliverable**: MapView base con provider Google e style ottimizzato
  - **Accettazione**: Mappa caricata con 60fps, zoom/pan fluidi
  - **Stima**: 1 giorno

- **Task 2.1.2** 🔴 **MVP-BETA**
  - **Descrizione**: Integrazione TileServer GL per tiles offline
  - **Deliverable**: Sistema tiles offline funzionante con MBTiles
  - **Accettazione**: Mappa visualizzabile completamente offline
  - **Stima**: 2 giorni

- **Task 2.1.3** 🔴 **MVP-BETA**
  - **Descrizione**: Sviluppo Custom Marker Components per fermate
  - **Deliverable**: Componenti marker personalizzabili con animazioni
  - **Accettazione**: Marker fluidi con resize dinamico based on distance
  - **Stima**: 1.5 giorni

### 2.2 Funzionalità GPS e Posizionamento
**Responsabile**: FrontendDev

- **Task 2.2.1** 🔴 **MVP-BETA**
  - **Descrizione**: Implementazione tracking GPS in tempo reale
  - **Deliverable**: Servizio GPS con posizione utente aggiornata
  - **Accettazione**: Posizione utente visibile su mappa con precisione < 10m
  - **Stima**: 1 giorno

- **Task 2.2.2** 🔴 **MVP-BETA**
  - **Descrizione**: Gestione permessi location e stati GPS
  - **Deliverable**: UI per richiesta permessi e gestione errori GPS
  - **Accettazione**: App gestisce correttamente tutti gli stati GPS possibili
  - **Stima**: 0.5 giorni

---

## FASE 3: Gestione Percorsi Beta (Settimana 3)

### 3.1 Database Locale e Persistenza
**Responsabile**: BackendOps

- **Task 3.1.1** 🔴 **MVP-BETA**
  - **Descrizione**: Setup SQLite con schema per percorsi e tappe
  - **Deliverable**: Database locale con tabelle e query base
  - **Accettazione**: CRUD operations funzionanti per routes e stops
  - **Stima**: 1 giorno

- **Task 3.1.2** 🔴 **MVP-BETA**
  - **Descrizione**: Servizio di persistenza dati con sync preparation
  - **Deliverable**: Service layer per gestione dati locale
  - **Accettazione**: Dati persistiti correttamente tra sessioni app
  - **Stima**: 1 giorno

### 3.2 UI Gestione Percorsi
**Responsabile**: FrontendDev

- **Task 3.2.1** 🔴 **MVP-BETA**
  - **Descrizione**: Componente lista tappe con stati (pending/completed)
  - **Deliverable**: UI lista tappe con possibilità di marcatura completamento
  - **Accettazione**: Utente può vedere e completare tappe facilmente
  - **Stima**: 1.5 giorni

- **Task 3.2.2** 🔴 **MVP-BETA**
  - **Descrizione**: Visualizzazione tappe su mappa come marker
  - **Deliverable**: Marker personalizzati per tappe con stati differenti
  - **Accettazione**: Tappe visibili su mappa con colori/icone appropriate
  - **Stima**: 1 giorno

- **Task 3.2.3** 🔴 **MVP-BETA**
  - **Descrizione**: Caricamento percorso da file JSON/CSV
  - **Deliverable**: Funzionalità import percorso con validazione dati
  - **Accettazione**: Utente può caricare percorso da file esterno
  - **Stima**: 1 giorno

### 3.3 Navigazione Basilare
**Responsabile**: FrontendDev

- **Task 3.3.1** 🔴 **MVP-BETA**
  - **Descrizione**: Calcolo distanza e direzione verso prossima tappa
  - **Deliverable**: Algoritmo calcolo distanza con indicazioni direzionali
  - **Accettazione**: Utente vede distanza e direzione verso tappa più vicina
  - **Stima**: 1 giorno

- **Task 3.3.2** 🔴 **MVP-BETA**
  - **Descrizione**: Highlight automatico tappa più vicina
  - **Deliverable**: Logica per evidenziare tappa prioritaria
  - **Accettazione**: Tappa più vicina evidenziata automaticamente su mappa
  - **Stima**: 0.5 giorni

---

## FASE 4: UI/UX e Testing Beta (Settimana 4)

### 4.1 Design System e Styling
**Responsabile**: FrontendDev

- **Task 4.1.1** 🔴 **MVP-BETA**
  - **Descrizione**: Implementazione design system con palette Poste
  - **Deliverable**: Componenti UI styled con colori e tipografia definiti
  - **Accettazione**: App rispetta completamente brand guidelines Poste
  - **Stima**: 1.5 giorni

- **Task 4.1.2** 🔴 **MVP-BETA**
  - **Descrizione**: Layout responsive e ottimizzazione mobile
  - **Deliverable**: UI ottimizzata per diverse dimensioni schermo
  - **Accettazione**: App usabile su dispositivi da 5" a 7"
  - **Stima**: 1 giorno

### 4.2 Testing e Quality Assurance
**Responsabile**: ProjectLead + Tutti

- **Task 4.2.1** 🔴 **MVP-BETA**
  - **Descrizione**: Unit testing per componenti core
  - **Deliverable**: Test suite con coverage > 70% per logica business
  - **Accettazione**: Tutti i test passano e coverage target raggiunto
  - **Stima**: 2 giorni

- **Task 4.2.2** 🔴 **MVP-BETA**
  - **Descrizione**: Testing integrazione su dispositivi reali
  - **Deliverable**: App testata su Android e iOS con report bug
  - **Accettazione**: App stabile con < 1 crash per sessione di test
  - **Stima**: 1 giorno

- **Task 4.2.3** 🔴 **MVP-BETA**
  - **Descrizione**: Performance testing e ottimizzazione
  - **Deliverable**: App ottimizzata per performance target definiti
  - **Accettazione**: Startup < 3s, map loading < 5s, memoria < 200MB
  - **Stima**: 1 giorno

---

## FASE 5: Preparazione Scalabilità (Settimana 5-6)

### 5.1 Setup Backend Scalabile
**Responsabile**: BackendOps

- **Task 5.1.1** 🟡 **V1.0**
  - **Descrizione**: Configurazione progetto Supabase con database schema
  - **Deliverable**: Database PostgreSQL con tabelle e RLS configurati
  - **Accettazione**: Database pronto per integrazione con app
  - **Stima**: 2 giorni

- **Task 5.1.2** 🟡 **V1.0**
  - **Descrizione**: Setup Clerk per autenticazione multi-utente
  - **Deliverable**: Clerk configurato con ruoli e webhook Supabase
  - **Accettazione**: Sistema auth funzionante con sync utenti
  - **Stima**: 1.5 giorni

### 5.2 Migrazione a Architettura Cloud
**Responsabile**: FrontendDev + BackendOps

- **Task 5.2.1** 🟡 **V1.0**
  - **Descrizione**: Implementazione sync offline-online per dati utente
  - **Deliverable**: Sistema sincronizzazione bidirezionale
  - **Accettazione**: Dati sincronizzati correttamente tra locale e cloud
  - **Stima**: 3 giorni

- **Task 5.2.2** 🟡 **V1.0**
  - **Descrizione**: Integrazione autenticazione Clerk nel frontend
  - **Deliverable**: UI login/registrazione con gestione sessioni
  - **Accettazione**: Utenti possono registrarsi e accedere all'app
  - **Stima**: 2 giorni

---

## FASE 6: Funzionalità Avanzate (V1.5+)

### 6.1 Routing Avanzato
**Responsabile**: MapOps

- **Task 6.1.1** 🟢 **V1.5+**
  - **Descrizione**: Integrazione OSRM per routing ottimizzato
  - **Deliverable**: Calcolo percorsi ottimali tra multiple tappe
  - **Accettazione**: Percorsi calcolati più efficienti del 20% vs baseline
  - **Stima**: 4 giorni

### 6.2 Funzionalità Collaborative
**Responsabile**: FrontendDev + BackendOps

- **Task 6.2.1** 🟢 **V1.5+**
  - **Descrizione**: Sistema note collaborative tra postini
  - **Deliverable**: Note condivisibili in tempo reale
  - **Accettazione**: Postini possono condividere note su indirizzi
  - **Stima**: 3 giorni

- **Task 6.2.2** 🟢 **V1.5+**
  - **Descrizione**: Notifiche push per aggiornamenti collaborativi
  - **Deliverable**: Sistema notifiche real-time
  - **Accettazione**: Utenti ricevono notifiche per eventi rilevanti
  - **Stima**: 2 giorni

---

## Workflow Multi-Agente

### Processo di Lavoro Quotidiano

**1. Inizio Sessione (Ogni Agente)**:
```bash
# Update da repository
git pull origin develop

# Controllo task assegnati
grep "Responsabile.*[NOME_AGENTE]" Tasks_dettagliati_migliorati.md

# Creazione branch feature
git checkout -b feature/[task-id]-[descrizione-breve]
```

**2. Durante Sviluppo**:
- Aggiornamento continuo `agent_notes.md` personale
- Commit frequenti con reference a Task ID
- Update status task in questo documento
- Comunicazione blocchi/dipendenze in chat team

**3. Fine Sessione**:
- Push branch feature
- Creazione PR con template standard
- Aggiornamento documentazione condivisa se necessario
- Report status in daily standup

### Template Commit Message
```
[TASK-ID] Breve descrizione modifiche

- Dettaglio modifiche principali
- File documentazione aggiornati: [lista]
- Test aggiunti/modificati: [lista]
- Note per altri agenti: [eventuali]

Refs: #[task-id]
```

### Gestione Conflitti e Merge
**Responsabile**: ProjectLead

**Processo**:
1. Review automatica CI/CD su ogni PR
2. Code review manuale da ProjectLead
3. Testing integrazione su branch develop
4. Merge solo dopo approvazione esplicita
5. Gestione conflitti con coinvolgimento agenti interessati

### Sistema di Escalation
- **Blocco tecnico**: Escalation a ProjectLead entro 4 ore
- **Conflitto architetturale**: Meeting team entro 24 ore  
- **Dipendenza esterna**: Comunicazione immediata a tutti gli agenti

---

## Metriche di Successo per Fase

### Beta Release (Fine Settimana 4)
- ✅ App installabile e avviabile
- ✅ Mappa offline funzionante
- ✅ Gestione percorso base operativa
- ✅ Test utente completabile in < 2 ore
- ✅ Crash rate < 1 per sessione
- ✅ Feedback utente > 7/10

### V1.0 Release (Fine Settimana 8)
- ✅ Multi-utente funzionante
- ✅ Sincronizzazione cloud stabile
- ✅ Performance target raggiunti
- ✅ 10+ utenti beta attivi
- ✅ Test coverage > 80%

### V1.5+ (Roadmap Futura)
- ✅ Funzionalità collaborative attive
- ✅ Routing avanzato implementato
- ✅ Analytics e metriche business
- ✅ Scalabilità enterprise ready

---

**Autore**: Senior Software Developer  
**Data**: 28 Settembre 2025  
**Versione**: Beta 1.0 Multi-Agente




## FASE 3.4: Modalità Navigazione Dinamica (Nuova Funzionalità)

### 3.4.1 Implementazione UI/UX Modalità Navigazione
**Responsabile**: FrontendDev

- **Task 3.4.1.1** 🔴 **MVP-BETA**
  - **Descrizione**: Implementare un Floating Action Button (FAB) per attivare/disattivare la modalità navigazione.
  - **Deliverable**: FAB funzionante con cambio icona/colore in base allo stato.
  - **Accettazione**: Utente può attivare/disattivare la modalità navigazione tramite il FAB.
  - **Stima**: 1 giorno

- **Task 3.4.1.2** 🔴 **MVP-BETA**
  - **Descrizione**: Gestire la visualizzazione fullscreen della mappa all'attivazione della modalità navigazione.
  - **Deliverable**: Mappa che occupa l'intera schermata, nascondendo elementi UI non essenziali.
  - **Accettazione**: Mappa si espande/riduce correttamente all'attivazione/disattivazione della modalità.
  - **Stima**: 1 giorno

### 3.4.2 Logica di Evidenziazione Dinamica Fermate
**Responsabile**: FrontendDev, MapOps

- **Task 3.4.2.1** 🔴 **MVP-BETA**
  - **Descrizione**: Sviluppare la logica per calcolare la distanza delle fermate dalla posizione attuale dell'utente.
  - **Deliverable**: Funzione di calcolo distanza (es. Haversine) integrata nel `MapService`.
  - **Accettazione**: Distanza corretta calcolata per tutte le fermate visibili.
  - **Stima**: 1.5 giorni

- **Task 3.4.2.2** 🔴 **MVP-BETA**
  - **Descrizione**: Implementare il rendering dinamico dei marker delle fermate (ingrandimento/ridimensionamento/scomparsa).
  - **Deliverable**: Marker che cambiano dimensione e visibilità in base alla distanza dall'utente.
  - **Accettazione**: Fermate vicine più grandi, lontane più piccole fino a scomparire, con transizioni fluide.
  - **Stima**: 2 giorni

- **Task 3.4.2.3** 🔴 **MVP-BETA**
  - **Descrizione**: Ottimizzare le performance del rendering dinamico dei marker.
  - **Deliverable**: Rendering fluido anche con un numero elevato di fermate e aggiornamenti frequenti della posizione.
  - **Accettazione**: Nessun lag o rallentamento significativo durante la navigazione.
  - **Stima**: 1 giorno


