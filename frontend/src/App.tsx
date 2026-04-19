import { BrowserRouter, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AppRoutes } from './routes/AppRoutes'
import { ToastProvider } from './components/ui/Toast'
import { ConfirmProvider } from './components/ui/Confirm'

function Layout() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <div className="app-wrapper">
      {!isLogin && <Navbar />}
      <AppRoutes />
      {!isLogin && (
        <footer>© {new Date().getFullYear()} Veronica Bianco Studio · Todos os direitos reservados</footer>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <Layout />
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
