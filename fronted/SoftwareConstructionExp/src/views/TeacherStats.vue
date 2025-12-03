<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import StatCard from '../components/StatCard.vue'
import FilterBar from '../components/FilterBar.vue'
const userId = Number(sessionStorage.getItem('user_id')||0)
const projects = ref([])
const apps = ref([])
const error = ref('')
const q = ref('')
async function load() {
  try {
    const [ps, av] = await Promise.all([
      api.listProjects(String(userId)),
      api.listApplications('fast=1')
    ])
    projects.value = ps
    apps.value = av.filter(v => v.project && Number(v.project.teacher_id) === userId)
  } catch(e){ error.value = e.message }
}
function statusCount() {
  const m = {}
  for (const v of apps.value) { const s = v.application.status; m[s] = (m[s]||0)+1 }
  return m
}
function avgScore() {
  if (apps.value.length===0) return 0
  let sum=0; for (const v of apps.value) sum += (v.score||0)
  return (sum/apps.value.length)
}
function filteredApps(){
  if (!q.value) return apps.value
  const s = q.value.toLowerCase()
  return apps.value.filter(v => (v.project.title||'').toLowerCase().includes(s) || (v.student.name||'').toLowerCase().includes(s) || (v.application.status||'').toLowerCase().includes(s))
}
onMounted(load)
</script>

<template>
  <section class="card">
    <h3>数据统计分析看板</h3>
    <div class="grid grid-3" style="margin-top:8px">
      <StatCard title="我的项目" :value="projects.length" />
      <StatCard title="学生申请" :value="apps.length" />
      <StatCard title="平均匹配度" :value="(avgScore()*100).toFixed(0) + '%'" />
    </div>
    <div class="toolbar" style="margin-top:12px">
      <FilterBar placeholder="搜索项目/学生/状态" @update:query="v=>q.value=v" />
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <h4 style="margin:12px 0 6px">申请状态分布</h4>
    <ul class="list">
      <li v-for="(cnt, st) in statusCount()" :key="st">{{ st }}：{{ cnt }}</li>
    </ul>
    <h4 style="margin:12px 0 6px">最近申请</h4>
    <ul class="list">
      <li v-for="v in filteredApps()" :key="v.application.id">
        学生 {{ v.student.name }} 申请项目 <b>{{ v.project.title }}</b> | 状态 {{ v.application.status }} | 匹配度 {{ (v.score*100).toFixed(0) }}%
      </li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
