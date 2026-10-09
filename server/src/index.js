import app from './app.js';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    console.warn('DUFFEL_ACCESS_TOKEN is not set. Copy server/.env.example to server/.env and add your token.');
  }
});
