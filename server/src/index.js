import express from 'express';
import { DuffelError } from './duffel.js';
import flightsRouter from './routes/flights.js';
import placesRouter from './routes/places.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

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

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    console.warn('DUFFEL_ACCESS_TOKEN is not set. Copy server/.env.example to server/.env and add your token.');
  }
});
