# flight-search-duffel

An IndiGo-style flight search form built with **React (Vite)** and a small **Node (Express)** API that fetches live offers from the [Duffel API](https://duffel.com/docs).

**Live demo:** https://flight-search-duffel.vercel.app ([API health check](https://flight-search-duffel.vercel.app/api/health))

> Runs on a Duffel **test** token, so airlines and prices are simulated. Try DEL → BOM or LHR → JFK.

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

## Deployment (Vercel)

The frontend and backend deploy together as **one Vercel project** using [Vercel Services](https://vercel.com/docs/services), which are defined in `vercel.json`:

```
https://<project>.vercel.app/          → "web" service: client/ (Vite build)
https://<project>.vercel.app/api/*     → "api" service: server/ (Express, server/src/app.js)
```

Both are on the same domain, so no CORS setup is needed, and the Duffel token is a Vercel environment variable that never reaches the browser.

How it fits together:
- `server/src/app.js` builds the Express app. Locally `server/src/index.js` starts it; on Vercel it is the `api` service entrypoint.
- Top-level rewrites send `/api/*` to `api` and everything else to `web`. The service receives the original path (`/api/flights/search`), so the Express routes are the same in both places.
- Only the `main` branch deploys (`git.deploymentEnabled`); feature branches and PRs don't create deployments.

Steps (one time):
1. Go to https://vercel.com/new and import the `flight-search-duffel` GitHub repo.
2. Vercel detects the services from `vercel.json`. Keep the root directory as the repo root.
3. Under **Environment Variables**, add `DUFFEL_ACCESS_TOKEN` = your `duffel_test_...` token.
4. Click **Deploy**, then open `https://<project>.vercel.app/api/health` and check `"duffelConfigured": true`.

After that, every merge to `main` redeploys automatically.

## API

### `POST /api/flights/search`

```json
{
  "tripType": "round-trip",
  "origin": "DEL",
  "destination": "BOM",
  "departureDate": "2026-11-10",
  "returnDate": "2026-11-17",
  "passengers": { "adults": 1, "children": 0, "infants": 0 },
  "cabinClass": "economy"
}
```

Only `origin`, `destination` and `departureDate` are required. The others default to a one-way trip, 1 adult, economy.

| Status | When |
| --- | --- |
| 200 | `{ offerRequestId, totalOffers, offers[] }`: up to 50 offers, cheapest first |
| 400 | Invalid body: `{ error, fields: { <field>: <message> } }` |
| 422 | Duffel rejected the search, e.g. an unknown airport code |
| 502 / 504 | Duffel token is invalid or unreachable / Duffel timed out |

### `GET /api/places?query=mum`

Airport and city suggestions for the From/To autocomplete (up to 8). `query` must be 2-50 characters.

```json
{ "places": [{ "type": "airport", "iataCode": "BOM", "name": "Chhatrapati Shivaji International Airport", "cityName": "Mumbai", "countryCode": "IN" }] }
```

City codes such as `LON` (all London airports) can be used as `origin` / `destination` in a flight search.

### Postman

Import [`postman/flight-search-duffel.postman_collection.json`](postman/flight-search-duffel.postman_collection.json), start the server, and run the collection with the Collection Runner. Dates are generated automatically.

From the command line:

```bash
npx newman run postman/flight-search-duffel.postman_collection.json

# against the live deployment
npx newman run postman/flight-search-duffel.postman_collection.json --env-var baseUrl=https://flight-search-duffel.vercel.app
```

Browser test cases are in [TESTING.md](TESTING.md).

> In Duffel **test mode**, offers come from simulated airlines (including "Duffel Airways"), so routes, times and prices are not real.
