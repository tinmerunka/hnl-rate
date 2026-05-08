import { api } from './apiClient';

export const getComments = () => api.get('/admin/comments');
export const deleteComment = (id) => api.delete(`/admin/comments/${id}`);
