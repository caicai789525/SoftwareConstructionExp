import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import StudentMatch from "./views/StudentMatch.vue";
import StudentApply from "./views/StudentApply.vue";
import StudentApplications from "./views/StudentApplications.vue";
import StudentDocs from "./views/StudentDocs.vue";
import StudentProfile from "./views/StudentProfile.vue";
import TeacherProjects from "./views/TeacherProjects.vue";
import TeacherProjectCreate from "./views/TeacherProjectCreate.vue";
import TeacherProjectDetail from "./views/TeacherProjectDetail.vue";
import TeacherTracking from "./views/TeacherTracking.vue";
import TeacherApplications from "./views/TeacherApplications.vue";
import TeacherStats from "./views/TeacherStats.vue";
import AdminStats from "./views/AdminStats.vue";
import AdminUsers from "./views/AdminUsers.vue";
import AdminRole from "./views/AdminRole.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/student", redirect: "/student/match" },
  { path: "/student/match", component: StudentMatch },
  { path: "/student/apply", component: StudentApply },
  { path: "/student/applications", component: StudentApplications },
  { path: "/student/docs", component: StudentDocs },
  { path: "/student/profile", component: StudentProfile },
  { path: "/teacher", redirect: "/teacher/applications" },
  { path: "/teacher/projects", component: TeacherProjects },
  { path: "/teacher/projects/create", component: TeacherProjectCreate },
  { path: "/teacher/projects/:id", component: TeacherProjectDetail },
  { path: "/teacher/tracking", component: TeacherTracking },
  { path: "/teacher/applications", component: TeacherApplications },
  { path: "/teacher/stats", component: TeacherStats },
  { path: "/admin", redirect: "/admin/stats" },
  { path: "/admin/stats", component: AdminStats },
  { path: "/admin/users", component: AdminUsers },
  { path: "/admin/role", component: AdminRole },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  if (!token && to.path !== "/login" && to.path !== "/register") {
    next("/login");
    return;
  }
  if (to.path.startsWith("/student") && role !== "student")
    return next(role ? `/${role}` : "/login");
  if (to.path.startsWith("/teacher") && role !== "teacher")
    return next(role ? `/${role}` : "/login");
  if (to.path.startsWith("/admin") && role !== "admin")
    return next(role ? `/${role}` : "/login");
  next();
});

export default router;
