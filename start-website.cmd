@echo off
rem Double-click to start the Chaytr website on this PC.
rem A minimised window opens; close it to stop the website.
cd /d "%~dp0"
start "Chaytr website (port 8081)" /min cmd /k npm run dev
timeout /t 15 /nobreak >nul
start "" http://localhost:8081
