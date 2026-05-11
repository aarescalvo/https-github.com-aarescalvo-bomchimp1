@echo off
echo [*] Cerrando procesos de Node.js...
taskkill /F /IM node.exe /T
echo [OK] Servidor detenido.
pause
