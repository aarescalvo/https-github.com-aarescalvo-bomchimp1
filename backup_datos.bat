@echo off
set cur_date=%date:~6,4%-%date:~3,2%-%date:~0,2%
echo [*] Creando backup de la base de datos...
copy database.sqlite "backups\database_backup_%cur_date%.sqlite"
echo [OK] Backup creado en carpeta backups.
pause
