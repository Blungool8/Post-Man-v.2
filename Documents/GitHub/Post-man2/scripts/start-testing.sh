#!/bin/bash

# Script per avviare l'app Post-Man per testing mobile
# Utilizzo: ./scripts/start-testing.sh

echo "🚀 Avvio Post-Man App per Testing Mobile"
echo "========================================"

# Verifica che siamo nella directory corretta
if [ ! -f "app-temp/package.json" ]; then
    echo "❌ Errore: Esegui questo script dalla root del progetto Post-Man"
    exit 1
fi

# Naviga nella cartella app-temp
cd app-temp

# Verifica che le dipendenze siano installate
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze..."
    npm install
fi

# Esegui test automatici
echo "🧪 Esecuzione test automatici..."
node ../scripts/test-app.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test superati! Avvio server di sviluppo..."
    echo ""
    echo "📱 ISTRUZIONI PER TESTING MOBILE:"
    echo "1. Installa Expo Go su dispositivo mobile:"
    echo "   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
    echo "   - iOS: https://apps.apple.com/app/expo-go/id982107779"
    echo ""
    echo "2. Scansiona il QR code che apparirà con Expo Go"
    echo ""
    echo "3. Segui la guida completa in MOBILE_TESTING_GUIDE.md"
    echo ""
    echo "🌐 Per testing web: http://localhost:8085"
    echo "📱 Per testing mobile: scansiona QR code"
    echo ""
    
    # Avvia Expo
    npx expo start
else
    echo "❌ Test falliti! Controlla gli errori sopra."
    exit 1
fi
