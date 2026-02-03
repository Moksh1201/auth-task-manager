# Scalability Notes

This project is intentionally structured to scale beyond an intern assignment.

## Architecture & Modularity
- Clear separation of concerns:
  - `routes/` for HTTP routing
  - `controllers/` for request/response orchestration
  - `services/` for business logic
  - `models/` for data layer
  - `middlewares/` for auth/validation/errors
- Adding a new module (e.g., `notes`, `projects`) follows the same pattern and does not affect unrelated modules.

## Database & Indexing
- MongoDB + Mongoose
- `User.email` is unique; this prevents duplicate accounts and supports fast lookup.
- For larger datasets:
  - Index `Task.user` and `Task.createdAt` for faster per-user listing and sorting.
  - Use pagination (`limit`, `cursor` or `page`) for `GET /tasks`.

## Stateless Auth & Horizontal Scaling
- JWT auth is stateless: any API instance can validate tokens with the same `JWT_SECRET`.
- This enables easy horizontal scaling behind a load balancer.

## Rate Limiting & Abuse Prevention
Recommended production hardening:
- Add rate limiting (e.g., per-IP / per-user) on:
  - `POST /auth/login`
  - `POST /auth/register`
- Add request size limits (already small by default in Express) and stricter CORS in production.

## Caching (Optional)
- Redis can cache:
  - Frequently accessed read endpoints (e.g., task lists per user)
  - Derived counts/stats
- Token/session blacklisting (optional) can be implemented using Redis if forced logout is required.

## Logging & Observability (Optional)
Recommended production hardening:
- Structured logs with request IDs (e.g., `pino`)
- Centralized error reporting (Sentry)
- Metrics and dashboards (Prometheus/Grafana)

## Deployment
- Dockerfiles included for frontend and backend.
- `docker-compose.yml` included for local orchestration (Mongo + backend + frontend).
- For production:
  - Run backend behind a reverse proxy (nginx/traefik)
  - Use TLS
  - Use environment secrets manager
  - Run MongoDB as a managed service or in a secured cluster

