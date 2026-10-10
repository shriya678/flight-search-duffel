// Duffel prices offers in the account's currency (GBP for most test accounts) and has no
// option to change it per request, so we convert to the display currency ourselves.
// Rates come from Frankfurter (European Central Bank reference rates, free, no API key).
const RATES_URL = 'https://api.frankfurter.dev/v1/latest';
const CACHE_MS = 6 * 60 * 60 * 1000; // ECB publishes once per working day
const REQUEST_TIMEOUT_MS = 5_000;

export const DISPLAY_CURRENCY = (process.env.DISPLAY_CURRENCY || 'INR').toUpperCase();

const cache = new Map();

async function getRate(from, to) {
  const key = `${from}:${to}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return cached;

  const response = await fetch(`${RATES_URL}?base=${from}&symbols=${to}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Exchange rate request failed with status ${response.status}`);
  const { rates, date } = await response.json();
  if (!rates?.[to]) throw new Error(`No ${from} to ${to} rate available`);

  const entry = { from, to, rate: rates[to], date, fetchedAt: Date.now() };
  cache.set(key, entry);
  return entry;
}

// Converts every offer price to `to`. If a rate can't be fetched, those offers keep their
// original currency, so a rates outage never breaks the search itself.
export async function convertOfferPrices(result, to = DISPLAY_CURRENCY) {
  const currencies = [...new Set(result.offers.map((o) => o.totalCurrency))].filter((c) => c !== to);
  const rates = new Map();

  await Promise.all(
    currencies.map(async (from) => {
      try {
        rates.set(from, await getRate(from, to));
      } catch (err) {
        console.warn(`Could not convert ${from} to ${to}: ${err.message}`);
      }
    }),
  );

  const offers = result.offers.map((offer) => {
    const rate = rates.get(offer.totalCurrency);
    if (!rate) return offer;
    return {
      ...offer,
      totalAmount: (Number(offer.totalAmount) * rate.rate).toFixed(2),
      totalCurrency: to,
      originalAmount: offer.totalAmount,
      originalCurrency: offer.totalCurrency,
    };
  });

  const exchangeRates = [...rates.values()].map(({ from, to: target, rate, date }) => ({ from, to: target, rate, date }));
  return { ...result, offers, exchangeRates };
}
