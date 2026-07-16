import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

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
          className={({ isActive }) =>
            isActive ? 'app-header__nav-link app-header__nav-link--active' : 'app-header__nav-link'
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            isActive ? 'app-header__nav-link app-header__nav-link--active' : 'app-header__nav-link'
          }
        >
          Feedback
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? 'app-header__nav-link app-header__nav-link--active' : 'app-header__nav-link'
          }
        >
          About
        </NavLink>
      </nav>
    </header>
  );
}
