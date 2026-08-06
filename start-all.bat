@echo off
title UCSC BIT IT5106 Project Launcher
echo ========================================================
echo   Starting Multi-Vendor Booking System (Offline Mode)
echo ========================================================
echo.

echo [1/3] Starting Backend API (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo [2/3] Starting Admin Panel (Port 3000)...
start "Admin Panel" cmd /k "cd admin-panel && npm run dev"

echo [3/3] Starting Booking Widget (Port 5173)...
start "Booking Widget" cmd /k "cd widget && npm run dev"

echo.
echo ========================================================
echo   All Services Launched Successfully!
echo   - Backend API: http://localhost:5000
echo   - Admin Panel: http://localhost:3000
echo   - Booking Widget: http://localhost:5173
echo ========================================================
pause
