# Script per avviare Expo correttamente
Write-Host "🚀 Avvio Expo Post-Man..." -ForegroundColor Cyan

# Chiudi tutti i processi Node.js
Write-Host "🧹 Chiusura processi esistenti..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Aspetta un momento
Start-Sleep -Seconds 2

# Vai nella directory corretta
Set-Location "C:\Users\PC Simo\Documents\GitHub\Post-Man\app-temp"

# Verifica che siamo nella directory giusta
Write-Host "📁 Directory corrente: $(Get-Location)" -ForegroundColor Green

# Verifica che package.json esista
if (Test-Path "package.json") {
    Write-Host "✅ package.json trovato!" -ForegroundColor Green
} else {
    Write-Host "❌ package.json non trovato!" -ForegroundColor Red
    exit 1
}

# Avvia Expo
Write-Host "🚀 Avvio Expo..." -ForegroundColor Cyan
npx expo start --clear
