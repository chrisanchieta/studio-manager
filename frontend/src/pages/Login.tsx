import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Preencha usuário e senha.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await authService.login({ username: username.trim(), password })
      authService.saveSession(data.token, data.username)
      navigate('/')
    } catch {
      setError('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-name">Veronica Bianco</div>
          <div className="login-brand-sub">Studio</div>
        </div>
        <div className="login-tagline">
          <span className="login-tagline-black">Gestão</span>
          <span className="login-tagline-gold">elegante.</span>
        </div>
        <p className="login-left-desc">
          Sistema de gestão do estúdio de beleza.
          Controle atendimentos, funcionários e relatórios em um só lugar.
        </p>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-box-eyebrow">Acesso Restrito</div>
          <h1 className="login-box-title">Entrar</h1>
          <p className="login-box-desc">Use as credenciais do estúdio para acessar.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
            <div className="form-group">
              <label className="form-label">Usuário</label>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="state-error" style={{ marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              {loading ? '…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
