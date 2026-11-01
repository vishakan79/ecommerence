# Kadai — MERN Ecommerce Store

Full-stack ecommerce app built with **MongoDB, Express, React (Vite) and Node.js**.

## Features
- Product catalog with search, category filter and sorting (server-side)
- Cart persisted in `localStorage`
- Register / login with JWT and bcrypt-hashed passwords
- Checkout creates an order; prices and stock are always verified on the server
- Order history per user
- Express serves the built React app, so one deployment gives one URL

## Project structure
```
server/   Express API, Mongoose models, routes, seed data
client/   React app (Vite)
```

## Run locally
1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Install and start:
```bash
npm install --prefix server
npm install --prefix client
npm run dev:server      # http://localhost:5000
npm run dev:client      # http://localhost:5173 (proxies /api to the server)
```
Products are seeded automatically on first start (or run `npm run seed`).

## Production build
```bash
npm run build
npm start
```

## Deploy (Render)
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables: `MONGODB_URI`, `JWT_SECRET`

## API
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/login` | no | Log in |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/products` | no | List (`q`, `category`, `sort`) |
| GET | `/api/products/:id` | no | Single product |
| POST | `/api/orders` | yes | Place order |
| GET | `/api/orders/mine` | yes | My orders |
