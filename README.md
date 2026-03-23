# Placify — AI-Powered Campus Placement Portal

> From Campus to Career — Intelligently

## What is Placify?
Placify is a full-stack, AI-powered campus placement portal that automates the entire placement lifecycle for students, recruiters, and TPO officers.

## Tech Stack
- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — Spring Boot microservices
- **AI Engine** — Python FastAPI + Google Gemini API
- **Database** — MongoDB
- **Cache** — Redis
- **Email** — Resend

## Features
- College email domain verification + OTP auth
- AI resume analyzer with ATS scoring
- Smart job feed with fit score ranking
- AI mock interview engine
- Career roadmap generator
- Zero-touch placement drive automation
- TPO analytics dashboard

## Project Structure
```
placify/
├── frontend/student-app     # Student portal
├── frontend/recruiter-app   # Recruiter portal  
├── frontend/tpo-app         # TPO dashboard
├── backend/auth-service     # Authentication microservice
├── backend/user-service     # User profile service
├── backend/job-service      # Job management service
├── ai-service/              # Python AI engine
└── docs/                    # Architecture & API docs
```

## Local Setup

### Prerequisites
- Node.js 18+
- Java 23
- Python 3.10+
- MongoDB (local)
- Redis (local)

### Run auth service
```bash
cd backend/auth-service
mvnw.cmd spring-boot:run
```

### Run student frontend
```bash
cd frontend/student-app
npm run dev
```

## Status
Currently in active development.
