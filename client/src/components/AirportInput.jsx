import { useEffect, useId, useState } from 'react';
import { suggestPlaces } from '../api/places.js';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const IATA_CODE = /^[A-Za-z]{3}$/;

export default function AirportInput({ label, value, place, onSelect, placeholder, error }) {
  const listId = useId();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = text.trim();
  const shouldSearch = editing && open && query.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!shouldSearch) {
      setSuggestions([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        setSuggestions(await suggestPlaces(query, { signal: controller.signal }));
        setActiveIndex(-1);
        setStatus('done');
      } catch (err) {
        if (err.name !== 'AbortError') setStatus('error');
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, shouldSearch]);

  const select = (suggestion) => {
    onSelect(suggestion.iataCode, suggestion);
    setText(suggestion.iataCode);
    setOpen(false);
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);
    setOpen(true);
    // Typing an exact code still works without picking from the list.
    onSelect(IATA_CODE.test(next.trim()) ? next.trim().toUpperCase() : '', null);
  };

  const handleKeyDown = (e) => {
    const open = suggestions.length > 0;
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && open && activeIndex >= 0) {
      // Pick the highlighted airport instead of submitting the form.
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = shouldSearch && status !== 'idle';

  return (
    <div className={`field field-airport ${error ? 'has-error' : ''}`}>
      <label className="field-label" htmlFor={`${listId}-input`}>
        {label}
      </label>
      <input
        id={`${listId}-input`}
        className="field-input"
        value={editing ? text : value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${listId}-list`}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        onFocus={(e) => {
          setEditing(true);
          setText(value);
          e.target.select();
        }}
        onBlur={() => {
          setEditing(false);
          setOpen(false);
        }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <span className="field-sub field-place">
        {place && place.iataCode === value ? `${place.cityName} · ${place.name}` : ' '}
      </span>
      {error && <span className="field-error">{error}</span>}

      {showList && (
        <ul className="suggestions" id={`${listId}-list`} role="listbox">
          {status === 'loading' && suggestions.length === 0 && <li className="suggestion-note">Searching…</li>}
          {status === 'error' && <li className="suggestion-note">Couldn't load suggestions. Type a 3-letter code.</li>}
          {status === 'done' && suggestions.length === 0 && <li className="suggestion-note">No airports found</li>}
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.iataCode}`}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`suggestion ${i === activeIndex ? 'active' : ''}`}
              // mousedown fires before the input's blur, so the click isn't lost.
              onMouseDown={(e) => {
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span>
                <strong>{s.cityName}</strong>
                <small className="muted">
                  {s.type === 'city' ? 'All airports' : s.name}, {s.countryCode}
                </small>
              </span>
              <span className="suggestion-code">{s.iataCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
