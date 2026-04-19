import api from '../api/api'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', payload)
    return res.data
  },

  logout: () => {
    localStorage.removeItem('vb_token')
    localStorage.removeItem('vb_user')
  },

  getToken: (): string | null => localStorage.getItem('vb_token'),

  getUser: (): string | null => localStorage.getItem('vb_user'),

  isAuthenticated: (): boolean => !!localStorage.getItem('vb_token'),

  saveSession: (token: string, username: string) => {
    localStorage.setItem('vb_token', token)
    localStorage.setItem('vb_user', username)
  },
}
