<script setup>
import { ref, onMounted } from 'vue'
import StatCard from '../components/StatCard.vue'
const stats = ref(null)
async function load() {
  const res = await fetch('http://localhost:8080/api/admin/stats', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } })
  stats.value = await res.json()
}
onMounted(load)
</script>

<template>
  <div class="grid grid-3">
    <StatCard title="项目数" :value="stats?.projects||0" />
    <StatCard title="申请数" :value="stats?.applications||0" />
    <StatCard title="平均评分" :value="stats?.avg_rating?.toFixed?stats.avg_rating.toFixed(2):stats?.avg_rating||0" />
  </div>
</template>
