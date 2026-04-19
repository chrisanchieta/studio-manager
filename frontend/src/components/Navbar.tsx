import { NavLink, Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export function Navbar() {
  const navigate = useNavigate()
  const user = authService.getUser()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-name">Veronica Bianco</span>
        <span className="navbar-brand-sub">Studio</span>
      </Link>
      <ul className="navbar-links">
        {[
          { to: '/', label: 'Início', end: true },
          { to: '/relatorio', label: 'Relatório' },
          { to: '/funcionarios', label: 'Funcionários' },
          { to: '/clientes', label: 'Clientes' },
          { to: '/atendimentos', label: 'Atendimentos' },
        ].map(({ to, label, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="navbar-user">
        <span className="navbar-username">{user}</span>
        <button className="navbar-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  )
}
