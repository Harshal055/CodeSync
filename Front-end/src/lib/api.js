// Centralized API base URL helper
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || 'http://localhost:8081';

export default API_BASE_URL;
