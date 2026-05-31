@echo off
echo CV Analiz Uygulamasi Baslatiliyor...
echo.

:: Tum eski python/uvicorn processleri sonlandir
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1
timeout /t 1 >nul

:: Backend - mutlak path ile
echo [1/2] Backend baslatiliyor (http://localhost:8000)...
start cmd /k "cd /d C:\Projeler\CV-Analyzer\backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 3 >nul

:: Frontend
echo [2/2] Frontend baslatiliyor (http://localhost:3000)...
start cmd /k "cd /d C:\Projeler\CV-Analyzer\frontend && npm start"

echo.
echo Uygulama hazir!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
pause
