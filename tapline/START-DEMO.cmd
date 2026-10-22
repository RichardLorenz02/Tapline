@echo off
cd /d "%~dp0"
if exist tapline-demo.html (
  start "" "%~dp0tapline-demo.html"
  exit /b 0
)
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.12 or newer, then try again.
  pause
  exit /b 1
)
call npm ci
if errorlevel 1 (
  pause
  exit /b 1
)
call npm run dev -- --open
