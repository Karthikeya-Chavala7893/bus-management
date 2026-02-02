@echo off
echo ================================
echo    Bus Tracker - Starting Server
echo ================================
echo.
echo Server will start at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
echo Opening browser in 3 seconds...

start "" "http://localhost:8080"

cd /d "%~dp0"
python -m http.server 8080

pause
