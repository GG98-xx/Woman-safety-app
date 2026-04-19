import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register   = (data) => API.post('/auth/register', data);
export const login      = (data) => API.post('/auth/login', data);
export const getProfile = ()     => API.get('/auth/profile');

// Incidents
export const createIncident       = (data)     => API.post('/incidents', data);
export const getMyIncidents       = ()          => API.get('/incidents/my');
export const getAllIncidents       = ()          => API.get('/incidents');
export const getIncidentById      = (id)        => API.get(`/incidents/${id}`);
export const updateIncidentStatus = (id, data)  => API.put(`/incidents/${id}/status`, data);

// Admin
export const getDashboardStats = ()          => API.get('/admin/stats');
export const getAllUsers        = ()          => API.get('/admin/users');
export const getAllAuthorities  = ()          => API.get('/admin/authorities');
export const assignIncident    = (id, data)  => API.post(`/admin/assign/${id}`, data);

// Authority
export const getAssignedIncidents = ()         => API.get('/authority/assigned');
export const resolveIncident      = (id, data) => API.put(`/authority/resolve/${id}`, data);

// Community Alerts
export const createAlert  = (data) => API.post('/alerts', data);
export const getAlerts    = ()      => API.get('/alerts');
export const helpAlert    = (id)    => API.put(`/alerts/${id}/help`);
export const resolveAlert = (id)    => API.put(`/alerts/${id}/resolve`);