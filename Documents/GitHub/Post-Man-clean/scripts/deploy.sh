#!/bin/bash

# Script Deploy Automatico - Post-Man App
# Utilizzo: ./scripts/deploy.sh [web|android|ios]

echo "🚀 Deploy Post-Man App"
echo "======================"

DEPLOY_TYPE=${1:-web}

case $DEPLOY_TYPE in
  "web")
    echo "🌐 Deploy Web App..."
    
    # Naviga nella cartella app-temp
    cd app-temp
    
    # Test automatici
    echo "🧪 Esecuzione test..."
    node ../scripts/test-app.js
    
    if [ $? -eq 0 ]; then
      echo "✅ Test superati! Procedo con il build..."
      
      # Build web
      echo "📦 Building web app..."
      npx expo export:web
      
      if [ -d "dist" ]; then
        echo "✅ Build completato!"
        echo ""
        echo "📁 File pronti in: app-temp/dist/"
        echo ""
        echo "🌐 Per deploy su Vercel:"
        echo "1. Installa Vercel CLI: npm i -g vercel"
        echo "2. Esegui: vercel"
        echo ""
        echo "🌐 Per deploy su Netlify:"
        echo "1. Vai su https://netlify.com"
        echo "2. Drag & drop la cartella 'dist'"
        echo ""
        echo "🎉 App web pronta per il deploy!"
      else
        echo "❌ Errore nel build web"
        exit 1
      fi
    else
      echo "❌ Test falliti! Deploy annullato."
      exit 1
    fi
    ;;
    
  "android")
    echo "📱 Deploy Android App..."
    
    cd app-temp
    
    # Test automatici
    node ../scripts/test-app.js
    
    if [ $? -eq 0 ]; then
      echo "✅ Test superati! Procedo con il build Android..."
      
      # Build Android
      echo "📦 Building Android APK..."
      npx expo build:android --type apk
      
      echo "✅ Build Android completato!"
      echo ""
      echo "📱 APK disponibile su: https://expo.dev"
      echo "📱 Per Google Play Store: npx expo build:android --type app-bundle"
      echo ""
    else
      echo "❌ Test falliti! Deploy annullato."
      exit 1
    fi
    ;;
    
  "ios")
    echo "🍎 Deploy iOS App..."
    
    cd app-temp
    
    # Test automatici
    node ../scripts/test-app.js
    
    if [ $? -eq 0 ]; then
      echo "✅ Test superati! Procedo con il build iOS..."
      
      # Build iOS
      echo "📦 Building iOS App..."
      npx expo build:ios
      
      echo "✅ Build iOS completato!"
      echo ""
      echo "🍎 App disponibile su: https://expo.dev"
      echo "🍎 Per App Store: npx expo build:ios --type archive"
      echo ""
    else
      echo "❌ Test falliti! Deploy annullato."
      exit 1
    fi
    ;;
    
  *)
    echo "❌ Tipo di deploy non valido!"
    echo ""
    echo "Utilizzo: ./scripts/deploy.sh [web|android|ios]"
    echo ""
    echo "Esempi:"
    echo "  ./scripts/deploy.sh web      # Deploy web app"
    echo "  ./scripts/deploy.sh android  # Deploy Android APK"
    echo "  ./scripts/deploy.sh ios      # Deploy iOS App"
    exit 1
    ;;
esac

echo "🎉 Deploy completato con successo!"
