# LegalPro / Lawyer Zen

Frontend: Vite + React + TypeScript + shadcn/ui

Backend: Express + MongoDB (Mongoose) + JWT

## Getting Started

1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

2. Configure environment for API

Create `server/.env` with:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lawyer_zen
JWT_SECRET=replace_me_with_strong_secret
CORS_ORIGIN=http://localhost:8080
```

Optional: seed legal sections

```bash
cd server
npm run seed:legal
cd ..
```

3. Run dev servers

```bash
# terminal 1 (API)
cd server
npm run dev

# terminal 2 (Frontend)
npm run dev
```

App runs on http://localhost:8080

API runs on http://localhost:5000 (proxied at `/api` by Vite)
