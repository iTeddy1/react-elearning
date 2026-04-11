@echo off
setlocal

REM Run from repository root regardless of where the script is launched from
cd /d "%~dp0"

echo Starting backend...
start "Backend - react-elearning" cmd /k "cd /d backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload"

echo Starting frontend...
start "Frontend - react-elearning" cmd /k "cd /d frontend && npm run dev"

echo App startup commands launched.

timeout /t 5 >nul
start http://localhost:3000

