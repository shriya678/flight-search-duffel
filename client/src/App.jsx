import { useState } from 'react';
import Header from './components/Header.jsx';
import SearchForm from './components/SearchForm.jsx';

export default function App() {
  // Temporary: shows the submitted search until the Duffel API is wired up.
  const [lastSearch, setLastSearch] = useState(null);

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
              <SearchForm onSearch={setLastSearch} />
            </div>
          </div>
          {lastSearch && <pre className="debug">{JSON.stringify(lastSearch, null, 2)}</pre>}
        </div>
      </main>
    </>
  );
}
