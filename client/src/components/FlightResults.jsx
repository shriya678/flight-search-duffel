import { useMemo, useState } from 'react';
import OfferCard from './OfferCard.jsx';
import { durationToMinutes, formatDate, formatPrice } from '../utils/format.js';

const totalMinutes = (offer) => offer.slices.reduce((sum, s) => sum + durationToMinutes(s.duration), 0);

const SORTERS = {
  price: (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
  duration: (a, b) => totalMinutes(a) - totalMinutes(b),
  departure: (a, b) => a.slices[0].departingAt.localeCompare(b.slices[0].departingAt),
};

// Ties (same duration or departure time) fall back to the cheaper offer first.
const compareBy = (key) => (a, b) => SORTERS[key](a, b) || SORTERS.price(a, b);

const SORT_OPTIONS = [
  { value: 'price', label: 'Cheapest' },
  { value: 'duration', label: 'Fastest' },
  { value: 'departure', label: 'Earliest departure' },
];

const BADGES = [
  { key: 'price', label: 'Cheapest' },
  { key: 'duration', label: 'Fastest' },
  { key: 'departure', label: 'Earliest' },
];

// Maps offer id -> badge labels, e.g. { off_123: ['Cheapest', 'Fastest'] }.
function findBadges(offers) {
  const badges = {};
  if (offers.length < 2) return badges;
  for (const { key, label } of BADGES) {
    const best = offers.reduce((top, offer) => (compareBy(key)(offer, top) < 0 ? offer : top));
    (badges[best.id] ??= []).push(label);
  }
  return badges;
}

function LoadingState() {
  return (
    <div className="results-list" aria-busy="true" aria-label="Loading flights">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="offer skeleton" />
      ))}
    </div>
  );
}

export default function FlightResults({ status, result, error, onRetry }) {
  const [sortBy, setSortBy] = useState('price');

  const offers = useMemo(() => [...(result?.offers ?? [])].sort(compareBy(sortBy)), [result, sortBy]);
  const badges = useMemo(() => findBadges(result?.offers ?? []), [result]);

  if (status === 'idle') return null;

  return (
    <section className="results" aria-live="polite">
      {status === 'loading' && (
        <>
          <p className="results-summary">Searching airlines for the best fares…</p>
          <LoadingState />
        </>
      )}

      {status === 'error' && (
        <div className="results-message error">
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {status === 'success' && offers.length === 0 && (
        <div className="results-message">
          <p>No flights found for this route and date. Try different dates or airports.</p>
        </div>
      )}

      {status === 'success' && offers.length > 0 && (
        <>
          <div className="results-header">
            <p className="results-summary">
              {result.totalOffers} flight{result.totalOffers > 1 ? 's' : ''} found
              {result.totalOffers > offers.length && ` · showing the ${offers.length} cheapest`}
            </p>
            <label className="sort">
              Sort by
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {result.exchangeRates?.map(({ from, to, rate, date }) => (
            <p key={from} className="muted rate-note">
              Prices converted from {from} at 1 {from} = {formatPrice(rate, to, 2)} (ECB rate, {formatDate(date)})
            </p>
          ))}
          <div className="results-list">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} sortBy={sortBy} badges={badges[offer.id]} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
