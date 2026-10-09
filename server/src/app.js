import express from 'express';
import { DuffelError } from './duffel.js';
import flightsRouter from './routes/flights.js';
import placesRouter from './routes/places.js';

// Builds the Express app without starting it, so it can run both as a local
// server (index.js) and as a Vercel serverless function (api/index.js).
const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, duffelConfigured: Boolean(process.env.DUFFEL_ACCESS_TOKEN) });
});

app.use('/api/flights', flightsRouter);
app.use('/api/places', placesRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Express 5 forwards rejected promises from async handlers here.
app.use((err, _req, res, _next) => {
  if (err instanceof DuffelError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
