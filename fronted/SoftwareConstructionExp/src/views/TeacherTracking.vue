<script setup>
import { ref } from 'vue'
import { api } from '../api'
const trackingAppId = ref('')
const progressText = ref('')
const error = ref('')
async function addTracking() {
  try {
    if (!trackingAppId.value || !progressText.value) return
    await api.addTracking({ application_id: Number(trackingAppId.value), progress: progressText.value })
    trackingAppId.value=''; progressText.value=''
  } catch(e){ error.value=e.message }
}
</script>

<template>
  <section class="card">
    <h3>实习过程跟踪</h3>
    <div class="toolbar">
      <label>申请ID<input v-model="trackingAppId" /></label>
      <label>进度<textarea v-model="progressText" /></label>
      <button class="btn" @click="addTracking">记录进度</button>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </section>
</template>

<style scoped>
.error { color:#d33; margin-top:8px }
</style>
