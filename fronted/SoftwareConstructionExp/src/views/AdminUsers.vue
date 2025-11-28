<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
const users = ref([])
const error = ref('')
async function load() { try { users.value = await api.listUsers('') } catch(e){ error.value=e.message } }
onMounted(load)
</script>

<template>
  <section class="card">
    <h3>用户列表</h3>
    <div class="toolbar">
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <ul class="list">
      <li v-for="u in users" :key="u.id">{{ u.id }} - {{ u.name }} ({{ u.email }}) - {{ u.role }}</li>
    </ul>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
