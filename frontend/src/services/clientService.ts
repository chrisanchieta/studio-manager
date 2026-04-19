import api from '../api/api'

export interface Client {
  _id: string
  name: string
  phone: string
  createdAt?: string
}

export interface CreateClientPayload {
  name: string
  phone: string
}

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const res = await api.get<Client[]>('/clients')
    return res.data
  },
  getById: async (id: string): Promise<Client> => {
    const res = await api.get<Client>(`/clients/${id}`)
    return res.data
  },
  search: async (q: string): Promise<Client[]> => {
    const res = await api.get<Client[]>(`/clients/search?q=${encodeURIComponent(q)}`)
    return res.data
  },
  create: async (payload: CreateClientPayload): Promise<Client> => {
    const res = await api.post<Client>('/clients', payload)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`)
  },
}
