import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="VeloKinetix" className="app-header__logo" />
      <span className="app-header__wordmark">
        <span className="app-header__velo">Velo</span>
        <span className="app-header__kinetix">Kinetix</span>
      </span>
      <nav className="app-header__nav">
        <NavLink
          to="/"
          end
          aria-label="Home"
          title="Home"
          className={({ isActive }) =>
            isActive ? 'app-header__nav-link app-header__nav-link--active' : 'app-header__nav-link'
          }
        >
          <HomeIcon />
        </NavLink>
        <NavLink
          to="/feedback"
          aria-label="Feedback"
          title="Feedback"
          className={({ isActive }) =>
            isActive ? 'app-header__nav-link app-header__nav-link--active' : 'app-header__nav-link'
          }
        >
          <FeedbackIcon />
        </NavLink>
        <NavLink
          to="/about"
          aria-label="About"
          title="About"
          className={({ isActive }) =>
            isActive ? 'app-header__nav-link app-header__nav-link--active' : 'app-header__nav-link'
          }
        >
          <AboutIcon />
        </NavLink>
      </nav>
    </header>
  );
}
