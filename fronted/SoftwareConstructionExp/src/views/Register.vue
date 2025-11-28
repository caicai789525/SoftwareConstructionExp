<script setup>
import { ref } from 'vue'
import { api } from '../api'
import { useRouter } from 'vue-router'
const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('student')
const skills = ref('')
const error = ref('')
async function onRegister() {
  error.value = ''
  try {
    const body = { name: name.value, email: email.value, password: password.value, role: role.value, skills: skills.value.split(',').map(s=>s.trim()).filter(Boolean) }
    await api.register(body)
    router.push('/login')
  } catch(e) { error.value = e.message }
}
</script>

<template>
  <h2>注册</h2>
  <div class="form">
    <label>姓名<input v-model="name" /></label>
    <label>邮箱<input v-model="email" type="email" /></label>
    <label>密码<input v-model="password" type="password" /></label>
    <label>角色
      <select v-model="role">
        <option value="student">学生</option>
        <option value="teacher">教师</option>
        <option value="admin">管理员</option>
      </select>
    </label>
    <label v-if="role==='student'">技能(逗号分隔)<input v-model="skills" placeholder="如: python, nlp" /></label>
    <button @click="onRegister">注册</button>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.form { max-width: 420px }
.form label { display:block; margin:8px 0 }
.form input, select { width:100%; padding:6px }
.error { color:#d33; margin-top:8px }
</style>
