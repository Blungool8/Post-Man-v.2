# 🧪 Testing Workflow - Post-Man App

Guida completa al workflow di testing per sviluppo efficace tra desktop e mobile.

---

## 🎯 Obiettivi del Workflow

- **Sviluppo rapido** su desktop con hot-reload
- **Testing funzionalità native** su emulatore
- **Validazione finale** su dispositivo reale
- **Minimizzare testing mobile** durante sviluppo

---

## 📋 Prerequisiti

### Installazione Dipendenze
```bash
npm install
```

### Verifica Configurazione
```bash
# Verifica Expo CLI
npx expo --version  # Dovrebbe mostrare: 54.0.8

# Verifica TypeScript
npm run type-check

# Verifica linting
npm run lint
```

---

## 🔄 Workflow Raccomandato

### FASE 1: Sviluppo UI/UX (Desktop - Web)

**Quando usarlo:**
- Sviluppo layout e componenti UI
- Iterazioni rapide su stili e interazioni
- Debug logica applicazione
- Test flussi utente base

**Come:**
```bash
npm run web
```

**Vantaggi:**
✅ Hot-reload istantaneo
✅ DevTools browser (React DevTools, Console, Network)
✅ Debugging veloce
✅ Nessun setup device/emulatore

**Limitazioni:**
❌ GPS non funzionante (mock position via DevTools)
❌ `react-native-maps` non disponibile (mappa simulata)
❌ Alcune API native non supportate
❌ File system limitato

**Accesso:**
- Browser: `http://localhost:8081`
- Mobile (stesso WiFi): `http://<your-ip>:8081`

---

### FASE 2: Testing Funzionalità Native (Emulatore)

**Quando usarlo:**
- Testing GPS e location tracking
- Testing react-native-maps
- Testing permessi nativi (camera, storage)
- Validazione funzionalità offline

**Come:**

#### Android Emulator
```bash
# Prima volta: crea emulatore Android Studio
# Avvia emulatore, poi:
npm run android
```

**Simulare GPS su Android:**
1. Apri Extended Controls (⋮ nell'emulatore)
2. Location → Coordinate custom
3. Imposta lat/lng (es. Piacenza: 45.0526, 9.6934)

#### iOS Simulator (solo macOS)
```bash
npm run ios
```

**Simulare GPS su iOS:**
1. Debug → Location → Custom Location
2. Imposta coordinate

**Vantaggi:**
✅ Ambiente molto simile al reale
✅ GPS simulato configurabile
✅ Hot-reload funzionante
✅ Testing permessi nativi
✅ Performance predittive

**Limitazioni:**
⚠️ Setup iniziale richiesto
⚠️ Performance dipendono da hardware
⚠️ Non identico a device reale (batteria, sensori)

---

### FASE 3: Validazione Finale (Dispositivo Reale)

**Quando usarlo:**
- Test finali pre-release
- Validazione GPS reale outdoor
- Testing performance su device target
- User testing con utenti finali

**Come:**

1. **Installa Expo Go**
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Avvia dev server**
   ```bash
   npm start
   ```

3. **Scansiona QR Code**
   - Android: Direttamente da Expo Go
   - iOS: Camera app → Apri in Expo Go

**Vantaggi:**
✅ GPS reale
✅ Performance reali
✅ Test su dispositivi target
✅ User testing efficace

**Limitazioni:**
⚠️ Più lento per iterazioni
⚠️ Richiede stesso WiFi (o tunnel con `npx expo start --tunnel`)

---

## 🚀 Script Helper Disponibili

### Sviluppo
```bash
npm start          # Server Expo con menu interattivo
npm run web        # Avvia direttamente su web
npm run android    # Avvia su Android emulator
npm run ios        # Avvia su iOS simulator
```

### Qualità Codice
```bash
npm run lint       # Verifica errori ESLint
npm run lint:fix   # Auto-fix errori ESLint
npm run format     # Formatta con Prettier
npm run type-check # Verifica TypeScript
```

### Testing Automatico
```bash
node scripts/test-app.js  # Esegui test struttura app
```

### Sviluppo Rapido
```bash
# Script custom per workflow ottimizzato
./scripts/start-testing.sh   # Linux/macOS
.\scripts\start-testing.ps1  # Windows PowerShell
```

---

## 🎨 Configurazione DevTools

### React DevTools (Web)
```bash
npm install -g react-devtools
react-devtools
```

### Mock GPS su Web
Usa Chrome DevTools:
1. `F12` → Console
2. `⋮` (menu) → More Tools → Sensors
3. Location → Custom → Imposta coordinate

---

## 🐛 Troubleshooting

### Problema: "Metro bundler port already in use"
```bash
# Trova e killa processo
npx react-native start --reset-cache
```

### Problema: Emulatore Android non connesso
```bash
# Verifica dispositivi
adb devices

# Restart ADB
adb kill-server && adb start-server
```

### Problema: Expo Go non connette
```bash
# Usa tunnel (bypassa WiFi locale)
npx expo start --tunnel
```

### Problema: Hot reload non funziona
```bash
# Reset cache Metro
npx expo start --clear

# Oppure rebuild completo
rm -rf node_modules .expo
npm install
```

### Problema: TypeScript errors
```bash
# Verifica errori
npm run type-check

# Se persistono dopo fix, riavvia VS Code
```

---

## 📊 Metriche di Qualità

Prima di commit/release, verifica:

```bash
# 1. Type check
npm run type-check

# 2. Linting
npm run lint

# 3. Formatting
npm run format:check

# 4. Test struttura
node scripts/test-app.js
```

---

## 🎯 Best Practices

### Durante Sviluppo

1. **Inizia sempre con web** per UI/UX
2. **Testa funzionalità native su emulatore** quando necessario
3. **Usa device reale solo per validazione finale**
4. **Committi codice solo dopo type-check + lint**

### Per Features GPS-intensive

1. Sviluppa logica su web con coordinate mock
2. Testa su emulatore con GPS simulato
3. Valida outdoor su device reale

### Per Performance

1. Profila con React DevTools
2. Testa rendering con lista grandi (100+ marker)
3. Monitora memoria su device reale

---

## 🔧 Setup Emulatori (Prima Volta)

### Android Studio Setup

1. **Installa Android Studio**
   - [Download](https://developer.android.com/studio)

2. **Configura AVD (Android Virtual Device)**
   - Tools → AVD Manager → Create Virtual Device
   - Scegli: Pixel 5 o 6 (performance bilanciate)
   - System Image: Android 13 (API 33) o superiore
   - RAM: 2048+ MB
   - Storage: 2048+ MB

3. **Abilita Hardware Acceleration**
   - Windows: Intel HAXM o AMD Hypervisor
   - macOS/Linux: Built-in KVM

### Xcode Setup (macOS only)

1. **Installa Xcode**
   - App Store o [developer.apple.com](https://developer.apple.com/xcode/)

2. **Installa Command Line Tools**
   ```bash
   xcode-select --install
   ```

3. **Accetta License**
   ```bash
   sudo xcodebuild -license accept
   ```

---

## 📱 Dati di Test

### Coordinate Test Piacenza
```javascript
// CTD Castel San Giovanni
{ latitude: 45.0600, longitude: 9.4300 }

// Piacenza Centro
{ latitude: 45.0526, longitude: 9.6934 }

// Zona Test con fermate multiple
// Vedi: src/config/ZoneConfig.js
```

### Percorsi Sample
```bash
# Genera file JSON sample
# TODO: Creare script generate-sample-routes.js
```

---

## 💡 Tips & Tricks

### Hot Reload Efficace
- Usa `r` per reload manual (console Expo)
- Usa `Shift + R` per reload completo

### Debug Network
- Su web: Chrome DevTools → Network
- Su emulatore/device: `npx react-native log-android` o `log-ios`

### Testing Offline
1. Sviluppa online normalmente
2. Abilita modalità aereo su device/emulatore
3. Verifica che tiles/dati offline funzionino

---

## 📞 Supporto

### Problemi Tecnici
- Controlla questo documento prima
- Verifica [Expo Docs](https://docs.expo.dev/)
- Cerca in Issues repository

### Feature Requests
- Apri Issue con label `enhancement`
- Descrivi caso d'uso e benefici

---

**Ultimo aggiornamento**: Ottobre 2025
**Versione App**: Beta 1.0
**Versione Expo SDK**: 54
