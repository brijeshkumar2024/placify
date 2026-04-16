@echo off
title PLACIFY STOP ALL
color 0C
cls

echo Stopping all Placify services...
echo.

echo Killing Java processes (Spring Boot)...
taskkill /f /im java.exe >nul 2>&1
if errorlevel 1 (echo No Java processes found.) else (echo Java stopped.)

echo Killing Node processes (Vite)...
taskkill /f /im node.exe >nul 2>&1
if errorlevel 1 (echo No Node processes found.) else (echo Node stopped.)

echo.
echo All Placify services stopped.
echo.
pause
