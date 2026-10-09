import { useEffect, useRef, useState } from 'react';
import { MAX_PASSENGERS } from '../utils/validation.js';

const PASSENGER_TYPES = [
  { key: 'adults', label: 'Adults', hint: '12+ years', min: 1 },
  { key: 'children', label: 'Children', hint: '2-11 years', min: 0 },
  { key: 'infants', label: 'Infants', hint: 'Under 2 years', min: 0 },
];

export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export default function PassengerSelector({ passengers, cabinClass, onPassengersChange, onCabinChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const total = passengers.adults + passengers.children + passengers.infants;
  const cabinLabel = CABIN_CLASSES.find((c) => c.value === cabinClass)?.label;

  const update = (key, delta) => {
    onPassengersChange({ ...passengers, [key]: passengers[key] + delta });
  };

  return (
    <div className={`field field-travellers ${error ? 'has-error' : ''}`} ref={ref}>
      <span className="field-label">Travellers &amp; Class</span>
      <button type="button" className="field-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="field-value">
          {total} Passenger{total > 1 ? 's' : ''}
        </span>
        <span className="field-sub">{cabinLabel}</span>
      </button>
      {error && <span className="field-error">{error}</span>}

      {open && (
        <div className="popover">
          {PASSENGER_TYPES.map(({ key, label, hint, min }) => (
            <div className="counter-row" key={key}>
              <div>
                <div>{label}</div>
                <small className="muted">{hint}</small>
              </div>
              <div className="counter">
                <button type="button" onClick={() => update(key, -1)} disabled={passengers[key] <= min} aria-label={`Fewer ${label}`}>
                  −
                </button>
                <span>{passengers[key]}</span>
                <button type="button" onClick={() => update(key, 1)} disabled={total >= MAX_PASSENGERS} aria-label={`More ${label}`}>
                  +
                </button>
              </div>
            </div>
          ))}
          <label className="cabin-select">
            Cabin class
            <select value={cabinClass} onChange={(e) => onCabinChange(e.target.value)}>
              {CABIN_CLASSES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-link" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
