import { Router } from 'express';
import { suggestPlaces } from '../duffel.js';

const router = Router();
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 50;

router.get('/', async (req, res) => {
  const query = String(req.query.query ?? '').trim();
  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({
      error: `query must be ${MIN_QUERY_LENGTH}-${MAX_QUERY_LENGTH} characters`,
      fields: { query: 'Invalid length' },
    });
  }

  res.json({ places: await suggestPlaces(query) });
});

export default router;
