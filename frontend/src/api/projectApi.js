import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export const getProjects = async (params) => {
  const { data } = await api.get('/projects', { params })
  return data
}

export const createProject = async (payload) => {
  const { data } = await api.post('/projects', payload)
  return data
}

export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, payload)
  return data
}

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`)
  return data
}
