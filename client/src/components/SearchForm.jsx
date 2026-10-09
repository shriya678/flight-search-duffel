import { useState } from 'react';
import AirportInput from './AirportInput.jsx';
import PassengerSelector from './PassengerSelector.jsx';
import { todayISO, validateSearch } from '../utils/validation.js';

const DEFAULT_ORIGIN = {
  type: 'airport',
  iataCode: 'DEL',
  name: 'Indira Gandhi International Airport',
  cityName: 'New Delhi',
  countryCode: 'IN',
};

const INITIAL_SEARCH = {
  tripType: 'one-way',
  origin: DEFAULT_ORIGIN.iataCode,
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
  // Display details (city, airport name) for the selected codes; the search itself only needs the codes.
  const [places, setPlaces] = useState({ origin: DEFAULT_ORIGIN, destination: null });

  const update = (patch) => {
    const next = { ...search, ...patch };
    setSearch(next);
    // Re-validate live only after the first submit attempt, so users aren't nagged while typing.
    if (submitted) setErrors(validateSearch(next));
  };

  const selectAirport = (field, code, place) => {
    update({ [field]: code });
    setPlaces((prev) => ({ ...prev, [field]: place }));
  };

  const swap = () => {
    update({ origin: search.destination, destination: search.origin });
    setPlaces(({ origin, destination }) => ({ origin: destination, destination: origin }));
  };

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
          <AirportInput
            label="From"
            value={search.origin}
            place={places.origin}
            onSelect={(origin, place) => selectAirport('origin', origin, place)}
            placeholder="City or airport"
            error={errors.origin}
          />

          <button type="button" className="swap" onClick={swap} aria-label="Swap origin and destination">
            ⇄
          </button>

          <AirportInput
            label="To"
            value={search.destination}
            place={places.destination}
            onSelect={(destination, place) => selectAirport('destination', destination, place)}
            placeholder="Going to?"
            error={errors.destination}
          />
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
