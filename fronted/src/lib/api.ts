import type { 
  User, 
  Project, 
  Application, 
  Tracking, 
  Feedback, 
  ApplicationView, 
  MatchResult, 
  LoginResponse 
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// 获取 token
const getToken = () => localStorage.getItem('token');

// 通用请求函数
async function request<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// 认证 API
export const authApi = {
  register: (data: { 
    name: string; 
    email: string; 
    password: string; 
    role: string; 
    skills: string[] 
  }) => request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) => 
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// 用户 API
export const userApi = {
  getMe: () => request<User>('/me'),
  
  updateMe: (data: { name?: string; email?: string; skills?: string[] }) => 
    request<User>('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUsers: (params?: { role?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    return request<User[]>(`/users?${query.toString()}`);
  },

  getUser: (id: number) => request<User>(`/users/${id}`),

  createUser: (data: Partial<User>) => 
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 项目 API
export const projectApi = {
  getProjects: (params?: { 
    teacher_id?: number; 
    archived?: number; 
    page?: number; 
    page_size?: number 
  }) => {
    const query = new URLSearchParams();
    if (params?.teacher_id) query.append('teacher_id', params.teacher_id.toString());
    if (params?.archived !== undefined) query.append('archived', params.archived.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    return request<Project[]>(`/projects?${query.toString()}`);
  },

  createProject: (data: Partial<Project>) => 
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (data: Partial<Project> & { id: number }) => 
    request<Project>('/projects', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: number) => 
    request<{ ok: boolean }>(`/projects?id=${id}`, {
      method: 'DELETE',
    }),

  archiveProject: (id: number, archived: boolean) => 
    request<{ ok: boolean }>('/projects/archive', {
      method: 'POST',
      body: JSON.stringify({ id, archived }),
    }),
};

// 匹配 API
export const matchApi = {
  getMatches: (params: { 
    student_id: number; 
    fast?: boolean; 
    top_k?: number 
  }) => {
    const query = new URLSearchParams();
    query.append('student_id', params.student_id.toString());
    if (params.fast) query.append('fast', '1');
    if (params.top_k) query.append('top_k', params.top_k.toString());
    return request<MatchResult[]>(`/matches?${query.toString()}`);
  },
};

// 申请 API
export const applicationApi = {
  apply: (data: { student_id: number; project_id: number }) => 
    request<Application>('/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getApplications: (params?: { 
    project_id?: number; 
    status?: string; 
    page?: number; 
    page_size?: number;
    fast?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.project_id) query.append('project_id', params.project_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    if (params?.fast) query.append('fast', '1');
    return request<ApplicationView[]>(`/applications?${query.toString()}`);
  },

  getMyApplications: (params?: { status?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    return request<ApplicationView[]>(`/applications/mine?${query.toString()}`);
  },

  updateStatus: (application_id: number, status: string) => 
    request<{ ok: boolean }>('/application/status', {
      method: 'POST',
      body: JSON.stringify({ application_id, status }),
    }),
};

// 进度跟踪 API
export const trackingApi = {
  addTracking: (data: { application_id: number; progress: string }) => 
    request<Tracking>('/tracking', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTracking: (application_id: number) => 
    request<Tracking[]>(`/tracking?application_id=${application_id}`),
};

// 反馈 API
export const feedbackApi = {
  createFeedback: (data: Partial<Feedback>) => 
    request<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 管理员 API
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  
  updateUserRole: (user_id: number, role: string) => 
    request<any>('/admin/user/role', {
      method: 'POST',
      body: JSON.stringify({ user_id, role }),
    }),
};
