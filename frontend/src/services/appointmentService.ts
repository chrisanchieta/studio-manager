import api from '../api/api'

export interface Appointment {
  _id: string
  procedure: string
  amountPaid: number
  createdAt?: string
  client: { _id: string; name: string; phone?: string } | string
  employee: { _id: string; name: string; role?: string; commission?: number } | string
}

export interface CreateAppointmentPayload {
  clientId: string
  employeeId: string
  procedure: string
  amountPaid: number
}

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const res = await api.get<Appointment[]>('/appointments')
    return res.data
  },
  getById: async (id: string): Promise<Appointment> => {
    const res = await api.get<Appointment>(`/appointments/${id}`)
    return res.data
  },
  getByClient: async (clientId: string): Promise<Appointment[]> => {
    const res = await api.get<Appointment[]>(`/clients/${clientId}/appointments`)
    return res.data
  },
  getByEmployee: async (employeeId: string): Promise<Appointment[]> => {
    const res = await api.get<Appointment[]>(`/employees/${employeeId}/appointments`)
    return res.data
  },
  create: async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    const res = await api.post<Appointment>('/appointments', payload)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`)
  },
}
