<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Sidebar from "./components/Sidebar.vue";
import { api } from "./api";
const router = useRouter();
const route = useRoute();
const authed = ref(!!sessionStorage.getItem("token"));
const role = ref(sessionStorage.getItem("role") || "");
const me = ref(null);
const isAuthRoute = computed(
  () => route.path === "/login" || route.path === "/register"
);
function refreshAuth() {
  authed.value = !!sessionStorage.getItem("token");
  role.value = sessionStorage.getItem("role") || "";
  if (authed.value) {
    api
      .me()
      .then((u) => {
        me.value = u;
      })
      .catch(() => {
        me.value = null;
      });
  } else {
    me.value = null;
  }
}
function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("user_id");
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
      <span v-if="me" class="user-info"
        >{{ me.name }} · {{ me.email }} · {{ me.role }}</span
      >
      <span v-if="role === 'student'" class="role-tag">学生端</span>
      <span v-if="role === 'teacher'" class="role-tag">教师端</span>
      <span v-if="role === 'admin'" class="role-tag">管理员端</span>
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
.role-tag {
  display: inline-block;
  padding: 6px 10px;
  border: 1px solid #eee;
  border-radius: 999px;
  margin: 0 8px;
}
.user-info {
  margin: 0 8px;
  opacity: 0.85;
}
</style>
