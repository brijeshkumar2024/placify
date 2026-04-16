@echo off
title USER SERVICE :8082
color 0B
cd /d "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\backend\user-service"
echo Starting User Service on port 8082...
echo MongoDB: local (localhost:27017)
echo.
mvnw.cmd spring-boot:run
echo.
echo [USER SERVICE STOPPED]
pause
