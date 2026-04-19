import { useEffect, useState } from 'react'
import { employeeService, Employee, CreateEmployeePayload } from '../services/employeeService'
import { EmployeeEarnings } from '../components/EmployeeEarnings'
import { useToast } from '../components/ui/Toast'
import { useConfirm } from '../components/ui/Confirm'

const EMPTY: CreateEmployeePayload = { name: '', role: '', commission: 0 }

export function Employees() {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateEmployeePayload>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    employeeService.getAll()
      .then(setEmployees)
      .catch(() => setError('Não foi possível carregar os funcionários.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: name === 'commission' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim()) { toast.error('Nome e função são obrigatórios.'); return }
    setSubmitting(true)
    try {
      const created = await employeeService.create(form)
      setEmployees(p => [...p, created])
      setForm(EMPTY)
      toast.success(`${created.name} adicionado com sucesso!`)
    } catch { toast.error('Erro ao adicionar funcionário.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (emp: Employee) => {
    const ok = await confirm({ title: 'Excluir Funcionário', message: `Excluir "${emp.name}"? Esta ação não pode ser desfeita.`, confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    setDeletingId(emp._id)
    try {
      await employeeService.delete(emp._id)
      setEmployees(p => p.filter(e => e._id !== emp._id))
      toast.success(`${emp.name} excluído.`)
    } catch { toast.error('Erro ao excluir funcionário.') }
    finally { setDeletingId(null) }
  }

  return (
    <main className="main-content">
      <div className="page-container-md">
        <div className="page-header fade-up fade-up-1">
          <div className="page-eyebrow">Gestão</div>
          <div className="page-title">Funcionários</div>
          <p className="page-desc">Gerencie a equipe e calcule comissões por período.</p>
        </div>
        <div className="section-divider" />

        {error && <div className="state-error">⚠ {error}</div>}

        {loading ? (
          <div className="state-loading"><div className="spinner" /></div>
        ) : (
          <div className="func-list fade-up fade-up-2">
            {employees.length === 0 ? (
              <div className="state-empty">Nenhum funcionário cadastrado ainda.</div>
            ) : employees.map(emp => (
              <div key={emp._id} className="func-row">
                <div className="func-name">{emp.name}</div>
                <div><span className="func-role-badge">{emp.role}</span></div>
                <div className="func-commission">{emp.commission}% comissão</div>
                <button className="btn-delete" onClick={() => handleDelete(emp)} disabled={deletingId === emp._id}>
                  {deletingId === emp._id ? '…' : 'Excluir'}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && employees.length > 0 && (
          <div className="fade-up fade-up-3">
            <EmployeeEarnings employees={employees} />
          </div>
        )}

        <div className="card fade-up fade-up-4">
          <div className="card-title">Adicionar Funcionário</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Ex: Ana Paula" autoComplete="off" />
              </div>
              <div className="form-group">
                <label className="form-label">Função</label>
                <input className="form-input" type="text" name="role" value={form.role} onChange={handleChange} placeholder="Ex: Cabeleireira" autoComplete="off" />
              </div>
              <div className="form-group">
                <label className="form-label">Comissão (%)</label>
                <input className="form-input" type="number" name="commission" value={form.commission} onChange={handleChange} min={0} max={100} step={0.1} />
              </div>
            </div>
            <button type="submit" className="btn-primary dark" disabled={submitting}>
              {submitting ? '…' : '+ Adicionar Funcionário'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
