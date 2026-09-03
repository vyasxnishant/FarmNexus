import axios from 'axios'

export const API_BASE_URL = 'https://farm-nexus-qwoz.vercel.app/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
export { apiClient }