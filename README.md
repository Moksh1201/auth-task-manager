# Full-Stack Task Manager (Backend Intern Assignment)

This repository contains:
- `backend/`: Node.js + Express + MongoDB (Mongoose) REST API with JWT auth, role-based access, validation (Joi), Swagger docs.
- `frontend/`: React (Vite) UI to register/login and manage tasks.

## Features

### Backend
- API versioning under `/api/v1`
- Auth
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - Password hashing with `bcrypt`
  - JWT auth
  - Roles: `USER`, `ADMIN`
- Tasks
  - `GET /api/v1/tasks` (ADMIN: all tasks, USER: own tasks)
  - `POST /api/v1/tasks` (own tasks)
  - `PUT /api/v1/tasks/:id` (ADMIN: any, USER: own)
  - `DELETE /api/v1/tasks/:id` (ADMIN: any, USER: own)
- Validation: Joi + centralized validation middleware
- Centralized error middleware
- Swagger UI: `GET /api-docs`
- Health check: `GET /api/v1/health` (returns 200 if Mongo connected, 503 otherwise)

### Frontend
- Pages
  - `Register`
  - `Login`
  - `Dashboard` (protected)
- Stores JWT in `localStorage`
- Axios interceptor attaches JWT
- Task CRUD UI + success/error messages

## Prerequisites
- Node.js 18+ (20+ recommended)
- MongoDB running locally (unless using Docker Compose)

## Run Locally (without Docker)

### Backend

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

`backend/.env`
- `PORT` (default in this repo: `5001`)
- `MONGO_URI` (example: `mongodb://127.0.0.1:27017/task_manager`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

3. Start

```bash
npm run dev
```

Backend runs at:
- API base: `http://localhost:5001/api/v1`
- Swagger: `http://localhost:5001/api-docs`
- Health: `http://localhost:5001/api/v1/health`

### Frontend

1. Install dependencies

```bash
cd frontend
npm install
```

2. Configure environment

`frontend/.env`
- `VITE_API_URL=http://localhost:5001/api/v1`

3. Start

```bash
npm run dev
```

Frontend runs at:
- `http://localhost:5173`

## Run With Docker Compose

From repo root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001` (Swagger at `/api-docs`)
- MongoDB: `mongodb://localhost:27017/task_manager`

## API Documentation
- Swagger UI: `http://localhost:5001/api-docs`

## Postman Collection
- Import `TaskManager.postman_collection.json` into Postman.
- Variables:
  - `baseUrl` (default: `http://localhost:5001/api/v1`)
  - `token` is automatically set after running the Login request.

