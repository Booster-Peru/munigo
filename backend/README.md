# Backend Microservices Bootstrap

This directory contains the initial microservices bootstrap for MuniGo.

## Services

- `gateway` on port `8080`
- `identity` on port `4001`
- `reports` on port `4002`
- `geo` on port `4003`
- `notifications` on port `4004`

## Local Run

Run each service in separate terminals from repository root:

```bash
npm run svc:identity
npm run svc:reports
npm run svc:geo
npm run svc:notifications
npm run svc:gateway
```

Required environment variable:

```bash
DATABASE_URL=postgresql://munigo:munigo@localhost:5432/munigo
JWT_SECRET=change_me
OPERATOR_EMAIL=operador@munigo.pe
OPERATOR_PASSWORD=change_this_password
```

Gateway routes:

- `/v1/auth/*` -> identity
- `/v1/reports/*` -> reports
- `/v1/geo/*` -> geo
- `/v1/notifications/*` -> notifications

## Docker Compose

Use the root `docker-compose.yml` to run all services plus PostgreSQL/PostGIS, Redis and NATS.
