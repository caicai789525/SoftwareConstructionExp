<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
const userId = Number(localStorage.getItem('user_id')||0)
const projects = ref([])
const title = ref('')
const desc = ref('')
const reqs = ref('')
const tags = ref('')
const createMsg = ref('')
const error = ref('')
async function loadProjects() { try { projects.value = await api.listProjects(String(userId)) } catch(e){ error.value=e.message } }
async function createProject() {
  try {
    const p = { teacher_id: userId, title: title.value, description: desc.value, requirements: reqs.value.split(',').map(s=>s.trim()).filter(Boolean), tags: tags.value.split(',').map(s=>s.trim()).filter(Boolean) }
    await api.createProject(p)
    createMsg.value = '项目已创建'
    await loadProjects()
  } catch(e) { error.value = e.message }
}
onMounted(loadProjects)
</script>

<template>
  <section class="card">
    <h3>项目管理</h3>
    <div class="toolbar">
      <label style="flex:1">标题<input v-model="title" /></label>
      <label style="flex:2">描述<textarea v-model="desc" /></label>
      <label style="flex:1">要求(逗号分隔)<input v-model="reqs" /></label>
      <label style="flex:1">标签(逗号分隔)<input v-model="tags" /></label>
      <button class="btn" @click="createProject">发布</button>
      <button class="btn secondary" @click="loadProjects">刷新</button>
      <span style="color:#4a4">{{ createMsg }}</span>
    </div>
    <h4 style="margin:12px 0 6px">项目列表</h4>
    <ul class="list">
      <li v-for="p in projects" :key="p.id">{{ p.title }}</li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
