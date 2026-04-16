@echo off
title INTERVIEW SERVICE :8085
color 0B
cd /d "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\backend\interview-service"
echo Starting Interview Service on port 8085...
echo MongoDB: local (localhost:27017)
echo.
mvnw.cmd spring-boot:run
echo.
echo [INTERVIEW SERVICE STOPPED]
pause
