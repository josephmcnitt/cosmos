@echo off
cd /d "%~dp0"
"C:\Program Files\nodejs\npx.cmd" vite-node tools/bug-catcher/catch.ts --mode guidance %*
