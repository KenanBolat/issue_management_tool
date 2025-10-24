import axios from 'axios';
import { API_BASE_URL } from '../src/config';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getCurrentUser: () => api.get('/auth/me'),

};

export const ticketsAPI = {
    getAll: (status= null) => {
        const params = status ? { status } : {};
        return api.get('/tickets', { params });
    },
    getById: (id) => api.get(`/tickets/${id}`),
    create: (data) => api.post('/tickets', data),
    changeStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
    addComment: (id, body) => api.post(`/tickets/${id}/comments`, body),
    deleteTicket: (id, data) => api.put(`/tickets/${id}`, data),

};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard'),
};


export default api; 