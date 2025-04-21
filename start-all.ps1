# Master startup script for SafeView AI
Write-Host "Starting SafeView AI components..." -ForegroundColor Green

# Start backend server in a new window
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\backend'; .\start.ps1"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start TV app in a new window
Write-Host "Starting TV app..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\tv-app'; .\start.ps1"

Write-Host "All components started successfully!" -ForegroundColor Green
Write-Host "- Backend server running on port 3001" -ForegroundColor Yellow
Write-Host "- TV app running with Electron and Vite" -ForegroundColor Yellow 