const BASE = 'http://localhost:8080/api'

function authHeaders() {
  const token = sessionStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}), ...authHeaders() },
  })
  const ct = res.headers.get('content-type')||''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) throw new Error((data && data.error) || data || '请求失败')
  return data
}

export const api = {
  register: (body) => req('/auth/register', { method:'POST', body: JSON.stringify(body) }),
  login: async (email, password) => {
    const res = await req('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
    return res
  },
  listUsers: (role) => req(`/users${role?`?role=${encodeURIComponent(role)}`:''}`),
  getUser: (id) => req(`/users/${id}`),
  me: () => req(`/me`),
  updateMe: (body) => req('/me', { method:'PUT', body: JSON.stringify(body) }),
  createUser: (u) => req('/users', { method:'POST', body: JSON.stringify(u) }),
  listProjects: (teacher_id) => req(`/projects${teacher_id?`?teacher_id=${teacher_id}`:''}`),
  createProject: (p) => req('/projects', { method:'POST', body: JSON.stringify(p) }),
  matches: (student_id, params) => req(`/matches?student_id=${student_id}${params?`&${params}`:''}`),
  apply: (a) => req('/apply', { method:'POST', body: JSON.stringify(a) }),
  listApplications: (params) => req(`/applications${params?`?${params}`:''}`),
  listMyApplications: (params) => req(`/applications/mine${params?`?${params}`:''}`),
  updateApplicationStatus: (application_id, status) => req('/application/status', { method:'POST', body: JSON.stringify({ application_id, status }) }),
  addTracking: (t) => req('/tracking', { method:'POST', body: JSON.stringify(t) }),
  listTrackings: (application_id) => req(`/tracking?application_id=${application_id}`),
  addFeedback: (f) => req('/feedback', { method:'POST', body: JSON.stringify(f) }),
  listDocuments: (application_id) => req(`/documents?application_id=${application_id}`),
}

export async function uploadDocument(application_id, file) {
  const form = new FormData()
  form.append('application_id', application_id)
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method:'POST', headers: authHeaders(), body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error||'上传失败')
  return data
}
