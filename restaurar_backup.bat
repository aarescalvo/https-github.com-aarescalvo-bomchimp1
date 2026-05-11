@echo off
echo -- LISTA DE BACKUPS DISPONIBLES --
dir backups\*.sqlite /b
set /p file="Ingrese el nombre exacto del archivo a restaurar: "
copy "backups\%file%" database.sqlite
echo [OK] Base de datos restaurada. Reinicie el servidor.
pause
