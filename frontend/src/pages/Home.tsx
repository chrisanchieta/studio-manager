import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { employeeService } from '../services/employeeService'
import { clientService } from '../services/clientService'
import { appointmentService } from '../services/appointmentService'

export function Home() {
  const [counts, setCounts] = useState({ employees: '—', clients: '—', appts: '—' })

  useEffect(() => {
    Promise.allSettled([
      employeeService.getAll(),
      clientService.getAll(),
      appointmentService.getAll(),
    ]).then(([emp, cli, appt]) => {
      setCounts({
        employees: emp.status === 'fulfilled' ? String(emp.value.length) : '—',
        clients: cli.status === 'fulfilled' ? String(cli.value.length) : '—',
        appts: appt.status === 'fulfilled' ? String(appt.value.length) : '—',
      })
    })
  }, [])

  return (
    <main className="main-content">
      <div className="home-gradient" />
      <div className="home-content">
        <div className="home-eyebrow fade-up fade-up-1">
          <div className="home-eyebrow-line" />
          <span className="home-eyebrow-text">Sistema de Gestão</span>
        </div>

        <div className="home-title fade-up fade-up-2">
          <span className="home-title-black">Veronica</span>
          <span className="home-title-gold">Bianco</span>
        </div>
        <p className="home-subtitle fade-up fade-up-2">Studio de Beleza</p>
        <p className="home-desc fade-up fade-up-3">
          Gerencie seus funcionários e clientes com elegância e eficiência.
          Acompanhe procedimentos, comissões e muito mais em um único lugar.
        </p>

        <div className="home-cards fade-up fade-up-3">
          {[
            { to: '/relatorio', icon: '◎', label: 'Visualizar', title: 'Relatório' },
            { to: '/funcionarios', icon: '✦', label: 'Gerenciar', title: 'Funcionários' },
            { to: '/clientes', icon: '◈', label: 'Gerenciar', title: 'Clientes' },
            { to: '/atendimentos', icon: '❋', label: 'Registrar', title: 'Atendimentos' },
          ].map(({ to, icon, label, title }) => (
            <Link key={to} to={to} className="home-card">
              <span className="home-card-icon">{icon}</span>
              <div className="home-card-label">{label}</div>
              <div className="home-card-title">{title}</div>
            </Link>
          ))}
        </div>

        <div className="home-divider" />
        <div className="home-stats fade-up fade-up-4">
          <div>
            <div className="home-stat-num">{counts.employees}</div>
            <div className="home-stat-label">Funcionários</div>
          </div>
          <div>
            <div className="home-stat-num">{counts.clients}</div>
            <div className="home-stat-label">Clientes</div>
          </div>
          <div>
            <div className="home-stat-num">{counts.appts}</div>
            <div className="home-stat-label">Atendimentos</div>
          </div>
        </div>
      </div>
    </main>
  )
}
