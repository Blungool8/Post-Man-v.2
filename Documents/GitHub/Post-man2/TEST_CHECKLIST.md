# ✅ Test Checklist - Post-man2

## Setup Iniziale

- [ ] Installate dipendenze (`npm install`)
- [ ] File `.env` creato e configurato
- [ ] Database Supabase creato e schema eseguito
- [ ] API Key OpenRouteService ottenuta
- [ ] App avviata senza errori

## Test KML → GeoJSON

- [ ] File KML caricato correttamente
- [ ] Percorsi convertiti in GeoJSON
- [ ] Coordinate visualizzate su mappa
- [ ] Stop/fermate estratte correttamente
- [ ] Metadata KML accessibile

**Come testare:**
```bash
# 1. Avvia app
npm run web

# 2. Seleziona zona con KML
# 3. Verifica console per log conversione
# 4. Controlla che percorsi siano visualizzati
```

## Test Routing su Strada

- [ ] Toggle "Percorsi su strada" funziona
- [ ] Percorsi seguono strade (blu) vs linee rette (arancione)
- [ ] Cache routing funziona (secondo caricamento più veloce)
- [ ] Fallback a linee rette se API fallisce
- [ ] Indicatore loading durante calcolo routing

**Come testare:**
```bash
# 1. Carica un percorso KML
# 2. Attiva "Percorsi su strada" nel pannello controlli
# 3. Osserva percorso blu che segue strade
# 4. Disattiva per vedere linea retta arancione
# 5. Controlla console per log routing
```

**Debug:**
```
[RoutingService] Calcolo percorso con N waypoints...
[RoutingService] ✅ Percorso calcolato: X punti, Y km
```

## Test Marker Dinamici GPS

- [ ] Marker visibili su mappa
- [ ] Marker si ingrandiscono avvicinandosi
- [ ] Marker si rimpiccioliscono allontanandosi
- [ ] Animazioni smooth senza lag
- [ ] Label appare solo quando marker è grande
- [ ] Design minimal e pulito

**Come testare:**
```bash
# 1. Attiva GPS sul dispositivo
# 2. Concedi permessi location
# 3. Apri MapScreen
# 4. Cammina verso una fermata
# 5. Osserva marker ingrandirsi gradualmente
# 6. Allontanati e osserva rimpicciolirsi
```

**Parametri configurabili (.env):**
```env
MARKER_BASE_SIZE=30        # Dimensione base
MARKER_MAX_SCALE=2.5       # Scala max quando vicino
MARKER_MIN_SCALE=0.5       # Scala min quando lontano
MARKER_MAX_DISTANCE=500    # Distanza max in metri
```

**Verifica distanze:**
- < 10m: Scala massima (2.5x)
- 10m - 500m: Scala interpolata
- > 500m: Scala minima (0.5x)

## Test Database Supabase

### Autenticazione

- [ ] Registrazione nuovo utente funziona
- [ ] Login con credenziali corrette
- [ ] Logout corretto
- [ ] Errore su credenziali errate
- [ ] Stato autenticazione persistente

**Come testare:**
```bash
# 1. Clicca "Login richiesto" nel pannello
# 2. Registra nuovo utente: email + password
# 3. Verifica email di conferma (se attivato)
# 4. Login con credenziali
# 5. Verifica status "✅ Database connesso"
```

### Salvataggio Percorsi

- [ ] Percorso salvato con successo
- [ ] Nome e descrizione corretti
- [ ] Stop/fermate salvate
- [ ] Percorso visibile dopo riavvio app
- [ ] Percorso aggiornabile
- [ ] Percorso eliminabile

**Come testare:**
```bash
# 1. Carica un percorso KML
# 2. Login a Supabase
# 3. Clicca "💾 Salva Percorso"
# 4. Verifica messaggio "✅ Percorso salvato!"
# 5. Riavvia app
# 6. Verifica percorso ancora presente
```

**Verifica in Supabase Dashboard:**
```sql
SELECT * FROM routes WHERE user_id = 'YOUR_USER_ID';
```

### Percorsi Predefiniti

- [ ] Percorsi predefiniti visibili senza login
- [ ] Percorsi predefiniti non modificabili
- [ ] Percorsi predefiniti condivisi tra utenti

### Preferenze Utente

- [ ] Preferenze salvate correttamente
- [ ] Preferenze caricate al login
- [ ] Modifiche preferenze persistite
- [ ] Preferenze default create al primo login

## Test UI/UX

### MapScreen Enhanced

- [ ] Pannello controlli visibile e accessibile
- [ ] Info zona visualizzate correttamente
- [ ] Toggle switch funzionano
- [ ] Pulsanti camera centrano correttamente
- [ ] Pulsante indietro funziona
- [ ] Design minimal e pulito
- [ ] Colori consistenti
- [ ] Font leggibili

### Indicatori Stato

- [ ] GPS status indicator funziona
- [ ] Loading indicator durante routing
- [ ] Error badge mostrato su errori
- [ ] Database status visibile quando connesso
- [ ] Info marker visibili aggiornata in tempo reale

### Responsive

- [ ] Layout corretto su mobile (portrait)
- [ ] Layout corretto su tablet
- [ ] Layout corretto su web (landscape)
- [ ] Pannelli non ostruiscono mappa
- [ ] Touch target sufficientemente grandi

## Test Performance

- [ ] Caricamento KML < 2 secondi
- [ ] Routing API < 3 secondi
- [ ] Animazioni marker fluide (60fps)
- [ ] Scroll mappa senza lag
- [ ] Memoria app stabile (no leak)
- [ ] Cache routing riduce chiamate API

**Profiling:**
```bash
# React DevTools Profiler
# 1. Apri DevTools
# 2. Tab Profiler
# 3. Registra mentre navighi
# 4. Verifica render time < 16ms (60fps)
```

## Test Cross-Platform

### Web
- [ ] App carica su Chrome
- [ ] App carica su Firefox
- [ ] App carica su Safari
- [ ] Mappa interattiva
- [ ] GPS funziona (se supportato)

### Android
- [ ] APK si installa
- [ ] Permessi GPS richiesti
- [ ] GPS tracking funziona
- [ ] Marker animazioni fluide
- [ ] Rotazione schermo OK

### iOS
- [ ] IPA si installa
- [ ] Permessi location richiesti
- [ ] GPS tracking funziona
- [ ] Animazioni smooth
- [ ] Background location (se necessario)

## Test Edge Cases

### Network
- [ ] Funziona offline (dopo primo caricamento)
- [ ] Gestisce errori rete correttamente
- [ ] Retry automatico su fallimenti
- [ ] Fallback quando API non disponibili

### GPS
- [ ] Funziona senza GPS (marker fissi)
- [ ] Gestisce GPS spento
- [ ] Gestisce permessi negati
- [ ] Gestisce posizione imprecisa

### Dati
- [ ] Gestisce KML vuoti
- [ ] Gestisce KML corrotti
- [ ] Gestisce percorsi con 0 punti
- [ ] Gestisce percorsi con 1000+ punti
- [ ] Gestisce stop duplicati

### Database
- [ ] Gestisce timeout connessione
- [ ] Gestisce errori autenticazione
- [ ] Gestisce quota superata
- [ ] Gestisce conflitti dati

## Security

- [ ] API keys non esposte in codice
- [ ] .env in .gitignore
- [ ] RLS (Row Level Security) attivo su Supabase
- [ ] Utenti vedono solo i propri percorsi
- [ ] Percorsi predefiniti protetti da modifica
- [ ] Validazione input utente
- [ ] HTTPS per tutte le chiamate API

## Accessibility

- [ ] Touch target min 44x44 px
- [ ] Contrasto colori sufficiente
- [ ] Testo leggibile (min 12px)
- [ ] Labels descrittivi
- [ ] Error message chiari

## Documentazione

- [ ] README completo
- [ ] SETUP_GUIDE chiaro e aggiornato
- [ ] Commenti codice presenti
- [ ] TypeScript types documentati
- [ ] ENV variables documentate
- [ ] API endpoints documentati

## Deployment

- [ ] Build web funziona (`npm run build:web`)
- [ ] Build Android funziona (`eas build --platform android`)
- [ ] Build iOS funziona (`eas build --platform ios`)
- [ ] Environment prod configurato
- [ ] Analytics configurato (se necessario)

---

## Risultati Test

### Data: __________

**Tester:** __________

**Piattaforma:** Web / Android / iOS

**Risultato:** ✅ PASS / ❌ FAIL

**Note:**
```
Inserisci qui note, bug trovati, miglioramenti suggeriti
```

### Bug Trovati

1. **[SEVERITY]** Descrizione bug
   - **Steps to reproduce:**
   - **Expected:**
   - **Actual:**
   - **Fix:**

2. ...

### Performance Metrics

- **Caricamento KML:** ___ ms
- **Routing API:** ___ ms
- **FPS animazioni:** ___ fps
- **Memoria app:** ___ MB
- **Chiamate API (cache):** ___ (prima) / ___ (dopo)

---

## Sign-off

Tutti i test sono passati con successo?

- [ ] SÌ - App pronta per produzione
- [ ] NO - Richiede fix (vedi bug sopra)

**Firma:** ____________________ **Data:** __________

