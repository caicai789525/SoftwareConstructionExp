<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import FilterBar from '../components/FilterBar.vue'
const apps = ref([])
const appStatus = ref('')
const error = ref('')
async function loadApplications() {
  try { apps.value = await api.listApplications(appStatus.value?`status=${appStatus.value}`:'') } catch(e){ error.value=e.message }
}
async function updateStatus(appId, status) {
  try { await api.updateApplicationStatus(appId, status); await loadApplications() } catch(e){ error.value=e.message }
}
onMounted(loadApplications)
</script>

<template>
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
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
