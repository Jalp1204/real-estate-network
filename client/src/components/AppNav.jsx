import { Link } from "react-router-dom";

// Slim, persistent top navigation shown on every screen.
// The "Customers" and "Brokers" entries are the private/internal area, kept
// visually separate from the customer-facing presentation links (Shortlist).
function AppNav() {
  return (
    <header className="app-nav">
      <nav className="app-nav__inner" aria-label="Primary">
        <Link className="app-nav__brand" to="/">
          Real Estate Network
        </Link>

        <div className="app-nav__links">
          <Link className="app-nav__link" to="/shortlist">
            <span className="app-nav__icon" aria-hidden="true">
              ★
            </span>
            <span>My Shortlist</span>
          </Link>

          <span className="app-nav__divider" aria-hidden="true" />

          <Link className="app-nav__link app-nav__link--private" to="/customers">
            <span>Customers</span>
          </Link>

          <Link className="app-nav__link app-nav__link--private" to="/brokers">
            <span>Brokers</span>
          </Link>

          <Link
            className="app-nav__link app-nav__link--private"
            to="/inventory/properties"
          >
            <span>Inventory</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default AppNav;
