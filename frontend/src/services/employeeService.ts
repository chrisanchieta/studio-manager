import api from '../api/api'

export interface Employee {
  _id: string
  name: string
  role: string
  commission: number
}

export interface EmployeeEarnings {
  total: number
  [key: string]: unknown
}

export interface CreateEmployeePayload {
  name: string
  role: string
  commission: number
}

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const res = await api.get<Employee[]>('/employees')
    return res.data
  },
  getById: async (id: string): Promise<Employee> => {
    const res = await api.get<Employee>(`/employees/${id}`)
    return res.data
  },
  getEarnings: async (id: string): Promise<EmployeeEarnings> => {
    const res = await api.get<EmployeeEarnings>(`/employees/${id}/earnings`)
    return res.data
  },
  getEarningsByDate: async (id: string, params?: Record<string, string>): Promise<EmployeeEarnings> => {
    const res = await api.get<EmployeeEarnings>(`/employees/${id}/earnings/date`, { params })
    return res.data
  },
  create: async (payload: CreateEmployeePayload): Promise<Employee> => {
    const res = await api.post<Employee>('/employees', payload)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`)
  },
}
