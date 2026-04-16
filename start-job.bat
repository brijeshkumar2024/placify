@echo off
title JOB SERVICE :8083
color 0B
cd /d "E:\6th Sem\Full Stack\Case-Study1\campus-placement-portal\backend\job-service"
echo Starting Job Service on port 8083...
echo MongoDB: local (localhost:27017)
echo.
mvnw.cmd spring-boot:run
echo.
echo [JOB SERVICE STOPPED]
pause
