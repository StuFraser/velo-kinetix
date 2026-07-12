import logo from '../assets/logo.png';

export function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="VeloKinetix" className="app-header__logo" />
      <span className="app-header__wordmark">
        <span className="app-header__velo">Velo</span>
        <span className="app-header__kinetix">Kinetix</span>
      </span>
    </header>
  );
}
