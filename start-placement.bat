@echo off
title PLACEMENT SERVICE :8084
color 0B
cd /d "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\backend\placement-service"
echo Starting Placement Service on port 8084...
echo MongoDB: local (localhost:27017)
echo.
mvnw.cmd spring-boot:run
echo.
echo [PLACEMENT SERVICE STOPPED]
pause
