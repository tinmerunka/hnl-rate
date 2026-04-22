import { api } from './apiClient';

export const getUsers = () => api.get('/admin/users');
export const setUserBlocked = (id, blocked) => api.put(`/admin/users/${id}/block`, { blocked });
