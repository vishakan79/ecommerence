# Kadai — Ecommerce Store

React + Express + Node.js store backed by **Neon (PostgreSQL)**.

- `client/` React app (Vite), deployed on **Vercel**
- `server/` Express REST API, deployed on **Render**
- Database: **Neon Postgres** (tables are created and products seeded automatically on first start)

## Features
- Product catalog with server-side search, category filter and sorting
- Cart saved in `localStorage`
- Register / login with JWT and bcrypt-hashed passwords
- Checkout runs in a database transaction; prices and stock are verified on the server
- Order history per user

## Run locally
```bash
cp server/.env.example server/.env     # set DATABASE_URL and JWT_SECRET
npm install --prefix server
npm install --prefix client
npm run dev:server                     # http://localhost:5000
npm run dev:client                     # http://localhost:5173 (proxies /api to the server)
```

## Deploy
**Backend (Render)** — root directory `server`, build `npm install`, start `npm start`.
Environment variables: `DATABASE_URL`, `JWT_SECRET`, optional `CLIENT_URL` (comma-separated allowed origins).

**Frontend (Vercel)** — root directory `client`, framework Vite.
Environment variable: `VITE_API_URL` = your Render backend URL.

## API
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | no | Health + DB check |
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/login` | no | Log in |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/products` | no | List (`q`, `category`, `sort`) |
| GET | `/api/products/:id` | no | Single product |
| POST | `/api/orders` | yes | Place order |
| GET | `/api/orders/mine` | yes | My orders |
