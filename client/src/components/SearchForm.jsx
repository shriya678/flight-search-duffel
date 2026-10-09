import { useState } from 'react';
import PassengerSelector from './PassengerSelector.jsx';
import { todayISO, validateSearch } from '../utils/validation.js';

const INITIAL_SEARCH = {
  tripType: 'one-way',
  origin: 'DEL',
  destination: '',
  departureDate: todayISO(),
  returnDate: '',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'economy',
};

const TRIP_TYPES = [
  { value: 'one-way', label: 'One Way' },
  { value: 'round-trip', label: 'Round Trip' },
];

export default function SearchForm({ onSearch, loading = false }) {
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (patch) => {
    const next = { ...search, ...patch };
    setSearch(next);
    // Re-validate live only after the first submit attempt, so users aren't nagged while typing.
    if (submitted) setErrors(validateSearch(next));
  };

  const toAirportCode = (value) => value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

  const swap = () => update({ origin: search.destination, destination: search.origin });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validateSearch(search);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSearch(search);
  };

  const isRoundTrip = search.tripType === 'round-trip';

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <div className="trip-types" role="radiogroup" aria-label="Trip type">
        {TRIP_TYPES.map(({ value, label }) => (
          <label key={value} className="radio">
            <input
              type="radio"
              name="tripType"
              value={value}
              checked={search.tripType === value}
              onChange={() => update({ tripType: value, returnDate: value === 'one-way' ? '' : search.returnDate })}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="fields">
        <div className="route">
          <label className={`field ${errors.origin ? 'has-error' : ''}`}>
            <span className="field-label">From</span>
            <input
              className="field-input"
              value={search.origin}
              onChange={(e) => update({ origin: toAirportCode(e.target.value) })}
              placeholder="e.g. DEL"
              autoComplete="off"
            />
            {errors.origin && <span className="field-error">{errors.origin}</span>}
          </label>

          <button type="button" className="swap" onClick={swap} aria-label="Swap origin and destination">
            ⇄
          </button>

          <label className={`field ${errors.destination ? 'has-error' : ''}`}>
            <span className="field-label">To</span>
            <input
              className="field-input"
              value={search.destination}
              onChange={(e) => update({ destination: toAirportCode(e.target.value) })}
              placeholder="Going to?"
              autoComplete="off"
            />
            {errors.destination && <span className="field-error">{errors.destination}</span>}
          </label>
        </div>

        <label className={`field ${errors.departureDate ? 'has-error' : ''}`}>
          <span className="field-label">Departure</span>
          <input
            type="date"
            className="field-input"
            value={search.departureDate}
            min={todayISO()}
            onChange={(e) => update({ departureDate: e.target.value })}
          />
          {errors.departureDate && <span className="field-error">{errors.departureDate}</span>}
        </label>

        <label className={`field ${errors.returnDate ? 'has-error' : ''} ${isRoundTrip ? '' : 'field-inactive'}`}>
          <span className="field-label">Return</span>
          {isRoundTrip ? (
            <input
              type="date"
              className="field-input"
              value={search.returnDate}
              min={search.departureDate || todayISO()}
              onChange={(e) => update({ returnDate: e.target.value })}
            />
          ) : (
            // Like IndiGo: clicking the empty Return field switches to a round trip.
            <button type="button" className="field-trigger" onClick={() => update({ tripType: 'round-trip' })}>
              <span className="field-sub">Add a return flight</span>
            </button>
          )}
          {errors.returnDate && <span className="field-error">{errors.returnDate}</span>}
        </label>

        <PassengerSelector
          passengers={search.passengers}
          cabinClass={search.cabinClass}
          onPassengersChange={(passengers) => update({ passengers })}
          onCabinChange={(cabinClass) => update({ cabinClass })}
          error={errors.passengers}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
