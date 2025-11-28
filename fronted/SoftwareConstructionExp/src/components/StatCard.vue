<script setup>
const props = defineProps({ title: String, value: [String, Number] })
</script>

<template>
  <div class="stat">
    <div class="t">{{ props.title }}</div>
    <div class="v">{{ props.value }}</div>
  </div>
</template>

<style scoped>
.stat { padding:16px; border-radius:12px; border:1px solid #eee }
.t { color:#666; font-size:14px }
.v { font-size:24px; font-weight:700; margin-top:6px }
</style>
