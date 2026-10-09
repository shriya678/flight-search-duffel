const NAV_ITEMS = ['Book', 'Trips', 'Check-in', 'Offers'];

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo">
          SkySearch<span className="logo-dots">✈</span>
        </a>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
