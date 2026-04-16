@echo off
title PLACIFY LAUNCHER
color 0A
cls

echo.
echo  ==========================================
echo   PLACIFY - AI Campus Placement Portal
echo   Starting all services...
echo  ==========================================
echo.

echo  [1] Starting AUTH SERVICE (8081)...
start "AUTH :8081" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-auth.bat"
timeout /t 5 /nobreak >nul

echo  [2] Starting API GATEWAY (8080)...
start "GATEWAY :8080" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-gateway.bat"
timeout /t 3 /nobreak >nul

echo  [3] Starting USER SERVICE (8082)...
start "USER :8082" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-user.bat"
timeout /t 3 /nobreak >nul

echo  [4] Starting PLACEMENT SERVICE (8084)...
start "PLACEMENT :8084" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-placement.bat"
timeout /t 5 /nobreak >nul

echo  [5] Starting JOB SERVICE (8083)...
start "JOB :8083" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-job.bat"
timeout /t 3 /nobreak >nul

echo  [6] Starting INTERVIEW SERVICE (8085)...
start "INTERVIEW :8085" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-interview.bat"
timeout /t 3 /nobreak >nul

echo  [7] Starting ANALYTICS SERVICE (8090)...
start "ANALYTICS :8090" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-analytics.bat"
timeout /t 2 /nobreak >nul

echo  [8] Starting NOTIFICATION SERVICE (8091)...
start "NOTIFICATION :8091" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-notification.bat"
timeout /t 2 /nobreak >nul

echo  [9] Starting FILE SERVICE (8092)...
start "FILE :8092" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-file.bat"
timeout /t 2 /nobreak >nul

echo  [10] Starting DRIVE SERVICE (8093)...
start "DRIVE :8093" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-drive.bat"
timeout /t 2 /nobreak >nul

echo  [11] Starting PDF SERVICE (8094)...
start "PDF :8094" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-pdf.bat"
timeout /t 2 /nobreak >nul

echo  [12] Starting STUDENT APP (5173)...
start "STUDENT :5173" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-student.bat"
timeout /t 2 /nobreak >nul

echo  [13] Starting RECRUITER APP (5175)...
start "RECRUITER :5175" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-recruiter.bat"
timeout /t 2 /nobreak >nul

echo  [14] Starting TPO APP (5177)...
start "TPO :5177" "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\start-tpo.bat"

echo.
echo  ==========================================
echo   ALL SERVICES LAUNCHED
echo  ==========================================
echo.
echo   Wait 60-90 seconds for Spring Boot to start.
echo   Watch each window for: Started ... in X seconds
echo.
echo   Student App   : http://localhost:5173
echo   Recruiter App : http://localhost:5175
echo   TPO App       : http://localhost:5177
echo.
echo   Auth Service  : http://localhost:8081
echo   API Gateway   : http://localhost:8080
echo   User Service  : http://localhost:8082
echo   Job Service   : http://localhost:8083
echo   Placement     : http://localhost:8084
echo   Interview     : http://localhost:8085
echo   Analytics     : http://localhost:8090
echo   Notifications : http://localhost:8091
echo   File Service  : http://localhost:8092
echo   Drive Service : http://localhost:8093
echo   PDF Service   : http://localhost:8094
echo.
echo   Run health-check.bat to verify all ports.
echo  ==========================================
echo.
pause
