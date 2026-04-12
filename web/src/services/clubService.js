import { api } from './apiClient';

export const getClubs = () => api.get('/clubs');
export const createClub = (data) => api.post('/admin/clubs', data);
export const updateClub = (id, data) => api.put(`/admin/clubs/${id}`, data);
export const deleteClub = (id) => api.delete(`/admin/clubs/${id}`);
export const syncClubs = () => api.post('/admin/sync/clubs');
