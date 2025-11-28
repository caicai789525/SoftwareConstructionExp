<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import FilterBar from '../components/FilterBar.vue'
const userId = Number(localStorage.getItem('user_id')||0)
const projects = ref([])
const title = ref('')
const desc = ref('')
const reqs = ref('')
const tags = ref('')
const createMsg = ref('')
const apps = ref([])
const appStatus = ref('')
const error = ref('')
const trackingAppId = ref('')
const progressText = ref('')

async function loadProjects() {
  try { projects.value = await api.listProjects(String(userId)) } catch(e){ error.value=e.message }
}
async function createProject() {
  try {
    const p = { teacher_id: userId, title: title.value, description: desc.value, requirements: reqs.value.split(',').map(s=>s.trim()).filter(Boolean), tags: tags.value.split(',').map(s=>s.trim()).filter(Boolean) }
    await api.createProject(p)
    createMsg.value = '项目已创建'
    await loadProjects()
  } catch(e) { error.value = e.message }
}
async function loadApplications() {
  try { apps.value = await api.listApplications(appStatus.value?`status=${appStatus.value}`:'') } catch(e){ error.value=e.message }
}
async function updateStatus(appId, status) {
  try { await api.updateApplicationStatus(appId, status); await loadApplications() } catch(e){ error.value=e.message }
}
async function addTracking() {
  try {
    if (!trackingAppId.value || !progressText.value) return
    await api.addTracking({ application_id: Number(trackingAppId.value), progress: progressText.value })
    trackingAppId.value=''; progressText.value=''
  } catch(e){ error.value=e.message }
}

onMounted(() => { loadProjects(); loadApplications() })
</script>

<template>
  <h2>教师端</h2>
  <div class="grid grid-2">
    <section class="card">
      <h3>发布项目</h3>
      <div class="toolbar">
        <label style="flex:1">标题<input v-model="title" /></label>
        <label style="flex:2">描述<textarea v-model="desc" /></label>
        <label style="flex:1">要求(逗号分隔)<input v-model="reqs" /></label>
        <label style="flex:1">标签(逗号分隔)<input v-model="tags" /></label>
        <button class="btn" @click="createProject">发布</button>
        <span style="color:#4a4">{{ createMsg }}</span>
      </div>
      <ul>
        <li v-for="p in projects" :key="p.id">{{ p.title }}</li>
      </ul>
    </section>

    <section class="card">
      <h3>实习过程跟踪</h3>
      <label>申请ID<input v-model="trackingAppId" /></label>
      <label>进度<textarea v-model="progressText" /></label>
      <button class="btn" @click="addTracking">记录进度</button>
    </section>
  </div>

  <section class="card">
    <h3>申请智能筛选</h3>
    <div class="toolbar">
      <FilterBar :options="[{value:'submitted',label:'submitted'},{value:'approved',label:'approved'},{value:'rejected',label:'rejected'}]" @update:option="v=>{appStatus=v; loadApplications()}" />
      <button class="btn secondary" @click="loadApplications">刷新</button>
    </div>
    <ul class="list">
      <li v-for="v in apps" :key="v.application.id">
        申请ID {{ v.application.id }} | 学生 {{ v.student.name }} | 项目 {{ v.project.title }} | 匹配度 {{ (v.score*100).toFixed(0) }}%
        <div class="toolbar" style="margin-top:6px">
          <button class="btn" @click="updateStatus(v.application.id,'approved')">通过</button>
          <button class="btn secondary" @click="updateStatus(v.application.id,'rejected')">拒绝</button>
        </div>
      </li>
    </ul>
  </section>

  <div class="error" v-if="error">{{ error }}</div>
</template>

<style scoped>
section { margin:0 }
label { display:block; margin:8px 0 }
input, textarea, select { width:100%; padding:6px }
.error { color:#d33; margin-top:8px }
</style>
