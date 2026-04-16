# Placify - AI-Powered Campus Placement Portal

[![Java](https://img.shields.io/badge/Java-23-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#)

From Campus to Career, Intelligently.

## Overview

Placify is a production-style, role-based campus placement platform built with a microservices architecture. It streamlines the full placement lifecycle across three core personas: students, recruiters, and Training & Placement Officers (TPO).

The system combines reactive Java backends, Node-based gateway/utilities, and AI-powered Python services to deliver secure authentication, intelligent recommendations, placement analytics, and interview workflows.

## Features

### Student

- OTP-based onboarding and secure login
- Personalized job feed and application tracking
- Resume upload and profile management
- AI-powered mock interview experience
- Career roadmap and progress visibility
- In-app notifications for status updates

### Recruiter

- Post and manage jobs
- View applicants per job with enriched metadata
- Update applicant status (shortlist, interview, offer, reject)
- Add recruiter notes and ratings
- Interview scheduling support
- Recruiter dashboard insights

### TPO

- Institution-level placement monitoring
- Manage drives and student placement records
- Track at-risk students and placement metrics
- Company-level application visibility
- Broadcast communication capabilities

## Architecture

Placify follows a distributed microservices pattern with an API Gateway as the unified entry point.

### Frontend Apps

- frontend/student-app (React + Vite)
- frontend/recruiter-app (React + Vite)
- frontend/tpo-app (React + Vite)

### Backend Services (Spring Boot)

- auth-service: authentication, OTP, token lifecycle
- user-service: user profiles and identity data
- job-service: jobs, recruiter actions, application controls
- placement-service: placement lifecycle, drives, student placement stats
- interview-service: interview workflows and interview-side notifications

### Node Services

- api-gateway: routing, auth validation, rate limiting, correlation IDs
- notification-service: notification event handling
- analytics-service: analytics endpoints and aggregates
- file-service: file upload and storage interfaces
- drive-service: drive-specific operations
- pdf-service: profile/report PDF generation

### AI Service (Python)

- mock interview logic
- recommendation and AI-assisted career features

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Java 23, Spring Boot WebFlux, Spring Security, Spring Data Reactive MongoDB
- Gateway and utilities: Node.js, Express, proxy middleware
- AI: Python, FastAPI-style service patterns
- Database: MongoDB
- Cache and messaging support: Redis
- Build tools: Maven, npm

## Core Workflow

1. Student signs in and discovers roles/jobs from the personalized feed.
2. Student applies to a job.
3. Recruiter reviews applicants for that job.
4. Recruiter updates applicant status.
5. Placement status sync propagates across services.
6. Student sees the updated status in applications and notifications.
7. TPO can monitor the same lifecycle at institution level.

## Final Repository Structure

```text
campus-placement-portal/
|- frontend/
|  |- student-app/
|  |- recruiter-app/
|  |- tpo-app/
|  `- shared-ui/
|- backend/
|  |- api-gateway/
|  |- auth-service/
|  |- user-service/
|  |- job-service/
|  |- placement-service/
|  |- interview-service/
|  |- notification-service/
|  |- analytics-service/
|  |- file-service/
|  |- drive-service/
|  `- pdf-service/
|- ai-service/
|  |- eduai/
|  |- job-recommender/
|  |- mock-interview/
|  |- placement-predictor/
|  |- quiz-generator/
|  `- resume-analyzer/
|- docs/
|- .github/
|- .gitignore
`- README.md
```

## Screenshots

Add screenshots before publishing:

- docs/screenshots/student-dashboard.png
- docs/screenshots/recruiter-dashboard.png
- docs/screenshots/tpo-dashboard.png
- docs/screenshots/job-application-flow.png
- docs/screenshots/analytics-overview.png

Markdown placeholders:

```md
![Student Dashboard](docs/screenshots/student-dashboard.png)
![Recruiter Dashboard](docs/screenshots/recruiter-dashboard.png)
![TPO Dashboard](docs/screenshots/tpo-dashboard.png)
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Java 23
- Maven 3.9+
- Python 3.10+
- MongoDB
- Redis

### 1. Clone

```bash
git clone <your-repo-url>
cd campus-placement-portal
```

### 2. Configure Environment

- Create service-level .env files from available .env.example files.
- Set MongoDB, Redis, JWT secrets, mail credentials, and AI keys.

### 3. Install Frontend Dependencies

```bash
cd frontend/student-app && npm install
cd ../recruiter-app && npm install
cd ../tpo-app && npm install
```

### 4. Install Node Service Dependencies

```bash
cd backend/api-gateway && npm install
cd ../notification-service && npm install
cd ../analytics-service && npm install
cd ../file-service && npm install
cd ../drive-service && npm install
cd ../pdf-service && npm install
```

### 5. Build/Run Spring Boot Services

```bash
cd backend/auth-service && mvnw.cmd spring-boot:run
cd ../user-service && mvnw.cmd spring-boot:run
cd ../job-service && mvnw.cmd spring-boot:run
cd ../placement-service && mvnw.cmd spring-boot:run
cd ../interview-service && mvnw.cmd spring-boot:run
```

### 6. Run Node Services

```bash
cd backend/api-gateway && npm run dev
cd ../notification-service && npm run dev
cd ../analytics-service && npm run dev
cd ../file-service && npm run dev
cd ../drive-service && npm run dev
cd ../pdf-service && npm run dev
```

### 7. Run Frontends

```bash
cd frontend/student-app && npm run dev
cd ../recruiter-app && npm run dev
cd ../tpo-app && npm run dev
```

You can also use included helper scripts from the repository root:

- start-auth.bat, start-user.bat, start-job.bat, start-placement.bat, start-interview.bat
- start-gateway.bat, start-notification.bat, start-analytics.bat, start-file.bat, start-drive.bat, start-pdf.bat
- start-student.bat, start-recruiter.bat, start-tpo.bat

## Authentication Flow

1. User enters institutional email.
2. OTP verification validates identity.
3. Role-based account login returns JWT.
4. Frontend stores token in sessionStorage (role-specific keys).
5. API Gateway validates token and injects identity headers.
6. Downstream services enforce role-level authorization.

## AI Features

- AI mock interview session and feedback loop
- Smart role/job recommendation support
- Resume analysis helpers
- Career progression assistance

## Future Improvements

- Centralized event bus for stronger cross-service observability
- Unified notification read-state across services
- End-to-end contract testing pipeline
- Helm/Kubernetes deployment manifests
- OpenAPI-driven service documentation portal
- CI/CD with environment promotion strategy

## Author

Developed by Brijesh Kumar.

If you are a recruiter or reviewer, this project demonstrates:

- microservices design and API orchestration
- multi-frontend role-based product engineering
- full-stack integration across Java, Node, and Python
- applied AI feature integration in a real product context
