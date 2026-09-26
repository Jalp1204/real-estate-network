import { Link } from "react-router-dom";

// Home screen. Entry point of the customer flow: choose how to start browsing.
// "Search by Budget" is intentionally not offered yet (later vertical slice).
function HomePage() {
  return (
    <main className="app home">
      <header className="home__header">
        <p className="home__brand">Real Estate Network</p>
      </header>

      <h1 className="home__title">What are you looking for?</h1>

      <div className="home__actions">
        <Link className="home__action" to="/locations">
          <span className="home__action-title">Search by Location</span>
          <span className="home__action-text">Browse properties by area</span>
        </Link>

        <Link className="home__action" to="/properties">
          <span className="home__action-title">Explore All Properties</span>
          <span className="home__action-text">See every available property</span>
        </Link>
      </div>
    </main>
  );
}

export default HomePage;
