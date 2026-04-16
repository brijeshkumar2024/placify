@echo off
title AUTH SERVICE :8081
color 0B
cd /d "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\backend\auth-service"
echo Starting Auth Service on port 8081...
echo MongoDB: local (localhost:27017)
echo.
mvnw.cmd spring-boot:run
echo.
echo [AUTH SERVICE STOPPED]
pause
