# Script PowerShell per sviluppo rapido Web
# Avvia Expo Web con hot-reload per sviluppo UI/UX veloce

Write-Host "🌐 Avvio Post-Man - Modalità Web" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Vantaggi Web:" -ForegroundColor Green
Write-Host "   • Hot-reload istantaneo" -ForegroundColor Gray
Write-Host "   • DevTools browser integrati" -ForegroundColor Gray
Write-Host "   • Iterazioni UI rapide" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Limitazioni Web:" -ForegroundColor Yellow
Write-Host "   • GPS non disponibile (usa mock)" -ForegroundColor Gray
Write-Host "   • react-native-maps simulata" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Aprirà automaticamente: http://localhost:8081" -ForegroundColor Blue
Write-Host ""

# Esegui npm run web
npm run web
