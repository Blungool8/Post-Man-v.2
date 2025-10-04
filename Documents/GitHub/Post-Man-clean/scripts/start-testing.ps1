# Script PowerShell per avviare l'app Post-Man per testing mobile
# Utilizzo: .\scripts\start-testing.ps1

Write-Host "🚀 Avvio Post-Man App per Testing Mobile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verifica che siamo nella directory corretta
if (-not (Test-Path "app-temp/package.json")) {
    Write-Host "❌ Errore: Esegui questo script dalla root del progetto Post-Man" -ForegroundColor Red
    exit 1
}

# Naviga nella cartella app-temp
Set-Location app-temp

# Verifica che le dipendenze siano installate
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installazione dipendenze..." -ForegroundColor Yellow
    npm install
}

# Esegui test automatici
Write-Host "🧪 Esecuzione test automatici..." -ForegroundColor Blue
node ../scripts/test-app.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Test superati! Avvio server di sviluppo..." -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 ISTRUZIONI PER TESTING MOBILE:" -ForegroundColor Cyan
    Write-Host "1. Installa Expo Go su dispositivo mobile:" -ForegroundColor White
    Write-Host "   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent" -ForegroundColor Gray
    Write-Host "   - iOS: https://apps.apple.com/app/expo-go/id982107779" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Scansiona il QR code che apparirà con Expo Go" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Segui la guida completa in MOBILE_TESTING_GUIDE.md" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Per testing web: http://localhost:8085" -ForegroundColor Green
    Write-Host "📱 Per testing mobile: scansiona QR code" -ForegroundColor Green
    Write-Host ""
    
    # Avvia Expo
    npx expo start
} else {
    Write-Host "❌ Test falliti! Controlla gli errori sopra." -ForegroundColor Red
    exit 1
}
