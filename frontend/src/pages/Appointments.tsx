import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { appointmentService, Appointment, CreateAppointmentPayload } from '../services/appointmentService'
import { clientService, Client } from '../services/clientService'
import { employeeService, Employee } from '../services/employeeService'
import { useToast } from '../components/ui/Toast'
import { useConfirm } from '../components/ui/Confirm'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const fmtDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function Appointments() {
  const toast = useToast()
  const { confirm } = useConfirm()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  // Client search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const lookupRef = useRef<HTMLDivElement>(null)

  // Form
  const [employee, setEmployee] = useState('')
  const [procedure, setProcedure] = useState('')
  const [amountPaid, setAmountPaid] = useState('0,00')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  useEffect(() => {
    Promise.all([appointmentService.getAll(), employeeService.getAll()])
      .then(([a, e]) => { setAppointments(a); setEmployees(e) })
      .catch(() => toast.error('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (lookupRef.current && !lookupRef.current.contains(e.target as Node))
        setShowResults(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    setSelectedClient(null)
    if (q.length < 2) { setShowResults(false); return }
    try {
      const results = await clientService.search(q)
      setSearchResults(Array.isArray(results) ? results : [])
      setShowResults(true)
    } catch { setShowResults(false) }
  }

  const selectClient = (client: Client) => {
    setSelectedClient(client)
    setSearchQuery(client.name + (client.phone ? ` · ${client.phone}` : ''))
    setShowResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) { toast.error('Selecione um cliente.'); return }
    if (!employee) { toast.error('Selecione um funcionário.'); return }
    if (!procedure.trim()) { toast.error('Informe o procedimento.'); return }
    const amount = parseFloat(amountPaid.replace(',', '.'))
    if (!amount || amount <= 0) { toast.error('Informe um valor válido.'); return }

    setSubmitting(true)
    try {
      const payload: CreateAppointmentPayload = {
        clientId: selectedClient._id,
        employeeId: employee,
        procedure: procedure.trim(),
        amountPaid: amount,
      }
      const created = await appointmentService.create(payload)
      setAppointments(p => [created, ...p])
      setPage(1)
      setSelectedClient(null)
      setSearchQuery('')
      setEmployee('')
      setProcedure('')
      setAmountPaid('0,00')
      toast.success('Atendimento registrado com sucesso!')
    } catch { toast.error('Erro ao registrar atendimento.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (appt: Appointment) => {
    const ok = await confirm({
      title: 'Excluir Atendimento',
      message: 'Tem certeza que deseja excluir este atendimento?',
      confirmLabel: 'Excluir', danger: true,
    })
    if (!ok) return
    setDeletingId(appt._id)
    try {
      await appointmentService.delete(appt._id)
      setAppointments(p => p.filter(a => a._id !== appt._id))
      toast.success('Atendimento excluído.')
    } catch { toast.error('Erro ao excluir atendimento.') }
    finally { setDeletingId(null) }
  }

  const getName = (a: Appointment, field: 'client' | 'employee') => {
    const v = a[field]
    return typeof v === 'object' && v !== null ? (v as any).name : '—'
  }

  const sorted = [...appointments].sort((a, b) =>
    new Date((b as any).createdAt ?? 0).getTime() - new Date((a as any).createdAt ?? 0).getTime()
  )

  return (
    <main className="main-content">
      <div className="page-container-lg">

        {/* ── Header ── */}
        <div className="page-header fade-up fade-up-1">
          <div className="page-eyebrow">Gestão</div>
          <div className="page-title">Atendimentos</div>
          <p className="page-desc">Registre novos atendimentos e consulte o histórico.</p>
        </div>
        <div className="section-divider" />

        {/* ── Top grid: Form + How it works ── */}
        <div className="appt-top-grid fade-up fade-up-2">

          {/* Form card */}
          <div className="card">
            <div className="card-title">Novo Atendimento</div>
            <form onSubmit={handleSubmit}>

              {/* Client search */}
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <div className="client-lookup" ref={lookupRef}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Buscar por nome ou telefone…"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {showResults && (
                    <div className="client-lookup-results show">
                      {searchResults.length === 0 ? (
                        <div className="client-lookup-item" style={{ color: 'var(--light)' }}>
                          Nenhum cliente encontrado
                        </div>
                      ) : searchResults.map(c => (
                        <div key={c._id} className="client-lookup-item" onClick={() => selectClient(c)}>
                          <span>{c.name}</span>
                          <span className="client-lookup-phone">{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedClient && (
                  <div className="client-selected show">
                    <span className="client-selected-name">
                      {selectedClient.name}{selectedClient.phone ? ` · ${selectedClient.phone}` : ''}
                    </span>
                    <button
                      type="button"
                      className="client-clear"
                      onClick={() => { setSelectedClient(null); setSearchQuery('') }}
                    >×</button>
                  </div>
                )}
              </div>

              {/* Employee */}
              <div className="form-group">
                <label className="form-label">Funcionário</label>
                <select
                  className="form-select"
                  value={employee}
                  onChange={e => setEmployee(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>

              {/* Procedure */}
              <div className="form-group">
                <label className="form-label">Procedimento</label>
                <input
                  className="form-input"
                  type="text"
                  value={procedure}
                  onChange={e => setProcedure(e.target.value)}
                  placeholder="Ex: Sobrancelha Simples"
                  autoComplete="off"
                />
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Valor Cobrado (R$)</label>
                <input
                  className="form-input"
                  type="number"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  min={0}
                  step={0.01}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? '…' : '+ Registrar Atendimento'}
              </button>
            </form>
          </div>

          {/* How it works card */}
          <div className="appt-howto-card">
            <div className="appt-howto-title">Como funciona</div>
            <div className="appt-howto-step">
              <div className="appt-howto-step-title">1. Busque o cliente</div>
              <div className="appt-howto-step-desc">
                Digite o nome ou telefone para encontrar um cliente já cadastrado.
              </div>
            </div>
            <div className="appt-howto-step">
              <div className="appt-howto-step-title">2. Sem cadastro?</div>
              <div className="appt-howto-step-desc">
                Vá em <Link to="/clientes" className="appt-howto-link">Clientes</Link> para
                cadastrar primeiro, depois volte aqui.
              </div>
            </div>
            <div className="appt-howto-step">
              <div className="appt-howto-step-title">3. Preencha o atendimento</div>
              <div className="appt-howto-step-desc">
                Selecione o funcionário, informe o procedimento e o valor cobrado.
              </div>
            </div>
          </div>
        </div>

        {/* ── History table ── */}
        <div className="appt-list-card fade-up fade-up-3">
          <div className="appt-list-header">
            <span className="appt-list-title">Histórico de Atendimentos</span>
            <span className="appt-count">{appointments.length} registro{appointments.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="appt-table-header">
            {['Cliente', 'Procedimento', 'Funcionário', 'Valor', 'Data', ''].map((h, i) => (
              <div key={i} className="appt-table-header-cell">{h}</div>
            ))}
          </div>

          {loading ? (
            <div className="state-loading"><div className="spinner" /></div>
          ) : sorted.length === 0 ? (
            <div className="appt-empty">Nenhum atendimento registrado ainda.</div>
          ) : (
            <>
              {sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(a => (
                <div key={a._id} className="appt-row">
                  <div className="appt-cell">{getName(a, 'client')}</div>
                  <div className="appt-cell"><span className="badge">{a.procedure}</span></div>
                  <div className="appt-cell light">{getName(a, 'employee')}</div>
                  <div className="appt-cell gold">{fmt(a.amountPaid)}</div>
                  <div className="appt-cell light">{fmtDate(a.createdAt)}</div>
                  <div className="appt-cell">
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(a)}
                      disabled={deletingId === a._id}
                      title="Excluir"
                    >
                      {deletingId === a._id ? '…' : '✕'}
                    </button>
                  </div>
                </div>
              ))}
              {sorted.length > PAGE_SIZE && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹ Anterior</button>
                  <span className="pagination-info">{page} / {Math.ceil(sorted.length / PAGE_SIZE)}</span>
                  <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(sorted.length / PAGE_SIZE)}>Próximo ›</button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  )
}
