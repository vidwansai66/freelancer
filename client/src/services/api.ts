import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Admin token if present

// Response interceptor: handle 401 unauthorized automatically
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/admin') &&
      window.location.pathname !== '/admin/login'
    ) {
      localStorage.removeItem('studio_admin_token');
      localStorage.removeItem('studio_admin_user');
      window.location.href = '/admin/login';
    }
    if (error.response?.status !== 401) {
      const data = error.response?.data;
      let rawMsg =
        (typeof data?.error === 'string' ? data.error : null) ||
        (typeof data?.message === 'string' ? data.message : null) ||
        (data?.error?.message ? String(data.error.message) : null) ||
        (typeof data === 'string' ? data : null) ||
        error.message ||
        'The server could not complete this request.';
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: String(rawMsg),
        }),
      );
    }
    return Promise.reject(error);
  },
);

// Typed API Helper functions
export const servicesApi = {
  getAll: () => api.get('/services').then((res) => res.data.data),
  getBySlug: (slug: string) => api.get(`/services/${slug}`).then((res) => res.data.data),
  create: (data: any) => api.post('/services', data).then((res) => res.data.data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/services/${id}`).then((res) => res.data.data),
};

export const projectsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/projects', { params }).then((res) => res.data),
  getBySlug: (slug: string) => api.get(`/projects/${slug}`).then((res) => res.data.data),
  create: (data: any) => api.post('/projects', data).then((res) => res.data.data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then((res) => res.data.data),
};

export const pricingApi = {
  getAll: () => api.get('/pricing').then((res) => res.data.data),
  getAllAdmin: () => api.get('/pricing/admin/all').then((res) => res.data.data),
  create: (data: any) => api.post('/pricing', data).then((res) => res.data.data),
  update: (id: string, data: any) => api.put(`/pricing/${id}`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/pricing/${id}`).then((res) => res.data.data),
};

export const inquiriesApi = {
  submit: (data: any) => api.post('/inquiries', data).then((res) => res.data),
  getAllAdmin: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/inquiries', { params }).then((res) => res.data),
  getById: (id: string) => api.get(`/inquiries/${id}`).then((res) => res.data.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/inquiries/${id}/status`, { status }).then((res) => res.data.data),
  reply: (id: string, replyMessage: string) =>
    api.post(`/inquiries/${id}/reply`, { replyMessage }).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/inquiries/${id}`).then((res) => res.data.data),
};

export const quotationsApi = {
  submit: (data: any) => api.post('/quotations', data).then((res) => res.data),
  getAllAdmin: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/quotations', { params }).then((res) => res.data),
  getById: (id: string) => api.get(`/quotations/${id}`).then((res) => res.data.data),
  update: (id: string, data: any) =>
    api.put(`/quotations/${id}`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/quotations/${id}`).then((res) => res.data.data),
};

export const appointmentsApi = {
  getAvailableSlots: (date: string) =>
    api.get(`/appointments/available-slots?date=${date}`).then((res) => res.data.data),
  book: (data: any) => api.post('/appointments', data).then((res) => res.data.data),
  getAllAdmin: (params?: {
    status?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => api.get('/appointments', { params }).then((res) => res.data),
  update: (id: string, data: any) =>
    api.put(`/appointments/${id}`, data).then((res) => res.data.data),
  cancel: (id: string) => api.delete(`/appointments/${id}`).then((res) => res.data.data),
};

export const testimonialsApi = {
  getApproved: () => api.get('/testimonials').then((res) => res.data.data),
  submit: (data: any) => api.post('/testimonials', data).then((res) => res.data.data),
  getAllAdmin: () => api.get('/testimonials/admin/all').then((res) => res.data.data),
  toggleApprove: (id: string, data: { isApproved?: boolean; isFeatured?: boolean }) =>
    api.put(`/testimonials/${id}/approve`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/testimonials/${id}`).then((res) => res.data.data),
};

export const blogApi = {
  getPublished: (params?: { tag?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/blog', { params }).then((res) => res.data),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`).then((res) => res.data.data),
  getAllAdmin: () => api.get('/blog/admin/all').then((res) => res.data.data),
  create: (data: any) => api.post('/blog', data).then((res) => res.data.data),
  update: (id: string, data: any) => api.put(`/blog/${id}`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/blog/${id}`).then((res) => res.data.data),
};

export const faqApi = {
  getActive: () => api.get('/faqs').then((res) => res.data.data),
  getAllAdmin: () => api.get('/faqs/admin/all').then((res) => res.data.data),
  create: (data: any) => api.post('/faqs', data).then((res) => res.data.data),
  update: (id: string, data: any) => api.put(`/faqs/${id}`, data).then((res) => res.data.data),
  delete: (id: string) => api.delete(`/faqs/${id}`).then((res) => res.data.data),
};

export const chatApi = {
  initSession: (data: { sessionId: string; clientName?: string; clientEmail?: string }) =>
    api.post('/chat/session', data).then((res) => res.data.data),
  getMessages: (sessionId: string) =>
    api.get(`/chat/${sessionId}/messages`).then((res) => res.data.data),
  sendMessage: (sessionId: string, message: string, clientName?: string) =>
    api.post(`/chat/${sessionId}/message`, { message, clientName }).then((res) => res.data.data),
  getAdminConversations: () => api.get('/chat/admin/conversations').then((res) => res.data.data),
  sendAdminReply: (sessionId: string, message: string) =>
    api.post(`/chat/admin/${sessionId}/reply`, { message }).then((res) => res.data.data),
  closeConversation: (sessionId: string) =>
    api.put(`/chat/admin/${sessionId}/close`).then((res) => res.data.data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats', { timeout: 30000 }).then((res) => res.data.data),
};

export const settingsApi = {
  get: () => api.get('/settings').then((res) => res.data.data),
  update: (data: any) => api.put('/settings', data).then((res) => res.data.data),
};
