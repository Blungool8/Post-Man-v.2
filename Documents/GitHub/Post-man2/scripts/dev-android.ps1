# Script PowerShell per sviluppo Android
# Avvia Expo su emulatore Android con funzionalità native

Write-Host "📱 Avvio Post-Man - Modalità Android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Vantaggi Android Emulator:" -ForegroundColor Green
Write-Host "   • GPS simulato configurabile" -ForegroundColor Gray
Write-Host "   • react-native-maps nativa" -ForegroundColor Gray
Write-Host "   • Test permessi nativi" -ForegroundColor Gray
Write-Host "   • Hot-reload funzionante" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Simulare GPS:" -ForegroundColor Blue
Write-Host "   1. Apri Extended Controls (⋮)" -ForegroundColor Gray
Write-Host "   2. Location → Set custom coordinates" -ForegroundColor Gray
Write-Host "   3. Piacenza: 45.0526, 9.6934" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Requisiti:" -ForegroundColor Yellow
Write-Host "   • Android Studio installato" -ForegroundColor Gray
Write-Host "   • Emulatore Android creato e avviato" -ForegroundColor Gray
Write-Host ""

# Verifica emulatore
Write-Host "🔍 Verifica emulatori disponibili..." -ForegroundColor Blue
& adb devices

Write-Host ""
Write-Host "🚀 Avvio app su emulatore Android..." -ForegroundColor Green
Write-Host ""

# Esegui npm run android
npm run android
