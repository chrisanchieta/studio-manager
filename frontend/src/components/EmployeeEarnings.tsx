import { useState } from 'react'
import { employeeService, Employee } from '../services/employeeService'

interface Props { employees: Employee[] }
interface Result { employeeName: string; totalEarnings: number; startDate: string; endDate: string }

const toISO = (d: string) => d.includes('/') ? d.split('/').reverse().join('-') : d
const todayISO = () => new Date().toISOString().split('T')[0]
const firstOfYear = () => `${new Date().getFullYear()}-01-01`
const firstOfMonth = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01` }
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0] }
const fmtBR = (iso: string) => { const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}` }
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function EmployeeEarnings({ employees }: Props) {
  const [selectedId, setSelectedId] = useState('')
  const [startDate, setStartDate] = useState(firstOfMonth())
  const [endDate, setEndDate] = useState(todayISO())
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shortcuts = [
    { label: 'Este mês', action: () => { setStartDate(firstOfMonth()); setEndDate(todayISO()) } },
    { label: 'Este ano', action: () => { setStartDate(firstOfYear()); setEndDate(todayISO()) } },
    { label: 'Últimos 30 dias', action: () => { setStartDate(daysAgo(30)); setEndDate(todayISO()) } },
    { label: 'Últimos 90 dias', action: () => { setStartDate(daysAgo(90)); setEndDate(todayISO()) } },
  ]

  const handleCalc = async () => {
    if (!selectedId) { setError('Selecione um funcionário.'); return }
    if (!startDate || !endDate) { setError('Preencha as duas datas.'); return }
    if (new Date(startDate) > new Date(endDate)) { setError('A data inicial não pode ser maior que a data final.'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await employeeService.getEarningsByDate(selectedId, { startDate: toISO(startDate), endDate: toISO(endDate) })
      const res = data as unknown as { employee: string; totalEarnings: number }
      setResult({ employeeName: res.employee ?? employees.find(e => e._id === selectedId)?.name ?? '', totalEarnings: res.totalEarnings ?? 0, startDate, endDate })
    } catch { setError('Erro ao buscar ganhos.') }
    finally { setLoading(false) }
  }

  return (
    <div className="earnings-card">
      <div className="earnings-card-header">
        <div className="earnings-card-title">Ganhos por Período</div>
        <span className="earnings-badge">Comissão</span>
      </div>
      <p className="earnings-desc">Selecione um funcionário e o período para calcular o valor total de comissão a ser pago.</p>

      <div className="form-group">
        <label className="form-label">Funcionário</label>
        <select className="form-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">Selecione…</option>
          {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.role} ({e.commission}%)</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Data Inicial</label>
          <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} max={endDate} />
        </div>
        <div className="form-group">
          <label className="form-label">Data Final</label>
          <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} max={todayISO()} />
        </div>
      </div>

      <div>
        <label className="form-label">Atalhos</label>
        <div className="shortcuts">
          {shortcuts.map(s => <button key={s.label} type="button" className="shortcut-btn" onClick={s.action}>{s.label}</button>)}
        </div>
      </div>

      {error && <div className="state-error" style={{ marginTop: 12 }}>⚠ {error}</div>}

      <button className="btn-primary" onClick={handleCalc} disabled={loading}>
        {loading ? '↓ Calculando…' : '↓ Calcular Ganhos'}
      </button>

      {result && (
        <div className="earnings-result show">
          <div className="earnings-result-label">Período: {fmtBR(result.startDate)} → {fmtBR(result.endDate)}</div>
          <div className="earnings-result-name">{result.employeeName}</div>
          <div className="earnings-result-value">{fmt(result.totalEarnings)}</div>
          <div className="earnings-result-sub">a receber em comissões</div>
        </div>
      )}
    </div>
  )
}
