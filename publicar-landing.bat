@echo off
REM ============================================================
REM  AD ASTRA - Landing de reformistas : PUBLICAR
REM  Sube la rama de trabajo (feat/landing) como main a GitHub.
REM  Vercel la despliega sola en ~1 minuto.
REM  No cambia de rama: este .bat vive en feat/landing y, si
REM  cambiara de rama, desapareceria mientras se ejecuta.
REM  Antes de la primera vez: crear el repo VACIO en GitHub
REM  "landing-reformistas" (cuenta brownprojectok-max).
REM ============================================================
setlocal
cd /d "%~dp0"
set REPO=https://github.com/brownprojectok-max/landing-reformistas.git

echo.
echo == 1/3  Limpiando lock de git (si existe)...
if exist ".git\index.lock" del /f /q ".git\index.lock"

echo == 2/3  Conectando con GitHub...
git remote get-url origin >nul 2>&1 || git remote add origin %REPO%

echo == 3/3  Subiendo la landing a GitHub (main)...
git push -u origin feat/landing:main || (echo No se pudo subir. Revisa que el repo exista en GitHub y avisale a Jarvis. & pause & exit /b 1)
git push origin feat/landing

echo.
echo Listo. Si Vercel ya tiene el repo importado, se publica en ~1 min.
echo Avisale a Jarvis que ya publicaste.
echo.
pause
endlocal
