# Regole per lo Sviluppo con Agenti – App Percorsi Postali
## Versione Beta 1.0 - Workflow Multi-Agente Coordinato

---

Questo documento stabilisce le linee guida e i principi operativi per gli agenti di sviluppo che lavoreranno sul progetto "App Percorsi Postali". L'obiettivo è garantire coerenza, efficienza e qualità nello sviluppo, promuovendo un approccio metodico e documentato. Il mancato rispetto di queste regole comporterà il blocco del processo di sviluppo e/o deployment.

## 1. Consultazione della Documentazione e del Codice (Obbligatorio)

Prima di apportare qualsiasi modifica o implementare nuove funzionalità, l'agente **DEVE**:

*   **Consultare la Documentazione Aggiornata**: Leggere attentamente il `PRD_migliorato.md`, il `Planning_dettagliato_migliorato.md` e il `Tasks_dettagliati_migliorati.md` per comprendere a fondo i requisiti, l'architettura e le attività pianificate. Questo include la verifica di eventuali aggiornamenti recenti a questi documenti. L'agente deve essere in grado di citare le sezioni pertinenti della documentazione che giustificano il proprio lavoro.
*   **Analizzare la Struttura del Codice**: Esaminare la struttura del codice esistente, i moduli interessati, le dipendenze e le convenzioni di codifica. Comprendere come la nuova funzionalità si integrerà con l'architettura attuale e quali componenti verranno influenzati. Ogni modifica al codice deve essere giustificata da una comprensione approfondita del contesto esistente.
*   **Valutare l'Impatto**: Analizzare l'impatto delle modifiche proposte su altre parti del sistema, in termini di performance, sicurezza e manutenibilità. Questa valutazione deve essere documentata (anche brevemente) prima di procedere.

Questo approccio previene l'introduzione di bug, riduce il debito tecnico e assicura che lo sviluppo sia allineato con la visione complessiva del progetto. La conformità a questo punto sarà verificata tramite revisioni del codice e della documentazione.

## 2. Tracciamento del Lavoro Svolto (Obbligatorio)

Durante ogni sessione di lavoro, l'agente **DEVE** tenere traccia di tutte le attività eseguite. Questo include:

*   **Log delle Azioni**: Registrare i comandi eseguiti, le modifiche ai file, le decisioni prese e i risultati ottenuti. Questi log devono essere conservati e accessibili per la revisione. Si consiglia l'uso di un file `agent_log_[data].md` per ogni sessione.
*   **Commit Significativi**: Effettuare commit frequenti e significativi nel sistema di controllo versione (Git), con messaggi chiari e descrittivi che spieghino cosa è stato fatto e perché. I messaggi di commit **DEVONO** fare riferimento ai Task ID pertinenti dal `Tasks_dettagliati_migliorati.md` e indicare quali file di progettazione sono stati aggiornati. Utilizzare il template di commit message fornito.
*   **Note Interne (Diario Personale)**: Utilizzare un file di note interno (`agent_notes.md` o simile) per annotare pensieri, problemi incontrati, soluzioni adottate e qualsiasi informazione utile per la continuità del lavoro o per la revisione. Questo file deve essere aggiornato costantemente durante la sessione e sarà parte della consegna finale del lavoro.

Il tracciamento dettagliato è fondamentale per la trasparenza, la riproducibilità e la collaborazione, consentendo a qualsiasi altro agente o sviluppatore di comprendere lo stato del progetto e il progresso effettuato. La mancanza di un tracciamento adeguato bloccherà l'approvazione del lavoro.

## 3. Aggiornamento della Documentazione Condivisa (Obbligatorio)

Una volta che una funzionalità è stata implementata e testata con successo, l'agente **DEVE** aggiornare la documentazione pertinente. Questo è un passaggio critico e la sua omissione bloccherà qualsiasi avanzamento.

*   **Aggiornamento del `Tasks_dettagliati_migliorati.md`**: Marcare come completate le attività relative alla funzionalità implementata. Se nuove attività emergono durante lo sviluppo, aggiungerle al file, assegnando un agente se appropriato. Ogni task completato deve essere chiaramente marcato come tale (es. `[x] Task ID`).
*   **Aggiornamento del `Planning_dettagliato_migliorato.md`**: Se l'implementazione ha portato a modifiche significative nell'architettura o nell'integrazione dei servizi, aggiornare la sezione corrispondente del planning. Le modifiche al planning devono riflettere lo stato attuale dell'architettura.
*   **Aggiornamento del `PRD_migliorato.md`**: Se la funzionalità implementata introduce nuovi requisiti o modifica quelli esistenti, aggiornare il PRD di conseguenza. Il PRD deve essere sempre una rappresentazione accurata dei requisiti dell'applicazione.
*   **Documentazione del Codice**: Assicurarsi che il codice sia ben commentato e che eventuali nuove API o componenti siano documentati in linea con gli standard del progetto. La documentazione in-code è parte integrante della documentazione di progetto.

L'aggiornamento costante della documentazione è cruciale per mantenere allineati tutti i membri del team e per garantire che la base di conoscenza del progetto sia sempre accurata e rifletta lo stato attuale dello sviluppo. Sistemi di CI/CD e pre-commit hooks verranno configurati per validare l'aggiornamento della documentazione; un fallimento in questi controlli impedirà il merge del codice.

## 4. Meccanismi di Controllo e Conformità (Implementazione Tecnica)

Per rafforzare l'adesione a queste regole, verranno implementati i seguenti meccanismi tecnici:

*   **Pre-commit Hooks**: Saranno configurati script che, prima di ogni commit, verificheranno:
    *   La formattazione del codice e dei file Markdown.
    *   La presenza di riferimenti a Task ID nei messaggi di commit.
    *   L'aggiornamento dei file di documentazione (`Tasks_dettagliati_migliorati.md`, `Planning_dettagliato_migliorato.md`, `PRD_migliorato.md`) in relazione alle modifiche del codice.
*   **CI/CD Pipeline**: La pipeline di Continuous Integration includerà step che:
    *   Eseguiranno test automatici (unit, integration, e2e).
    *   Valideranno la coerenza tra il codice e la documentazione aggiornata. Un fallimento in questi step bloccherà la build e il deployment.
*   **Template di Commit Message**: Verrà fornito un template standardizzato per i messaggi di commit che richiederà all'agente di specificare:
    *   Il Task ID a cui si riferisce il commit.
    *   Una breve descrizione delle modifiche.
    *   I file di documentazione aggiornati.

Questi meccanismi automatici renderanno oggettivamente difficile per un agente non rispettare le regole di aggiornamento e sviluppo allineato, garantendo che ogni contributo sia tracciabile, documentato e conforme agli standard del progetto.

## 5. Ruolo dell'Agente Coordinatore (ProjectLead)

L'agente con ruolo **ProjectLead** avrà responsabilità aggiuntive per garantire la fluidità del workflow multi-agente:

*   **Gestione Merge e Conflitti**: Sarà il responsabile finale per la risoluzione dei conflitti di merge e l'approvazione dei merge su `develop` e `main`.
*   **Revisione Codice Cross-Team**: Effettuerà revisioni del codice per garantire coerenza, qualità e aderenza agli standard tra i diversi contributi degli agenti.
*   **Coordinamento Rilasci**: Gestirà il processo di rilascio delle versioni beta e successive.
*   **Gestione Documentazione Condivisa**: Monitorerà e garantirà che tutti i file di progettazione condivisi siano costantemente aggiornati e allineati.
*   **Quality Assurance**: Supervisionerà le attività di testing e garantirà che i criteri di accettazione siano soddisfatti prima di ogni rilascio.

## 6. Processo di Commit e Push

Quando un agente ha completato il proprio lavoro su una feature branch e ha aggiornato tutta la documentazione pertinente, **DEVE**:

1.  **Creare una Pull Request (PR)** sul repository Git, targettando il branch `develop`.
2.  **Richiedere la revisione** all'agente **ProjectLead**.
3.  **Attendere la conferma** da parte del ProjectLead per il merge. Il merge avverrà solo dopo che tutti i controlli automatici (CI/CD) saranno passati e la revisione manuale sarà stata approvata.
4.  **Il ProjectLead** sarà l'unico a effettuare il merge su `develop` e `main`.

**Autore**: Senior Software Developer  
**Data**: 28 Settembre 2025  
**Versione**: Beta 1.0 Multi-Agente

