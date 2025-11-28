<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
const router = useRouter();
const route = useRoute();
const authed = ref(!!localStorage.getItem("token"));
const role = ref(localStorage.getItem("role") || "");
const isAuthRoute = computed(
  () => route.path === "/login" || route.path === "/register"
);
function refreshAuth() {
  authed.value = !!localStorage.getItem("token");
  role.value = localStorage.getItem("role") || "";
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  refreshAuth();
  router.push("/login");
}
onMounted(() => {
  refreshAuth();
  router.afterEach(() => refreshAuth());
});
</script>

<template>
  <header v-if="!isAuthRoute" class="nav">
    <div class="brand">SoftwareConstructionExp</div>
    <nav>
      <a v-if="!authed" href="#" @click.prevent="router.push('/login')">登录</a>
      <a v-if="!authed" href="#" @click.prevent="router.push('/register')"
        >注册</a
      >
      <a
        v-if="role === 'student'"
        href="#"
        @click.prevent="router.push('/student')"
        >学生端</a
      >
      <a
        v-if="role === 'teacher'"
        href="#"
        @click.prevent="router.push('/teacher')"
        >教师端</a
      >
      <a v-if="role === 'admin'" href="#" @click.prevent="router.push('/admin')"
        >管理员端</a
      >
      <a v-if="authed" href="#" @click.prevent="logout">退出登录</a>
    </nav>
  </header>
  <div v-if="!isAuthRoute" class="layout">
    <Sidebar />
    <main class="container">
      <router-view />
    </main>
  </div>
  <main v-else class="auth-container">
    <router-view />
  </main>
  <footer v-if="!isAuthRoute" class="footer">Powered by Vite + Vue</footer>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
}
.brand {
  font-weight: 600;
}
.nav a {
  margin: 0 8px;
}
.layout {
  display: flex;
}
.container {
  flex: 1;
  padding: 16px;
}
.auth-container {
  max-width: 480px;
  margin: 40px auto;
  padding: 16px;
}
.footer {
  padding: 12px;
  text-align: center;
  color: #888;
}
</style>
