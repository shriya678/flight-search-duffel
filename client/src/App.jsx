import { useRef, useState } from 'react';
import Header from './components/Header.jsx';
import SearchForm from './components/SearchForm.jsx';
import FlightResults from './components/FlightResults.jsx';
import { searchFlights } from './api/flights.js';

export default function App() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const lastSearch = useRef(null);
  const inFlight = useRef(null);

  const runSearch = async (search) => {
    // Cancel any earlier request so a slow response can't overwrite a newer one.
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    lastSearch.current = search;

    setStatus('loading');
    setError(null);
    try {
      const data = await searchFlights(search, { signal: controller.signal });
      setResult(data);
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <h1>Where to next?</h1>
          <p>Search and compare fares across airlines.</p>
        </section>
        <div className="container">
          <div className="card">
            <div className="tabs">
              <button type="button" className="tab active">Flights</button>
            </div>
            <div className="card-body">
              <SearchForm onSearch={runSearch} loading={status === 'loading'} />
            </div>
          </div>
          <FlightResults
            status={status}
            result={result}
            error={error}
            onRetry={() => runSearch(lastSearch.current)}
          />
        </div>
      </main>
    </>
  );
}
