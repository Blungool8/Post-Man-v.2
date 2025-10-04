# 📱 Post-Man - Manuale Utente Semplice

**Versione**: 1.0
**Per**: Tutti - Anche chi non ha mai usato app di sviluppo

---

## 🎯 Cos'è Post-Man?

Post-Man è un'**app per cellulare** che aiuta i postini a seguire i loro percorsi di lavoro. Mostra una mappa con tutte le fermate del giorno e aiuta a capire qual è la prossima fermata.

**In parole semplici**: è come Google Maps, ma specificamente per i giri dei postini!

---

## 📦 Di Cosa Hai Bisogno

### Sul Tuo Computer

1. **Un computer** (Windows, Mac o Linux)
2. **Connessione Internet** (per scaricare l'app)
3. **30 minuti di tempo** (per la prima installazione)

### Sul Tuo Cellulare

1. **Uno smartphone** Android (versione 10 o superiore) o iPhone (iOS 15 o superiore)
2. **Spazio disponibile**: almeno 500 MB liberi
3. **GPS attivo** (quello che usi per Google Maps)

---

## 🚀 Prima Installazione (Passo-Passo)

Seguimi esattamente, passo dopo passo. Non preoccuparti dei termini tecnici!

### PASSO 1: Installa Expo Go sul Cellulare

**Cos'è Expo Go?** È un'app che ti permette di testare Post-Man senza doverla installare in modo definitivo.

1. Apri il **Play Store** (Android) o **App Store** (iPhone)
2. Cerca "**Expo Go**"
3. Premi "**Installa**" o "**Ottieni**"
4. Aspetta che si installi
5. **NON aprirla ancora** - la userai dopo

✅ **Fatto!** Hai installato Expo Go.

---

### PASSO 2: Scarica Post-Man sul Computer

1. Apri il browser (Chrome, Firefox, Edge...)
2. Vai su: `https://github.com/your-repo/Post-Man-clean` (chiedi l'indirizzo esatto)
3. Premi il bottone verde "**Code**"
4. Clicca "**Download ZIP**"
5. Salva il file sul **Desktop** (così lo trovi facilmente)
6. Fai **doppio click** sul file ZIP per estrarlo
7. Vedrai una cartella chiamata "**Post-Man-clean**"

✅ **Fatto!** Hai scaricato l'app sul computer.

---

### PASSO 3: Installa Node.js (Software Necessario)

**Cos'è Node.js?** È un software che permette al computer di far funzionare Post-Man. È gratuito e sicuro.

1. Apri il browser
2. Vai su: `https://nodejs.org`
3. Premi il bottone verde grande "**Download LTS**"
4. Salva il file
5. Fai **doppio click** sul file scaricato
6. Segui l'installazione (premi sempre "**Avanti**" o "**Next**")
7. Quando finisce, riavvia il computer

✅ **Fatto!** Node.js è installato.

---

### PASSO 4: Apri il Terminale (La Finestra Nera)

**Cos'è il Terminale?** È una finestra dove scrivi comandi al computer. Sembra complicata, ma è solo un altro modo di dare istruzioni!

**Su Windows:**
1. Premi il tasto con il logo Windows sulla tastiera
2. Scrivi "**PowerShell**"
3. Clicca su "**Windows PowerShell**"
4. Si aprirà una finestra blu scuro

**Su Mac:**
1. Premi `Command + Spazio`
2. Scrivi "**Terminal**"
3. Premi Invio
4. Si aprirà una finestra bianca

✅ **Fatto!** Hai aperto il Terminale.

---

### PASSO 5: Vai nella Cartella di Post-Man

Ora devi dire al computer di aprire la cartella dove hai messo Post-Man.

**Scrivi questo nel Terminale** (esattamente così):

**Windows:**
```
cd Desktop\Post-Man-clean
```

**Mac/Linux:**
```
cd Desktop/Post-Man-clean
```

Poi premi **Invio** sulla tastiera.

⚠️ **Non vedi niente?** È normale! Premi semplicemente Invio.

✅ **Fatto!** Sei dentro la cartella.

---

### PASSO 6: Installa i Componenti dell'App

Ora l'app deve scaricare tutte le sue "parti". Ci vogliono 5-10 minuti.

**Scrivi questo nel Terminale:**
```
npm install
```

Poi premi **Invio**.

🕐 **ASPETTA!** Vedrai scorrere tantissimo testo. È normale. Aspetta che finisca.

Quando vedi scritto qualcosa tipo "added 907 packages" significa che è finito.

✅ **Fatto!** L'app è pronta.

---

## 🧪 Come Testare l'App

Ora puoi finalmente provare l'app! Ci sono 3 modi:

---

### MODO 1: Test Veloce sul Computer (RACCOMANDATO PER INIZIARE)

**Cosa serve**: Solo il computer
**Tempo**: Instant startup
**Ideale per**: Vedere se funziona, provare pulsanti e menu

**Scrivi nel Terminale:**
```
npm run web
```

Poi premi **Invio**.

🎉 **Si aprirà il browser automaticamente!**

Vedrai Post-Man come se fosse un sito web. Puoi cliccare sui bottoni e provare le funzioni.

⚠️ **NOTA**: Su web **NON funziona il GPS reale** (perché il computer non ha GPS). Ma puoi vedere come è fatta l'app!

**Per chiudere**:
- Torna al Terminale
- Premi `Ctrl + C` (Windows/Linux) o `Command + C` (Mac)
- Scrivi `S` e premi Invio (se chiede conferma)

---

### MODO 2: Test sul Cellulare (CON GPS VERO)

**Cosa serve**: Computer + Cellulare + WiFi
**Tempo**: 30 secondi startup
**Ideale per**: Provare il GPS, vedere l'app vera

**PASSO A - Avvia il Server:**

Scrivi nel Terminale:
```
npm start
```

Poi premi **Invio**.

🕐 Aspetta 20-30 secondi. Vedrai apparire un **QR Code** (un quadrato con puntini neri).

**PASSO B - Scansiona con il Cellulare:**

**Android:**
1. Apri l'app **Expo Go** sul cellulare
2. Premi "**Scan QR Code**"
3. Inquadra il QR Code sullo schermo del computer
4. Aspetta che l'app si carichi (30 secondi circa)

**iPhone:**
1. Apri l'app **Camera** (quella normale del telefono)
2. Inquadra il QR Code
3. Vedrai apparire una notifica "**Open in Expo Go**"
4. Premi sulla notifica
5. Aspetta che l'app si carichi

🎉 **L'app è sul telefono!** Ora puoi usarla come un'app normale.

⚠️ **IMPORTANTE**: Cellulare e computer devono essere sulla **stessa rete WiFi**!

**Per chiudere**:
- Torna al Terminale sul computer
- Premi `Ctrl + C` o `Command + C`

---

### MODO 3: Test con Android Emulator (Avanzato)

⚠️ **Questo è complicato!** Usa solo se sei pratico di computer.

**Cosa serve**: Android Studio installato + Emulatore configurato
**Ideale per**: Test GPS simulato senza telefono reale

**Se vuoi provare**:
1. Installa Android Studio: `https://developer.android.com/studio`
2. Crea un emulatore (Device Manager → Create Device)
3. Avvia l'emulatore
4. Scrivi nel Terminale: `npm run android`

Vedi `TESTING_WORKFLOW.md` per istruzioni dettagliate.

---

## 🗺️ Come Usare l'App

Ora che l'app funziona, ecco cosa puoi fare:

### 🏠 Schermata Iniziale

Quando apri l'app vedrai:
- **"Seleziona Zona"**: Bottone giallo grande al centro
- **"Liste Fermate"**: Bottone verde a destra
- **"Crea Lista"**: Bottone verde a destra

### 📍 Selezionare una Zona

1. Premi "**🎯 Seleziona Zona**"
2. Vedrai una lista di zone (Zona 1, Zona 2, ecc.)
3. Scegli la tua zona (es. "**Zona 12**")
4. Ti chiederà: "**Zona A o Zona B?**"
5. Scegli A o B (dipende dal tuo turno)
6. **Si apre la mappa!** 🗺️

### 🗺️ Usare la Mappa

Quando la mappa è aperta:
- **Trascina** con un dito per muoverti
- **Pinch** (due dita) per zoom in/out
- Vedrai la **tua posizione** (punto blu)
- Vedrai le **fermate** (marker colorati)

**Bottoni disponibili**:
- **← Torna**: Torna alla schermata iniziale
- **📍 Trova Fermate GPS**: Trova fermate vicine (futuro)
- **🗺️ Modalità Offline**: Attiva mappa offline (futuro)

### 📋 Gestire le Fermate

**Creare una lista di fermate**:
1. Premi "**➕ Crea Lista**"
2. Scrivi un nome (es. "Giro Mattina")
3. Premi "**Crea**"

**Vedere una lista**:
1. Premi "**📋 Liste Fermate**"
2. Scegli una lista dalla lista
3. Vedrai tutte le fermate

**Completare una fermata**:
1. Premi sulla fermata nella lista
2. Premi "**✅ Completa Fermata**"
3. La fermata diventa verde ✅

---

## ❓ Domande Frequenti

### "Non vedo il QR Code"
**Soluzione**:
- Aspetta 30-40 secondi dopo aver scritto `npm start`
- Controlla che il terminale non mostri errori rossi
- Prova a chiudere (Ctrl+C) e riscrivere `npm start`

### "Il cellulare non si connette"
**Soluzione**:
- Computer e cellulare devono essere sulla **stessa rete WiFi**
- Prova a riavviare Expo Go sul cellulare
- Prova a scrivere nel terminale: `npm start` e poi premere `w` (apre web)

### "L'app si chiude da sola"
**Soluzione**:
- Guarda il Terminale sul computer per errori
- Riavvia con: chiudi tutto, poi `npm start` di nuovo
- Se persiste, scrivi `npm install` di nuovo

### "Il GPS non funziona"
**Soluzione**:
- Su **web** il GPS non funziona MAI (è normale)
- Su **cellulare**: vai in Impostazioni → App → Expo Go → Permessi → Attiva "Posizione"
- Su **emulatore**: usa Extended Controls (⋮) → Location → Set coordinates

### "Vedo scritte strane/errori rossi"
**Soluzione**:
1. Scrivi nel Terminale: `npm run type-check`
2. Aspetta (controlla se ci sono errori)
3. Se vedi errori, fai uno screenshot e chiedi aiuto
4. Se NO errori, tutto ok!

### "Come aggiorno l'app?"
**Soluzione**:
1. Chiudi l'app (Ctrl+C nel Terminale)
2. Scarica di nuovo la cartella da GitHub
3. Sovrascrivi la vecchia cartella
4. Ri-scrivi `npm install` nel Terminale
5. Riavvia con `npm start`

### "Posso installare l'app in modo permanente?"
**Risposta**: Sì, ma richiede un processo più complesso chiamato "build". Per ora usa Expo Go per i test. Quando l'app è pronta, verrà fornita un'app "vera" da installare dal Play Store/App Store.

---

## 🛠️ Comandi Utili da Ricordare

Questi sono i comandi che userai più spesso. **Salvali** in un posto comodo!

### Comandi Base

| Cosa Vuoi Fare | Scrivi nel Terminale |
|----------------|---------------------|
| Aprire l'app sul computer (web) | `npm run web` |
| Aprire l'app sul cellulare | `npm start` (poi scansiona QR) |
| Fermare l'app | `Ctrl + C` o `Command + C` |
| Controllare se ci sono errori | `npm run type-check` |
| Reinstallare l'app | `npm install` |

### Andare nella Cartella Giusta

**Windows:**
```powershell
cd Desktop\Post-Man-clean
```

**Mac/Linux:**
```bash
cd Desktop/Post-Man-clean
```

### Script Veloci (Scorciatoie)

**Windows PowerShell:**
```powershell
.\scripts\dev-web.ps1      # Avvia versione web
.\scripts\dev.ps1          # Menu con tutte le opzioni
```

**Mac/Linux:**
```bash
./scripts/dev-web.sh       # Avvia versione web
./scripts/dev.sh           # Menu con tutte le opzioni
```

---

## 🔧 Risoluzione Problemi Comuni

### Problema: "npm: comando non trovato"

**Significa**: Node.js non è installato correttamente

**Soluzione**:
1. Chiudi il Terminale
2. Vai su `https://nodejs.org` e scarica di nuovo
3. Installa Node.js
4. **Riavvia il computer**
5. Riapri il Terminale e riprova

---

### Problema: "Cannot find module..."

**Significa**: Alcuni file dell'app mancano

**Soluzione**:
```
npm install
```
Aspetta che finisca, poi riprova.

---

### Problema: "Port 8081 already in use"

**Significa**: L'app è già aperta da qualche parte

**Soluzione**:
1. Chiudi tutte le finestre del Terminale
2. Riapri il Terminale
3. Riprova

**Se non funziona (Windows)**:
1. Apri Task Manager (Ctrl+Shift+Esc)
2. Cerca "Node.js"
3. Clicca destro → "Termina Attività"
4. Riprova

---

### Problema: "Network error" su Expo Go

**Significa**: Cellulare e computer non si parlano

**Soluzione**:
1. Verifica che siano sulla **stessa rete WiFi**
2. Disattiva VPN se attiva
3. Riavvia Expo Go sul cellulare
4. Prova a chiudere e riaprire `npm start`

**Alternativa (usa tunnel)**:
```
npx expo start --tunnel
```
(Più lento ma funziona sempre)

---

## 📞 Hai Bisogno di Aiuto?

### Prima di Chiedere Aiuto

1. ✅ Hai seguito **tutti i passi** esattamente come scritto?
2. ✅ Hai aspettato abbastanza (alcuni passi richiedono 30+ secondi)?
3. ✅ Hai provato a **riavviare** (chiudere tutto e riaprire)?
4. ✅ Hai controllato la sezione "**Risoluzione Problemi**" qui sopra?

### Come Chiedere Aiuto Efficacemente

Se hai ancora problemi, raccogli queste informazioni:

1. **Cosa stavi facendo**: "Stavo provando a..."
2. **Cosa è successo**: "Ho visto questo errore..."
3. **Screenshot**: Fai uno screenshot dell'errore
4. **Sistema**: Windows / Mac / Linux
5. **Tipo cellulare**: Android / iPhone

Esempio di richiesta di aiuto:
```
"Stavo provando ad aprire l'app con npm start.
Ho visto questo errore: [screenshot]
Sistema: Windows 11
Cellulare: Android Samsung Galaxy S21"
```

### Dove Trovare Aiuto

- **Documentazione tecnica**: `TESTING_WORKFLOW.md` (per utenti esperti)
- **Problemi noti**: Controlla file `pk/BUGS.md`
- **GitHub Issues**: Apri un issue nel repository

---

## 📚 Prossimi Passi

### Hai Fatto Funzionare l'App? Congratulazioni! 🎉

Ora puoi:

1. **Esplorare l'interfaccia**: Prova tutti i bottoni
2. **Creare liste di fermate**: Simula un giro
3. **Testare la mappa**: Zoom, pan, esplora
4. **Provare su cellulare**: Testa con il GPS reale

### Vuoi Contribuire al Progetto?

Se sei diventato più esperto e vuoi aiutare:
1. Leggi `CONTRIBUTING.md` (se esiste)
2. Guarda `pk/tasks.txt` per vedere cosa manca
3. Prova l'app e segnala bug in `pk/BUGS.md`

---

## 📖 Glossario (Parole Difficili Spiegate)

- **Terminale/PowerShell**: La finestra dove scrivi comandi al computer
- **npm**: Un programma che gestisce le "parti" dell'app
- **Node.js**: Software che fa funzionare Post-Man sul computer
- **Expo Go**: App che ti permette di testare Post-Man senza installarla
- **QR Code**: Il quadratino con i puntini neri che scansioni
- **WiFi**: Internet senza fili (deve essere lo stesso per PC e cellulare)
- **GPS**: Il sistema che ti dice dove sei (come Google Maps)
- **Emulatore**: Un cellulare finto sul computer (per test)
- **Build**: Il processo di creare l'app "vera" da installare
- **Type-check**: Controllo automatico che l'app non abbia errori

---

## ✅ Checklist Finale

Prima di iniziare a testare sul serio, verifica di aver fatto tutto:

- [ ] Ho installato Expo Go sul cellulare
- [ ] Ho scaricato Post-Man sul computer
- [ ] Ho installato Node.js
- [ ] Ho scritto `npm install` e ha funzionato
- [ ] Ho provato `npm run web` e funziona
- [ ] Ho capito come aprire il Terminale
- [ ] So come fermare l'app (Ctrl+C)
- [ ] Ho salvato i comandi utili da qualche parte

**Tutto fatto?** Sei pronto! 🚀

---

**Ultimo aggiornamento**: Ottobre 2025
**Versione App**: 1.0 Beta
**Difficoltà**: Principiante ⭐☆☆☆☆

**Ricorda**: Tutti siamo stati principianti! Non aver paura di sbagliare. L'app non può rompere il computer. Nel peggiore dei casi, chiudi tutto e riparti da capo. Buon lavoro! 📱✨
