# Build and start script for SafeView TV App

Write-Host "Building main process..."
pnpm run build:main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building main process"
    exit $LASTEXITCODE
}

Write-Host "Building preload script..."
pnpm run build:preload

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building preload script"
    exit $LASTEXITCODE
}

Write-Host "Building renderer..."
pnpm run build:renderer

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building renderer"
    exit $LASTEXITCODE
}

Write-Host "Starting app..."
pnpm run start 