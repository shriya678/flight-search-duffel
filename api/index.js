// Vercel serverless entry point. vercel.json rewrites every /api/* request here,
// and the Express app routes it as it does locally.
import app from '../server/src/app.js';

export default app;
