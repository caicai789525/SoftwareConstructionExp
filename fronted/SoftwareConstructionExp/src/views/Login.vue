<script setup>
import { ref } from "vue";
import { api } from "../api";
import { useRouter } from "vue-router";
const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
async function onLogin() {
  error.value = "";
  try {
    const { token } = await api.login(email.value, password.value);
    sessionStorage.setItem("token", token);
    const parts = token.split(".");
    if (parts.length === 3) {
      const b64url = parts[1];
      const b64 = b64url
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(b64url.length / 4) * 4, "=");
      const payload = JSON.parse(atob(b64));
      const role = payload.role;
      const uid = payload.uid || payload.user_id;
      if (role) sessionStorage.setItem("role", role);
      if (uid) sessionStorage.setItem("user_id", String(uid));
      if (role === "student") router.push("/student");
      else if (role === "teacher") router.push("/teacher");
      else if (role === "admin") router.push("/admin");
      else router.push("/");
    } else {
      router.push("/");
    }
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<template>
  <h2>登录</h2>
  <div class="form">
    <label>邮箱<input v-model="email" type="email" /></label>
    <label>密码<input v-model="password" type="password" /></label>
    <button @click="onLogin">登录</button>
    <div class="error" v-if="error">{{ error }}</div>
    <p>
      没有账号？<a href="#" @click.prevent="router.push('/register')">去注册</a>
    </p>
  </div>
</template>

<style scoped>
.form {
  max-width: 360px;
}
.form label {
  display: block;
  margin: 8px 0;
}
.form input {
  width: 100%;
  padding: 6px;
}
.error {
  color: #d33;
  margin-top: 8px;
}
</style>
