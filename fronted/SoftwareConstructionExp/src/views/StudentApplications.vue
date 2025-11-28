<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
const myApps = ref([])
const error = ref('')
async function load() { try { myApps.value = await api.listMyApplications('') } catch(e){ error.value=e.message } }
onMounted(load)
</script>

<template>
  <section class="card">
    <h3>我的申请</h3>
    <div class="toolbar">
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <ul class="list">
      <li v-for="v in myApps" :key="v.application.id">
        <b>{{ v.project.title }}</b> | 状态: {{ v.application.status }} | 匹配度: {{ (v.score*100).toFixed(0) }}%
      </li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
