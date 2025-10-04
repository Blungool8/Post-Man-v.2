# Script PowerShell Deploy Automatico - Post-Man App
# Utilizzo: .\scripts\deploy.ps1 [web|android|ios]

param(
    [string]$DeployType = "web"
)

Write-Host "🚀 Deploy Post-Man App" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

switch ($DeployType) {
    "web" {
        Write-Host "🌐 Deploy Web App..." -ForegroundColor Blue
        
        # Naviga nella cartella app-temp
        Set-Location app-temp
        
        # Test automatici
        Write-Host "🧪 Esecuzione test..." -ForegroundColor Yellow
        node ../scripts/test-app.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Test superati! Procedo con il build..." -ForegroundColor Green
            
            # Build web
            Write-Host "📦 Building web app..." -ForegroundColor Yellow
            npx expo export:web
            
            if (Test-Path "dist") {
                Write-Host "✅ Build completato!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📁 File pronti in: app-temp/dist/" -ForegroundColor White
                Write-Host ""
                Write-Host "🌐 Per deploy su Vercel:" -ForegroundColor Cyan
                Write-Host "1. Installa Vercel CLI: npm i -g vercel" -ForegroundColor Gray
                Write-Host "2. Esegui: vercel" -ForegroundColor Gray
                Write-Host ""
                Write-Host "🌐 Per deploy su Netlify:" -ForegroundColor Cyan
                Write-Host "1. Vai su https://netlify.com" -ForegroundColor Gray
                Write-Host "2. Drag & drop la cartella 'dist'" -ForegroundColor Gray
                Write-Host ""
                Write-Host "🎉 App web pronta per il deploy!" -ForegroundColor Green
            } else {
                Write-Host "❌ Errore nel build web" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ Test falliti! Deploy annullato." -ForegroundColor Red
            exit 1
        }
    }
    
    "android" {
        Write-Host "📱 Deploy Android App..." -ForegroundColor Blue
        
        Set-Location app-temp
        
        # Test automatici
        node ../scripts/test-app.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Test superati! Procedo con il build Android..." -ForegroundColor Green
            
            # Build Android
            Write-Host "📦 Building Android APK..." -ForegroundColor Yellow
            npx expo build:android --type apk
            
            Write-Host "✅ Build Android completato!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📱 APK disponibile su: https://expo.dev" -ForegroundColor White
            Write-Host "📱 Per Google Play Store: npx expo build:android --type app-bundle" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host "❌ Test falliti! Deploy annullato." -ForegroundColor Red
            exit 1
        }
    }
    
    "ios" {
        Write-Host "🍎 Deploy iOS App..." -ForegroundColor Blue
        
        Set-Location app-temp
        
        # Test automatici
        node ../scripts/test-app.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Test superati! Procedo con il build iOS..." -ForegroundColor Green
            
            # Build iOS
            Write-Host "📦 Building iOS App..." -ForegroundColor Yellow
            npx expo build:ios
            
            Write-Host "✅ Build iOS completato!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🍎 App disponibile su: https://expo.dev" -ForegroundColor White
            Write-Host "🍎 Per App Store: npx expo build:ios --type archive" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host "❌ Test falliti! Deploy annullato." -ForegroundColor Red
            exit 1
        }
    }
    
    default {
        Write-Host "❌ Tipo di deploy non valido!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Utilizzo: .\scripts\deploy.ps1 [web|android|ios]" -ForegroundColor White
        Write-Host ""
        Write-Host "Esempi:" -ForegroundColor Cyan
        Write-Host "  .\scripts\deploy.ps1 web      # Deploy web app" -ForegroundColor Gray
        Write-Host "  .\scripts\deploy.ps1 android  # Deploy Android APK" -ForegroundColor Gray
        Write-Host "  .\scripts\deploy.ps1 ios      # Deploy iOS App" -ForegroundColor Gray
        exit 1
    }
}

Write-Host "🎉 Deploy completato con successo!" -ForegroundColor Green
