# 🐛 Bug Tracker - Post-Man Project

**Purpose**: Tracciare bug noti, workaround, fix
**Update**: Quando si trova un bug
**Close**: Quando bug è fixato (non cancellare, marcare ✅)

---

## Template Bug Report

```markdown
## [BUG-###] Titolo Bug

**Status**: 🔴 Open / 🟡 In Progress / ✅ Fixed
**Severity**: 🔥 Critical / ⚠️ High / 📌 Medium / 🔵 Low
**Affected**: [Componente/Feature]
**Found**: YYYY-MM-DD
**Fixed**: YYYY-MM-DD (se applicabile)

**Description**:
[Descrizione chiara del bug]

**Steps to Reproduce**:
1. [Passo 1]
2. [Passo 2]
3. [Vedere bug]

**Expected Behavior**:
[Cosa dovrebbe succedere]

**Actual Behavior**:
[Cosa succede invece]

**Environment**:
- OS: [Android 13 / iOS 16]
- Device: [Samsung A52 / iPhone 12]
- App Version: [v1.0.0]

**Logs/Screenshots**:
```
[Paste logs or link screenshot]
```

**Root Cause** (se trovata):
[Analisi tecnica della causa]

**Fix** (se applicato):
[Descrizione del fix]
- PR: #123
- Commit: abc1234

**Workaround** (temporaneo):
[Come aggirare il bug fino al fix]

**Related**:
- Bug-002 (similar issue)
- Task T42 (dove trovato)
```

---

## [BUG-EXAMPLE] Expo Metro Bundler Port Conflict

**Status**: ✅ Fixed
**Severity**: 📌 Medium
**Affected**: Development Workflow
**Found**: 2025-10-04
**Fixed**: 2025-10-04

**Description**:
Quando `npm start` viene eseguito mentre un'altra istanza è già attiva, Metro bundler fallisce con errore "Port 8081 already in use".

**Steps to Reproduce**:
1. Esegui `npm start` in un terminale
2. Senza chiudere, apri nuovo terminale
3. Esegui `npm start` di nuovo
4. Errore: Port 8081 already in use

**Expected Behavior**:
Messaggio chiaro che indica di chiudere istanza precedente, o auto-kill processo esistente.

**Actual Behavior**:
Errore generico, processo non si chiude, confusione utente.

**Environment**:
- OS: Windows 11
- Node: 18.16.0
- Expo: 54.0.8

**Logs/Screenshots**:
```
Error: listen EADDRINUSE: address already in use :::8081
```

**Root Cause**:
Processo Node.js precedente non terminato correttamente quando terminale chiuso con X invece di Ctrl+C.

**Fix**:
Documentato in `TESTING_WORKFLOW.md` e `MANUALE_UTENTE.md`:
- Sezione Troubleshooting spiega come killare processo
- Windows: Task Manager → Node.js → End Task
- Mac/Linux: `killall node`

**Workaround**:
Sempre chiudere con Ctrl+C, oppure killare processo manualmente prima di riaprire.

**Related**:
- MANUALE_UTENTE.md sezione "Port 8081 already in use"

---

## Instructions for Bug Reporting

**Quando trovi un bug**:

1. **Cerca prima** in questo file se già esiste
2. **Riproduci** il bug almeno 2 volte
3. **Raccogli logs** (console, error stack, screenshot)
4. **Compila template** completo sopra
5. **Assegna ID** sequenziale (BUG-001, BUG-002...)
6. **Prioritizza** severity correttamente:
   - 🔥 **Critical**: App crasha, data loss, blocker
   - ⚠️ **High**: Feature principale non funziona
   - 📌 **Medium**: Feature secondaria broken, UX impattata
   - 🔵 **Low**: Cosmetic, edge case raro

**Priority di Fix**:
- 🔥 Critical: Fix immediato, blocca tutto
- ⚠️ High: Fix entro 24h
- 📌 Medium: Fix entro milestone corrente
- 🔵 Low: Backlog, fix quando possibile

**Quando fixato**:
- Aggiorna **Status** a ✅
- Aggiungi **Fixed** date
- Descrivi **Fix** con PR/commit link
- **Non cancellare** bug (storico utile)

---

## Active Bugs (Template)

Quando ci saranno bug attivi, appariranno qui sotto.
Per ora: 🎉 **0 bugs attivi!**

---

## Fixed Bugs Archive

### ✅ [BUG-EXAMPLE] Metro Port Conflict
See details above in template section.

---

**Tracker Iniziato**: 2025-10-04
**Ultimo Aggiornamento**: 2025-10-04
**Bug Totali**: 0 active, 1 example (for template)
