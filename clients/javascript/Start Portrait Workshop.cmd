@echo off
cd /d "%~dp0"
python tools\serve.py --open
if errorlevel 1 pause
