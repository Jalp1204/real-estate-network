import { Link } from "react-router-dom";

// Slim, persistent top navigation shown on every screen.
// Currently exposes the "My Shortlist" entry point so it is easy to find from
// anywhere. Reuses the existing visual language; contains no app logic.
function AppNav() {
  return (
    <header className="app-nav">
      <nav className="app-nav__inner" aria-label="Primary">
        <Link className="app-nav__brand" to="/">
          Real Estate Network
        </Link>

        <Link className="app-nav__link" to="/shortlist">
          <span className="app-nav__icon" aria-hidden="true">
            ★
          </span>
          <span>My Shortlist</span>
        </Link>
      </nav>
    </header>
  );
}

export default AppNav;
