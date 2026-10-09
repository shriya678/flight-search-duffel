import { useMemo, useState } from 'react';
import OfferCard from './OfferCard.jsx';
import { durationToMinutes } from '../utils/format.js';

const totalMinutes = (offer) => offer.slices.reduce((sum, s) => sum + durationToMinutes(s.duration), 0);

const SORTERS = {
  price: (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
  duration: (a, b) => totalMinutes(a) - totalMinutes(b),
  departure: (a, b) => a.slices[0].departingAt.localeCompare(b.slices[0].departingAt),
};

const SORT_OPTIONS = [
  { value: 'price', label: 'Cheapest' },
  { value: 'duration', label: 'Fastest' },
  { value: 'departure', label: 'Earliest departure' },
];

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

  const offers = useMemo(() => [...(result?.offers ?? [])].sort(SORTERS[sortBy]), [result, sortBy]);

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
          <div className="results-list">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
