import { api } from './apiClient';

export const getReferees = () => api.get('/referees');
export const createReferee = (data) => api.post('/admin/referees', data);
export const updateReferee = (id, data) => api.put(`/admin/referees/${id}`, data);
export const deleteReferee = (id) => api.delete(`/admin/referees/${id}`);
