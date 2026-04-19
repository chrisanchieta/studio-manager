import { useEffect, useState } from 'react'
import { clientService } from '../services/clientService'
import { employeeService, Employee } from '../services/employeeService'
import { appointmentService, Appointment } from '../services/appointmentService'

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const label = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
  return { start, end, label }
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface Stats {
  totalRevenue: number
  totalCommissions: number
  netRevenue: number
  avgTicket: number
  totalClients: number
  totalEmployees: number
  topEmployee: string
  topEmployeeSub: string
  topProcedure: string
  topProcedureSub: string
  empBars: { name: string; total: number; commission: number; pct: number }[]
  procBars: { name: string; count: number; total: number; pct: number }[]
  recent: Appointment[]
}

function compute(clients: any[], employees: Employee[], appointments: Appointment[]): Stats {
  const { start, end } = getMonthRange()

  // Filter everything to current month
  const monthAppts = appointments.filter(a => {
    const d = new Date((a as any).createdAt ?? 0)
    return d >= start && d <= end
  })

  const totalRevenue = monthAppts.reduce((s, a) => s + (a.amountPaid ?? 0), 0)
  const totalClients = clients.length
  const totalEmployees = employees.length
  const avgTicket = monthAppts.length > 0 ? totalRevenue / monthAppts.length : 0

  // Employee revenue map (month only)
  const empMap: Record<string, { name: string; total: number; commission: number; count: number }> = {}
  employees.forEach(e => {
    empMap[e._id] = { name: e.name, total: 0, commission: e.commission, count: 0 }
  })
  monthAppts.forEach(a => {
    const id = typeof a.employee === 'object' ? a.employee._id : a.employee as string
    if (empMap[id]) { empMap[id].total += a.amountPaid ?? 0; empMap[id].count++ }
  })

  const empList = Object.values(empMap).filter(e => e.total > 0).sort((a, b) => b.total - a.total)
  const totalCommissions = empList.reduce((s, e) => s + (e.total * e.commission) / 100, 0)
  const netRevenue = totalRevenue - totalCommissions
  const maxEmp = empList[0]?.total ?? 1

  // Procedures (month only)
  const procMap: Record<string, { count: number; total: number }> = {}
  monthAppts.forEach(a => {
    if (!procMap[a.procedure]) procMap[a.procedure] = { count: 0, total: 0 }
    procMap[a.procedure].count++
    procMap[a.procedure].total += a.amountPaid ?? 0
  })
  const procList = Object.entries(procMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
  const maxProc = procList[0]?.count ?? 1

  // Recent 5 (month only)
  const recent = [...monthAppts]
    .sort((a, b) => new Date((b as any).createdAt ?? 0).getTime() - new Date((a as any).createdAt ?? 0).getTime())
    .slice(0, 5)

  return {
    totalRevenue,
    totalCommissions,
    netRevenue,
    avgTicket,
    totalClients,
    totalEmployees,
    topEmployee: empList[0]?.name ?? '—',
    topEmployeeSub: empList[0] ? `${empList[0].count} atendimento${empList[0].count !== 1 ? 's' : ''}` : 'sem atendimentos',
    topProcedure: procList[0]?.name ?? '—',
    topProcedureSub: procList[0] ? `${procList[0].count}x realizado${procList[0].count !== 1 ? 's' : ''}` : 'sem registros',
    empBars: empList.map(e => ({ ...e, pct: (e.total / maxEmp) * 100 })),
    procBars: procList.slice(0, 5).map(p => ({ ...p, pct: (p.count / maxProc) * 100 })),
    recent,
  }
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { label: monthLabel } = getMonthRange()

  useEffect(() => {
    Promise.all([clientService.getAll(), employeeService.getAll(), appointmentService.getAll()])
      .then(([c, e, a]) => setStats(compute(c, e, a)))
      .catch(() => setError('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [])

  const getName = (a: Appointment, field: 'client' | 'employee') => {
    const v = a[field]
    return typeof v === 'object' && v !== null ? (v as any).name : '—'
  }

  if (loading) return (
    <main className="main-content">
      <div className="page-container">
        <div className="state-loading" style={{ minHeight: '50vh' }}><div className="spinner" /><span>Carregando relatório…</span></div>
      </div>
    </main>
  )

  if (error || !stats) return (
    <main className="main-content">
      <div className="page-container"><div className="state-error">⚠ {error}</div></div>
    </main>
  )

  return (
    <main className="main-content">
      <div className="page-container">
        <div className="page-header fade-up fade-up-1">
          <div className="page-eyebrow">Visão Geral</div>
          <div className="page-title">Relatório</div>
          <p className="page-desc">Desempenho do estúdio em <strong>{monthLabel}</strong> — zera automaticamente todo mês.</p>
        </div>
        <div className="section-divider" />

        {/* ── 4 KPI Cards ── */}
        <div className="metrics-grid fade-up fade-up-2">
          <div className="metric-card dark">
            <div className="metric-label">Faturamento Bruto</div>
            <div className="metric-value">{fmt(stats.totalRevenue)}</div>
            <div className="metric-sub">{monthLabel}</div>
          </div>
          <div className="metric-card green">
            <div className="metric-label">Faturamento Líquido</div>
            <div className="metric-value">{fmt(stats.netRevenue)}</div>
            <div className="metric-sub">−{fmt(stats.totalCommissions)} em comissões</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Ticket Médio</div>
            <div className="metric-value">{fmt(stats.avgTicket)}</div>
            <div className="metric-sub">por atendimento</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total de Clientes</div>
            <div className="metric-value">{stats.totalClients}</div>
            <div className="metric-sub">{stats.totalEmployees} funcionário{stats.totalEmployees !== 1 ? 's' : ''} ativo{stats.totalEmployees !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* ── Highlights ── */}
        <div className="highlights-grid fade-up fade-up-3">
          <div className="highlight-card">
            <span className="highlight-icon">✦</span>
            <div>
              <div className="highlight-label">Funcionário Destaque do Mês</div>
              <div className="highlight-name">{stats.topEmployee}</div>
              <div className="highlight-sub">{stats.topEmployeeSub}</div>
            </div>
          </div>
          <div className="highlight-card">
            <span className="highlight-icon">◈</span>
            <div>
              <div className="highlight-label">Procedimento Mais Realizado</div>
              <div className="highlight-name">{stats.topProcedure}</div>
              <div className="highlight-sub">{stats.topProcedureSub}</div>
            </div>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="bottom-grid fade-up fade-up-4">
          <div className="report-card">
            <div className="report-card-title">Faturamento por Funcionário</div>
            {stats.empBars.length === 0
              ? <div className="state-empty">Sem atendimentos este mês.</div>
              : stats.empBars.map(e => (
                <div className="bar-row" key={e.name}>
                  <div className="bar-row-header">
                    <span className="bar-row-name">{e.name}</span>
                    <span className="bar-row-val">{fmt(e.total)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${e.pct}%` }} />
                  </div>
                  <div className="bar-commission">
                    <span>{e.commission}% comissão</span>
                    <span className="bar-commission-val">{fmt((e.total * e.commission) / 100)} a pagar</span>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="report-card">
            <div className="report-card-title">Procedimentos Populares</div>
            {stats.procBars.length === 0
              ? <div className="state-empty">Sem atendimentos este mês.</div>
              : stats.procBars.map(p => (
                <div className="proc-row" key={p.name}>
                  <span className="proc-row-name">{p.name}</span>
                  <div className="proc-bar-track">
                    <div className="proc-bar-fill" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="proc-row-meta">{p.count}x · {fmt(p.total)}</span>
                </div>
              ))
            }
          </div>

          <div className="report-card section-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="report-card-title" style={{ marginBottom: 0 }}>Atendimentos Recentes</div>
              <span style={{ fontSize: 12, color: 'var(--light)' }}>últimos 5 do mês</span>
            </div>
            <div className="recent-table">
              <div className="recent-header">
                {['Cliente','Procedimento','Funcionário','Valor','Data'].map(h => (
                  <div key={h} className="recent-header-cell">{h}</div>
                ))}
              </div>
              {stats.recent.length === 0
                ? <div className="state-empty">Sem atendimentos este mês.</div>
                : stats.recent.map(a => (
                  <div className="recent-row" key={a._id}>
                    <div className="recent-cell">{getName(a, 'client')}</div>
                    <div className="recent-cell"><span className="badge">{a.procedure}</span></div>
                    <div className="recent-cell">{getName(a, 'employee')}</div>
                    <div className="recent-cell val">{fmt(a.amountPaid)}</div>
                    <div className="recent-cell" style={{ color: 'var(--light)' }}>{fmtDate(a.createdAt)}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {stats.totalRevenue === 0 && (
          <div className="state-empty" style={{ padding: '5rem 2rem' }}>
            <p>Nenhum atendimento registrado em {monthLabel}.</p>
          </div>
        )}
      </div>
    </main>
  )
}
