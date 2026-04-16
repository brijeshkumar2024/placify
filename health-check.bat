@echo off
title PLACIFY HEALTH CHECK
color 0A
cls

echo.
echo  PLACIFY HEALTH CHECK
echo  ==========================================
echo.

echo  BACKEND SERVICES
echo  ------------------------------------------
call :check 8081 "Auth Service     "
call :check 8082 "User Service     "
call :check 8083 "Job Service      "
call :check 8084 "Placement Service"
call :check 8085 "Interview Service"

echo.
echo  FRONTEND APPS
echo  ------------------------------------------
call :check 5173 "Student App      "
call :check 5175 "Recruiter App    "
call :check 5177 "TPO App          "

echo.
echo  ==========================================
echo  Done. If any show DOWN, check that
echo  terminal window for error messages.
echo  ==========================================
echo.
pause
goto :eof

:check
netstat -an 2>nul | findstr ":%1 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo  [DOWN]  %~2  port %1
) else (
    echo  [UP]    %~2  port %1
)
goto :eof
