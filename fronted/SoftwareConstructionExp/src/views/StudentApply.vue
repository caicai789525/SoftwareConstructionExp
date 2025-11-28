<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
const userId = Number(localStorage.getItem('user_id')||0)
const projects = ref([])
const selectedProject = ref('')
const applyMsg = ref('')
const error = ref('')
async function loadData() { try { projects.value = await api.listProjects('') } catch(e){ error.value = e.message } }
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
      <select v-model="selectedProject">
        <option value="">选择项目</option>
        <option v-for="p in projects" :value="p.id">{{ p.title }}</option>
      </select>
      <button class="btn" @click="onApply">申请</button>
      <button class="btn secondary" @click="loadData">刷新</button>
      <span style="color:#4a4">{{ applyMsg }}</span>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
