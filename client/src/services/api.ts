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
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('studio_admin_token');
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

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
    const skipGlobalError = (error.config as any)?.skipGlobalError;
    if (error.response?.status !== 401 && !skipGlobalError) {
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

const STORAGE_CUSTOM_PROJECTS = 'studio_custom_projects';
const STORAGE_DELETED_PROJECTS = 'studio_deleted_project_ids';

const getCustomProjects = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PROJECTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCustomProjects = (projects: any[]): void => {
  try {
    localStorage.setItem(STORAGE_CUSTOM_PROJECTS, JSON.stringify(projects));
  } catch {}
};

const getDeletedProjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_PROJECTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addDeletedProjectId = (id: string): void => {
  try {
    const deleted = getDeletedProjectIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(STORAGE_DELETED_PROJECTS, JSON.stringify(deleted));
    }
  } catch {}
};

const sortProjectsList = (list: any[]): any[] => {
  return [...list].sort((a, b) => {
    const featA = a.isFeatured ? 1 : 0;
    const featB = b.isFeatured ? 1 : 0;
    if (featA !== featB) return featB - featA;

    const ordA = a.orderIndex !== undefined && a.orderIndex !== null ? Number(a.orderIndex) : 999;
    const ordB = b.orderIndex !== undefined && b.orderIndex !== null ? Number(b.orderIndex) : 999;
    if (ordA !== ordB) return ordA - ordB;

    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

export const projectsApi = {
  getAll: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    let serverProjects: any[] = [];
    try {
      const res = await api.get('/projects', { params: { limit: 100 } });
      serverProjects = res.data?.data || [];
    } catch {
      serverProjects = [];
    }

    const customProjects = getCustomProjects();
    const deletedIds = new Set(getDeletedProjectIds());

    // Auto-persist server projects to localStorage so they survive any server restart or cold lambda
    if (serverProjects.length > 0) {
      const existingIds = new Set(customProjects.map((p) => p._id || p.id));
      const newItems = serverProjects.filter(
        (sp) =>
          !deletedIds.has(sp._id) &&
          !deletedIds.has(sp.slug) &&
          !existingIds.has(sp._id || sp.id) &&
          !customProjects.some((cp) => cp.slug === sp.slug),
      );
      if (newItems.length > 0) {
        saveCustomProjects([...customProjects, ...newItems]);
      }
    }

    const currentCustom = getCustomProjects();
    const validCustom = currentCustom.filter(
      (p) => !deletedIds.has(p._id) && !deletedIds.has(p.id) && !deletedIds.has(p.slug),
    );

    const customIds = new Set(validCustom.map((p) => p._id || p.id));
    const customSlugs = new Set(validCustom.map((p) => p.slug));

    const merged: any[] = [...validCustom];
    for (const sp of serverProjects) {
      const spId = sp._id || sp.id;
      if (deletedIds.has(spId) || deletedIds.has(sp.slug)) continue;
      if (customIds.has(spId) || customSlugs.has(sp.slug)) continue;
      merged.push(sp);
    }

    let filtered = sortProjectsList(merged);

    if (params?.category && params.category !== 'All') {
      const catLower = params.category.toLowerCase().trim();
      filtered = filtered.filter((p) => (p.category || '').toLowerCase().trim() === catLower);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.clientName || '').toLowerCase().includes(q) ||
          (Array.isArray(p.technologies) && p.technologies.some((t: string) => t.toLowerCase().includes(q))),
      );
    }

    const total = filtered.length;
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;
    const paginated = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: paginated,
      total,
      page,
      totalPages,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  getBySlug: async (slug: string) => {
    const deletedIds = new Set(getDeletedProjectIds());
    if (deletedIds.has(slug)) {
      throw new Error('Project not found');
    }

    const custom = getCustomProjects().find((p) => p.slug === slug || p._id === slug);
    if (custom && !deletedIds.has(custom._id)) {
      return custom;
    }

    try {
      const res = await api.get(`/projects/${slug}`);
      const project = res.data?.data;
      if (project && (deletedIds.has(project._id) || deletedIds.has(project.slug))) {
        throw new Error('Project not found');
      }
      return project;
    } catch (err) {
      if (custom) return custom;
      throw err;
    }
  },

  create: async (data: any) => {
    let created: any = null;
    try {
      const res = await api.post('/projects', data, { skipGlobalError: true } as any);
      created = res.data?.data;
    } catch (err: any) {
      created = {
        _id: `prj-${Date.now().toString(36)}`,
        title: data.title || 'New Project',
        slug: (data.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString(36)}`,
        category: data.category || 'Web Application',
        clientName: data.clientName || data.title,
        resultStat: data.resultStat || '',
        featuredImage: data.featuredImage || '',
        galleryImages: data.galleryImages || [data.featuredImage],
        liveUrl: data.liveUrl || '',
        githubUrl: data.githubUrl || '',
        technologies: data.technologies || ['Web Studio', 'React'],
        caseStudyMarkdown: data.caseStudyMarkdown || `### ${data.title}`,
        isFeatured: data.isFeatured !== false,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
      };
    }

    if (created) {
      const custom = getCustomProjects();
      const updated = [created, ...custom.filter((p) => p._id !== created._id && p.slug !== created.slug)];
      saveCustomProjects(updated);
    }
    return created;
  },

  update: async (id: string, data: any) => {
    let updated: any = null;
    try {
      const res = await api.put(`/projects/${id}`, data, { skipGlobalError: true } as any);
      updated = res.data?.data;
    } catch {}

    const custom = getCustomProjects();
    const existingIdx = custom.findIndex((p) => p._id === id || p.slug === id);
    if (existingIdx !== -1) {
      custom[existingIdx] = { ...custom[existingIdx], ...data, ...(updated || {}) };
      saveCustomProjects(custom);
      return custom[existingIdx];
    } else if (updated) {
      saveCustomProjects([updated, ...custom]);
      return updated;
    } else {
      const fallback = { _id: id, ...data };
      saveCustomProjects([fallback, ...custom]);
      return fallback;
    }
  },

  delete: async (id: string) => {
    addDeletedProjectId(id);
    const custom = getCustomProjects().filter((p) => p._id !== id && p.slug !== id);
    saveCustomProjects(custom);

    try {
      await api.delete(`/projects/${id}`);
    } catch {
      // Soft-delete persists via localStorage
    }
    return { success: true };
  },
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
    api.post('/chat/session', data, { skipGlobalError: true } as any).then((res) => res.data.data),
  getMessages: (sessionId: string) =>
    api.get(`/chat/${sessionId}/messages`, { skipGlobalError: true } as any).then((res) => res.data.data),
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
