<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import FilterBar from '../components/FilterBar.vue'
const userId = Number(sessionStorage.getItem('user_id')||0)
const matches = ref([])
const error = ref('')
const matchQuery = ref('')
async function loadData() { try { matches.value = await api.matches(userId, 'fast=1&top_k=5') } catch(e){ error.value=e.message } }
function filteredMatches() {
  if (!matchQuery.value) return matches.value
  const q = matchQuery.value.toLowerCase()
  return matches.value.filter(m => (m.project.title||'').toLowerCase().includes(q) || (m.reason||'').toLowerCase().includes(q))
}
onMounted(loadData)
</script>

<template>
  <section class="card">
    <h3>个性化匹配</h3>
    <div class="toolbar">
      <FilterBar placeholder="搜索项目或理由" @update:query="v=>matchQuery=v" />
      <button class="btn" @click="loadData">刷新</button>
    </div>
    <div v-if="filteredMatches().length===0">暂无匹配</div>
    <ul class="list">
      <li v-for="m in filteredMatches()" :key="m.project.id">
        <b>{{ m.project.title }}</b> | 匹配度: {{ (m.score*100).toFixed(0) }}% | {{ m.reason }}
      </li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
