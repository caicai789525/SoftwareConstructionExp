<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import FilterBar from '../components/FilterBar.vue'
const router = useRouter()
const userId = Number(sessionStorage.getItem('user_id')||0)
const projects = ref([])
const error = ref('')
const q = ref('')
async function loadProjects() { try { projects.value = await api.listProjects(String(userId)) } catch(e){ error.value=e.message } }
function goCreate(){ router.push('/teacher/projects/create') }
function filtered(){ if(!q.value) return projects.value; const s=q.value.toLowerCase(); return projects.value.filter(p => (p.title||'').toLowerCase().includes(s) || (p.description||'').toLowerCase().includes(s) || (p.tags||[]).some(t => (t||'').toLowerCase().includes(s))) }
onMounted(loadProjects)
</script>

<template>
  <section class="card">
    <h3>项目管理</h3>
    <div class="toolbar">
      <button class="btn" @click="goCreate">发布项目</button>
      <FilterBar placeholder="搜索标题/描述/标签" @update:query="v=>q.value=v" />
      <button class="btn secondary" @click="loadProjects">刷新列表</button>
    </div>
    <h4 style="margin:12px 0 6px">项目列表</h4>
    <ul class="list">
      <li v-for="p in filtered()" :key="p.id">
        <a href="#" @click.prevent="router.push(`/teacher/projects/${p.id}`)"><b>{{ p.title }}</b></a>
      </li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
