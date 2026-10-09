import Header from './components/Header.jsx';

export default function App() {
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
            <div className="card-body">Search form coming soon.</div>
          </div>
        </div>
      </main>
    </>
  );
}
