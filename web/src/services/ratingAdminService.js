import { api } from './apiClient';

export const getRatings = () => api.get('/admin/ratings');
export const getRefereeRatings = () => api.get('/admin/referee-ratings');
export const getAtmosphereRatings = () => api.get('/admin/atmosphere-ratings');

export const deleteRating = (id) => api.delete(`/admin/ratings/${id}`);
export const deleteRefereeRating = (id) => api.delete(`/admin/referee-ratings/${id}`);
export const deleteAtmosphereRating = (id) => api.delete(`/admin/atmosphere-ratings/${id}`);
