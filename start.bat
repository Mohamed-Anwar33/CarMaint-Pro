@echo off
title CarMaint Pro - Startup
color 0A
echo.
echo  ============================================
echo   CarMaint Pro - صيانة سيارتي
echo  ============================================
echo.
echo  [1/2] Starting API Server (port 8080)...
start "CarMaint - API Server" cmd /k "cd /d %~dp0 && pnpm --filter @workspace/api-server run dev"

timeout /t 3 /nobreak > nul

echo  [2/2] Starting Web App (port 5173)...
start "CarMaint - Web App" cmd /k "cd /d %~dp0 && pnpm --filter @workspace/carmaint-pro run dev"

echo.
echo  ============================================
echo   App will open at: http://localhost:5173
echo  ============================================
echo.
timeout /t 5 /nobreak > nul
start http://localhost:5173
