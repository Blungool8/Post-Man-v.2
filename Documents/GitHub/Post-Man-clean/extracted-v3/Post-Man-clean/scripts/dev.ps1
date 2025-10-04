# Script PowerShell per sviluppo generale con menu interattivo
# Avvia Expo dev server con opzioni multiple

Write-Host "🚀 Post-Man - Development Server" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Menu Interattivo Expo:" -ForegroundColor Green
Write-Host "   • Premi 'w' per aprire su Web" -ForegroundColor Gray
Write-Host "   • Premi 'a' per Android emulator" -ForegroundColor Gray
Write-Host "   • Premi 'i' per iOS simulator" -ForegroundColor Gray
Write-Host "   • Scansiona QR code per device fisico" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Blue
Write-Host "   • Premi 'r' per reload" -ForegroundColor Gray
Write-Host "   • Premi 'Shift+R' per reset cache" -ForegroundColor Gray
Write-Host "   • Premi 'c' per clear console" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Vedi TESTING_WORKFLOW.md per dettagli completi" -ForegroundColor Yellow
Write-Host ""

# Esegui npm start (menu interattivo Expo)
npm start
