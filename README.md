# flight-search-duffel

An IndiGo-style flight search form built with **React (Vite)** and a small **Node (Express)** API that fetches live offers from the [Duffel API](https://duffel.com/docs).

```
flight-search-duffel/
├── client/   React + Vite frontend (proxies /api to the server in dev)
└── server/   Express API that holds the Duffel token and calls Duffel
```

The Duffel token stays on the server. The browser only talks to `/api/*`.

## Prerequisites

- Node.js 20.6+ (uses the built-in `fetch` and `--env-file` support)
- A Duffel test access token (see below)

## Getting a Duffel API key

1. Sign up at https://app.duffel.com/join and verify your email.
2. Create an organisation when prompted (any name works).
3. Make sure the dashboard is in **Test mode** (toggle in the top/left of the dashboard). Test mode is free and needs no payment details.
4. Go to **Developers → Access tokens** and click **Create access token**.
5. Give it a name, choose **Read-write**, and create it.
6. Copy the token right away. It starts with `duffel_test_` and is shown only once.
7. Paste it into `server/.env` as `DUFFEL_ACCESS_TOKEN`.

## Setup

```bash
npm run install:all
cp server/.env.example server/.env   # then add your token
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health
