import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

/* ── Room API helpers ── */
export const roomsApi = {
  list:   ()         => api.get('/rooms'),
  create: (name, lang) => api.post('/rooms', { name, language: lang }),
  get:    (id)       => api.get(`/rooms/${id}`),
  delete: (id)       => api.delete(`/rooms/${id}`),
  invite: (id, email) => api.post(`/rooms/${id}/invite`, { email })
}
