import { api } from './apiClient';

export const getMatches = () => api.get('/matches');
export const createMatch = (data) => api.post('/admin/matches', data);
export const updateMatch = (id, data) => api.put(`/admin/matches/${id}`, data);
export const deleteMatch = (id) => api.delete(`/admin/matches/${id}`);
export const syncMatches = () => api.post('/admin/sync/matches');
