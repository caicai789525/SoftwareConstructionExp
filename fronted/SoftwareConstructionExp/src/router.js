import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import StudentMatch from './views/StudentMatch.vue'
import StudentApply from './views/StudentApply.vue'
import StudentApplications from './views/StudentApplications.vue'
import StudentDocs from './views/StudentDocs.vue'
import TeacherProjects from './views/TeacherProjects.vue'
import TeacherTracking from './views/TeacherTracking.vue'
import TeacherApplications from './views/TeacherApplications.vue'
import AdminStats from './views/AdminStats.vue'
import AdminUsers from './views/AdminUsers.vue'
import AdminRole from './views/AdminRole.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/student', redirect: '/student/match' },
  { path: '/student/match', component: StudentMatch },
  { path: '/student/apply', component: StudentApply },
  { path: '/student/applications', component: StudentApplications },
  { path: '/student/docs', component: StudentDocs },
  { path: '/teacher', redirect: '/teacher/applications' },
  { path: '/teacher/projects', component: TeacherProjects },
  { path: '/teacher/tracking', component: TeacherTracking },
  { path: '/teacher/applications', component: TeacherApplications },
  { path: '/admin', redirect: '/admin/stats' },
  { path: '/admin/stats', component: AdminStats },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/role', component: AdminRole },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login')
    return
  }
  if (to.path.startsWith('/student') && role !== 'student') return next('/')
  if (to.path.startsWith('/teacher') && role !== 'teacher') return next('/')
  if (to.path.startsWith('/admin') && role !== 'admin') return next('/')
  next()
})

export default router
