# Script per avviare Expo pulendo le porte occupate
# Utilizzo: .\scripts\start-clean.ps1

Write-Host "🧹 Pulizia porte Expo..." -ForegroundColor Yellow

# Chiudi tutti i processi Expo
Get-Process | Where-Object {$_.ProcessName -like "*expo*" -or $_.ProcessName -like "*metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Chiudi processi Node che usano le porte Expo
$ports = @(8081, 8082, 8083, 8084, 8085)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $pid = $process.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Chiuso processo sulla porta $port" -ForegroundColor Green
    }
}

# Aspetta un momento
Start-Sleep -Seconds 2

Write-Host "🚀 Avvio Expo..." -ForegroundColor Cyan

# Naviga nella directory corretta e avvia Expo
Set-Location "C:\Users\PC Simo\Documents\GitHub\Post-Man\app-temp"

# Prova porte in sequenza
$ports = @(8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090)
foreach ($port in $ports) {
    Write-Host "🔍 Tentativo porta $port..." -ForegroundColor Blue
    
    try {
        npx expo start --port $port
        break
    } catch {
        Write-Host "❌ Porta $port occupata, provo la successiva..." -ForegroundColor Red
        continue
    }
}

Write-Host "✅ Expo avviato con successo!" -ForegroundColor Green
