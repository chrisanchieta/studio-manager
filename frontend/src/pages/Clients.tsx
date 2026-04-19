import { useEffect, useState } from 'react'
import { clientService, Client } from '../services/clientService'
import { appointmentService, Appointment } from '../services/appointmentService'
import { useToast } from '../components/ui/Toast'
import { useConfirm } from '../components/ui/Confirm'

/* ── helpers ── */
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end, label: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}` }
}

interface TopClient { name: string; count: number; pct: number; rank: 1 | 2 | 3 }

function computeTop3(appointments: Appointment[]): TopClient[] {
  const { start, end } = getMonthRange()

  const monthAppts = appointments.filter(a => {
    const d = new Date((a as any).createdAt ?? 0)
    return d >= start && d <= end
  })

  const countMap: Record<string, { name: string; count: number }> = {}
  monthAppts.forEach(a => {
    const client = a.client
    const id   = typeof client === 'object' ? client._id  : client as string
    const name = typeof client === 'object' ? client.name : id
    if (!countMap[id]) countMap[id] = { name, count: 0 }
    countMap[id].count++
  })

  const sorted = Object.values(countMap).sort((a, b) => b.count - a.count).slice(0, 3)
  const max = sorted[0]?.count ?? 1

  return sorted.map((c, i) => ({
    name: c.name,
    count: c.count,
    pct: Math.round((c.count / max) * 100),
    rank: (i + 1) as 1 | 2 | 3,
  }))
}

/* ── medal colors ── */
const MEDALS: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: '#b8935a', color: '#fff',     label: '1º' },
  2: { bg: '#a89a8a', color: '#fff',     label: '2º' },
  3: { bg: '#ece6dd', color: '#6b6259',  label: '3º' },
}

/* ══════════════════════════════════════════ */

export function Clients() {
  const toast = useToast()
  const { confirm } = useConfirm()

  const [clients,  setClients]  = useState<Client[]>([])
  const [filtered, setFiltered] = useState<Client[]>([])
  const [top3,     setTop3]     = useState<TopClient[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [search,   setSearch]   = useState('')
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  const { label: monthLabel } = getMonthRange()

  useEffect(() => {
    Promise.all([clientService.getAll(), appointmentService.getAll()])
      .then(([c, a]) => {
        setClients(c)
        setFiltered(c)
        setTop3(computeTop3(a))
      })
      .catch(() => setError('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [])

  const applyFilter = (list: Client[], q: string) => {
    const lower = q.toLowerCase()
    return list.filter(c =>
      c.name.toLowerCase().includes(lower) || (c.phone ?? '').includes(lower)
    )
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    setFiltered(applyFilter(clients, q))
    setPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim())  { toast.error('Informe o nome do cliente.'); return }
    if (!phone.trim()) { toast.error('Informe o telefone.'); return }
    setSubmitting(true)
    try {
      const created = await clientService.create({ name: name.trim(), phone: phone.trim() })
      const updated = [...clients, created]
      setClients(updated)
      setFiltered(applyFilter(updated, search))
      setName(''); setPhone('')
      toast.success(`${created.name} cadastrado com sucesso!`)
    } catch { toast.error('Erro ao cadastrar cliente.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (client: Client) => {
    const ok = await confirm({
      title: 'Excluir Cliente',
      message: `Excluir "${client.name}"? Só é possível se não houver atendimentos vinculados.`,
      confirmLabel: 'Excluir', danger: true,
    })
    if (!ok) return
    setDeletingId(client._id)
    try {
      await clientService.delete(client._id)
      const updated = clients.filter(c => c._id !== client._id)
      setClients(updated)
      setFiltered(applyFilter(updated, search))
      toast.success(`${client.name} excluído.`)
    } catch { toast.error('Erro ao excluir cliente.') }
    finally { setDeletingId(null) }
  }

  return (
    <main className="main-content">
      <div className="page-container-md">

        <div className="page-header fade-up fade-up-1">
          <div className="page-eyebrow">Gestão</div>
          <div className="page-title">Clientes</div>
          <p className="page-desc">Cadastre e gerencie os clientes do estúdio.</p>
        </div>
        <div className="section-divider" />

        {error && <div className="state-error">⚠ {error}</div>}

        {/* ── Top 3 chart ── */}
        {!loading && (
          <div className="top3-card fade-up fade-up-2">
            <div className="top3-header">
              <div>
                <div className="top3-title">Top 3 Clientes do Mês</div>
                <div className="top3-period">{monthLabel}</div>
              </div>
              <div className="top3-badge">Ranking</div>
            </div>

            {top3.length === 0 ? (
              <div className="top3-empty">Nenhum atendimento registrado este mês ainda.</div>
            ) : (
              <div className="top3-list">
                {top3.map(c => {
                  const medal = MEDALS[c.rank]
                  return (
                    <div key={c.name} className="top3-row">
                      <div className="top3-medal" style={{ background: medal.bg, color: medal.color }}>
                        {medal.label}
                      </div>
                      <div className="top3-info">
                        <div className="top3-name">{c.name}</div>
                        <div className="top3-bar-track">
                          <div
                            className="top3-bar-fill"
                            style={{
                              width: `${c.pct}%`,
                              background: c.rank === 1 ? 'var(--gold)' : c.rank === 2 ? 'var(--light)' : 'var(--border)',
                            }}
                          />
                        </div>
                      </div>
                      <div className="top3-count">
                        {c.count} atend{c.count !== 1 ? 's' : '.'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Client list ── */}
        <div className="client-list-card fade-up fade-up-3">
          <div className="client-list-header">
            <span className="client-list-title">Todos os Clientes</span>
            <span className="client-count">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="client-search">
            <input
              className="client-search-input"
              type="text"
              placeholder="Buscar por nome ou telefone…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="state-loading"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="client-empty">
              {search ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado ainda.'}
            </div>
          ) : (
            <>
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(client => (
                <div key={client._id} className="client-row">
                  <div className="client-row-name">{client.name}</div>
                  <div className="client-row-phone">{client.phone || '—'}</div>
                  <button className="btn-delete" onClick={() => handleDelete(client)} disabled={deletingId === client._id}>
                    {deletingId === client._id ? '…' : 'Excluir'}
                  </button>
                </div>
              ))}
              {filtered.length > PAGE_SIZE && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹ Anterior</button>
                  <span className="pagination-info">{page} / {Math.ceil(filtered.length / PAGE_SIZE)}</span>
                  <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)}>Próximo ›</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Add client form ── */}
        <div className="card fade-up fade-up-4">
          <div className="card-title">Cadastrar Cliente</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input className="form-input" type="text" value={name}
                  onChange={e => setName(e.target.value)} placeholder="Ex: Maria Silva" autoComplete="off" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" type="text" value={phone}
                  onChange={e => setPhone(e.target.value)} placeholder="Ex: (11) 99999-9999" autoComplete="off" />
              </div>
            </div>
            <button type="submit" className="btn-primary dark" disabled={submitting}>
              {submitting ? '…' : '+ Cadastrar Cliente'}
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}
