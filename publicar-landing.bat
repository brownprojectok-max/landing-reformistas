@echo off
REM ============================================================
REM  AD ASTRA - Landing de reformistas : PUBLICAR
REM  Une la rama de trabajo (feat/landing) con main y la sube
REM  a GitHub. Vercel la despliega sola en ~1 minuto.
REM  Antes de la primera vez: crear el repo VACIO en GitHub
REM  "landing-reformistas" (cuenta brownprojectok-max).
REM ============================================================
setlocal
cd /d "%~dp0"
set REPO=https://github.com/brownprojectok-max/landing-reformistas.git

echo.
echo == 1/5  Limpiando lock de git (si existe)...
if exist ".git\index.lock" del /f /q ".git\index.lock"

echo == 2/5  Conectando con GitHub...
git remote get-url origin >nul 2>&1 || git remote add origin %REPO%

echo == 3/5  Yendo a main y trayendo lo de la rama de trabajo...
git checkout main || (echo No se pudo ir a main. Avisale a Jarvis. & pause & exit /b 1)
git ls-remote --exit-code --heads origin main >nul 2>&1 && git pull origin main
git merge feat/landing --no-edit || (echo Hubo un conflicto al unir. Avisale a Jarvis, NO cierres. & pause & exit /b 1)

echo == 4/5  Subiendo a GitHub...
git push -u origin main || (echo No se pudo subir. Revisa que el repo exista en GitHub y avisale a Jarvis. & pause & exit /b 1)
git push origin feat/landing

echo == 5/5  Listo. Si Vercel ya tiene el repo importado, se publica en ~1 min.
echo.
git checkout feat/landing >nul 2>&1
echo Avisale a Jarvis que ya publicaste.
echo.
pause
endlocal
