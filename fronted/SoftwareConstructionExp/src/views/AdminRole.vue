<script setup>
import { ref } from 'vue'
const userId = ref('')
const role = ref('student')
const msg = ref('')
const error = ref('')
async function updateRole() {
  try {
    const res = await fetch('http://localhost:8080/api/admin/user/role', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      body: JSON.stringify({ user_id: Number(userId.value), role: role.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error||'更新失败')
    msg.value = '角色已更新'
  } catch(e){ error.value=e.message }
}
</script>

<template>
  <section class="card">
    <h3>角色管理</h3>
    <div class="toolbar">
      <label>用户ID<input v-model="userId" /></label>
      <label>角色<select v-model="role"><option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option></select></label>
      <button class="btn" @click="updateRole">更新</button>
      <span style="color:#4a4">{{ msg }}</span>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
