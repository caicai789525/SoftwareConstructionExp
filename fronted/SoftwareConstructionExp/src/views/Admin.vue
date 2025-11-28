<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import StatCard from '../components/StatCard.vue'
const stats = ref(null)
const users = ref([])
const userId = ref('')
const role = ref('student')
const msg = ref('')
const error = ref('')

async function load() {
  try {
    const [s, us] = await Promise.all([
      fetch('http://localhost:8080/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r=>r.json()),
      api.listUsers('')
    ])
    stats.value = s
    users.value = us
  } catch(e){ error.value=e.message }
}
async function updateRole() {
  try {
    const res = await fetch('http://localhost:8080/api/admin/user/role', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ user_id: Number(userId.value), role: role.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error||'更新失败')
    msg.value = '角色已更新'
    await load()
  } catch(e){ error.value=e.message }
}

onMounted(load)
</script>

<template>
  <h2>管理员端</h2>
  <div class="grid grid-3">
    <StatCard title="项目数" :value="stats?.projects||0" />
    <StatCard title="申请数" :value="stats?.applications||0" />
    <StatCard title="平均评分" :value="stats?.avg_rating?.toFixed?stats.avg_rating.toFixed(2):stats?.avg_rating||0" />
  </div>
  <section class="card" style="margin-top:16px">
    <h3>用户列表</h3>
    <ul>
      <li v-for="u in users" :key="u.id">{{ u.id }} - {{ u.name }} ({{ u.email }}) - {{ u.role }}</li>
    </ul>
  </section>

  <section class="card">
    <h3>更新用户角色</h3>
    <div class="toolbar">
      <label>用户ID<input v-model="userId" /></label>
      <label>角色<select v-model="role"><option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option></select></label>
      <button class="btn" @click="updateRole">更新</button>
      <button class="btn secondary" @click="load">刷新</button>
      <span style="color:#4a4">{{ msg }}</span>
    </div>
  </section>

  <div class="error" v-if="error">{{ error }}</div>
</template>

<style scoped>
section { margin:0 }
label { display:block; margin:8px 0 }
input, select { width:100%; padding:6px }
.error { color:#d33; margin-top:8px }
</style>
