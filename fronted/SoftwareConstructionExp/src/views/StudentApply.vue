<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import FilterBar from '../components/FilterBar.vue'
const userId = Number(sessionStorage.getItem('user_id')||0)
const projects = ref([])
const selectedProject = ref('')
const applyMsg = ref('')
const error = ref('')
const q = ref('')
async function loadData() { try { projects.value = await api.listProjects('') } catch(e){ error.value = e.message } }
function filtered(){ if(!q.value) return projects.value; const s=q.value.toLowerCase(); return projects.value.filter(p => (p.title||'').toLowerCase().includes(s) || (p.description||'').toLowerCase().includes(s) || (p.tags||[]).some(t => (t||'').toLowerCase().includes(s))) }
async function onApply() {
  try {
    const pid = Number(selectedProject.value)
    if (!pid) return
    await api.apply({ student_id: userId, project_id: pid })
    applyMsg.value = '已提交申请'
  } catch(e) { error.value = e.message }
}
onMounted(loadData)
</script>

<template>
  <section class="card">
    <h3>一键申请</h3>
    <div class="toolbar">
      <FilterBar placeholder="搜索项目" @update:query="v=>q.value=v" />
      <select v-model="selectedProject">
        <option value="">选择项目</option>
        <option v-for="p in filtered()" :value="p.id">{{ p.title }}</option>
      </select>
      <button class="btn" @click="onApply">申请</button>
      <button class="btn secondary" @click="loadData">刷新</button>
      <span style="color:#4a4">{{ applyMsg }}</span>
    </div>
    <ul class="list">
      <li v-for="p in filtered()" :key="p.id"><b>{{ p.title }}</b> | {{ p.description }}</li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
