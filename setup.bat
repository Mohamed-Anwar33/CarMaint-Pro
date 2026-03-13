@echo off
title CarMaint Pro - First Time Setup
color 0B
echo.
echo  ============================================
echo   CarMaint Pro - First Time Setup
echo  ============================================
echo.

:: Check Node.js
echo  [1/4] Checking Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js not found!
    echo  Download from: https://nodejs.org
    pause
    exit /b 1
)
node --version
echo  OK - Node.js found

:: Install pnpm
echo.
echo  [2/4] Installing pnpm...
npm install -g pnpm
echo  OK - pnpm ready

:: Install dependencies
echo.
echo  [3/4] Installing project dependencies...
pnpm install
echo  OK - Dependencies installed

:: Setup database
echo.
echo  [4/4] Setting up database...
echo.
echo  IMPORTANT: Make sure PostgreSQL is running on localhost:5432
echo  and a database named "carmaint" exists.
echo.
echo  To create the database, open pgAdmin or run in psql:
echo    CREATE DATABASE carmaint;
echo.
echo  The default password is: password
echo  If yours is different, edit: artifacts\api-server\.env
echo  and change the DATABASE_URL line.
echo.
pause
pnpm --filter @workspace/db run push
if %errorlevel% neq 0 (
    echo.
    echo  Database setup failed. Make sure PostgreSQL is running.
    echo  Edit lib\db\.env and artifacts\api-server\.env
    echo  to match your PostgreSQL username and password.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   Setup Complete! Run start.bat to launch
echo  ============================================
echo.
pause
