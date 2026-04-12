import { api } from './apiClient';

export const getPlayers = () => api.get('/players');
export const createPlayer = (data) => api.post('/admin/players', data);
export const updatePlayer = (id, data) => api.put(`/admin/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/admin/players/${id}`);
export const syncPlayers = () => api.post('/admin/sync/players');
