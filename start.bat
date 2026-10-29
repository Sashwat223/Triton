@echo off
title TRITON Flagship Scrollytelling Experience
echo ========================================================
echo   Launching TRITON - Hear Beyond.
echo   Apple-Grade Scrollytelling Landing Page
echo ========================================================

:: Check for Anaconda Python
if exist "D:\AnacondaDAtascience\python.exe" (
    echo Starting local server with Anaconda Python...
    start "" "D:\AnacondaDAtascience\python.exe" "%~dp0serve.py"
    goto end
)

:: Check for system python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting local server with Python...
    start "" python "%~dp0serve.py"
    goto end
)

:: Fallback: Open index.html directly in Microsoft Edge
echo Python not found in path. Opening directly in Microsoft Edge...
start msedge "%~dp0index.html"

:end
echo Server started. Check your browser at http://localhost:3000
