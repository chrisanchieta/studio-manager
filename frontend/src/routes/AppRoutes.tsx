import { Routes, Route, Navigate } from 'react-router-dom'
import { Home } from '../pages/Home'
import { Dashboard } from '../pages/Dashboard'
import { Employees } from '../pages/Employees'
import { Clients } from '../pages/Clients'
import { Appointments } from '../pages/Appointments'
import { Login } from '../pages/Login'
import { PrivateRoute } from '../components/PrivateRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/relatorio" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/funcionarios" element={<PrivateRoute><Employees /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><Clients /></PrivateRoute>} />
      <Route path="/atendimentos" element={<PrivateRoute><Appointments /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
