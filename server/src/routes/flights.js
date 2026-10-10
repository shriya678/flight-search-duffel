import { Router } from 'express';
import { convertOfferPrices } from '../currency.js';
import { searchFlights } from '../duffel.js';
import { validateSearchBody } from '../validation.js';

const router = Router();

router.post('/search', async (req, res) => {
  const { search, errors } = validateSearchBody(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Invalid search', fields: errors });
  }

  const result = await searchFlights(search);
  res.json(await convertOfferPrices(result));
});

export default router;
